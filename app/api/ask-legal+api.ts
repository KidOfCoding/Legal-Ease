import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import connectToDatabase from '../../lib/db';
import User from '../../lib/models/User';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define Schema
const LegalQASchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    language: { type: String, required: true },
    fileUrl: { type: String },
    fileType: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Prevent overwriting model if it already exists
const LegalQA = mongoose.models.LegalQA || mongoose.model('LegalQA', LegalQASchema);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { question, language, file, userId } = body;

        if (!userId) {
            return Response.json({ error: 'Unauthorized: User ID required' }, { status: 401 });
        }

        if (!question && !file) {
            return Response.json(
                { error: 'Question or file is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // CHECK ATTEMPTS
        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.attemptsLeft <= 0) {
            return Response.json(
                { error: 'Free quota exceeded. You have 0 attempts left.' },
                { status: 403 }
            );
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return Response.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const languageName = language === 'hindi' ? 'Hindi' : 'English';
        let prompt = `You are a helpful Indian legal assistant. Provide simple, step-by-step legal guidance based on Indian law. Respond in ${languageName}. Always suggest consulting a lawyer if the issue is serious.`;

        if (question) {
            prompt += `\n\nQuestion: ${question}`;
        }

        if (file) {
            prompt += `\n\nAnalyze the attached document/image and answer the question based on it.`;
        }

        const parts: any[] = [{ text: prompt }];
        let fileUrl = null;
        let fileType = null;

        if (file) {
            // file object should contain { base64: string, mimeType: string }
            parts.push({
                inlineData: {
                    data: file.base64,
                    mimeType: file.mimeType,
                },
            });

            // Upload to Cloudinary
            try {
                const base64Data = `data:${file.mimeType};base64,${file.base64}`;
                const uploadResult = await cloudinary.uploader.upload(base64Data, {
                    folder: 'legal-app',
                    resource_type: 'auto',
                    access_mode: 'public', // Ensure file is public
                });
                fileUrl = uploadResult.secure_url;
                fileType = file.mimeType.startsWith('image/') ? 'image' : 'document';
            } catch (uploadError) {
                console.error('Cloudinary upload failed:', uploadError);
                // Continue without saving file URL if upload fails, but log it
            }
        }

        // Generate Content
        const result = await model.generateContent(parts);
        const response = await result.response;
        const answer = response.text();

        // DECREMENT ATTEMPTS
        user.attemptsLeft = Math.max(0, user.attemptsLeft - 1);
        await user.save();

        // Store in MongoDB
        const newQA = await LegalQA.create({
            question: question || 'File Analysis',
            answer,
            language,
            fileUrl,
            fileType,
        });

        return Response.json({
            answer,
            question: newQA.question,
            language,
            id: newQA._id,
            fileUrl,
            attemptsLeft: user.attemptsLeft // Return updated count
        });

    } catch (error: any) {
        console.error('Error:', error);
        return Response.json(
            { error: error.message || 'An error occurred' },
            { status: 500 }
        );
    }
}
