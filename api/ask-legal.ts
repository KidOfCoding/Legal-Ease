import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import connectToDatabase from '../lib/db';

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

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;
        const { question, language, file } = body;

        if (!question && !file) {
            return res.status(400).json({ error: 'Question or file is required' });
        }

        await connectToDatabase();

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
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
                    access_mode: 'public',
                });
                fileUrl = uploadResult.secure_url;
                fileType = file.mimeType.startsWith('image/') ? 'image' : 'document';
            } catch (uploadError) {
                console.error('Cloudinary upload failed:', uploadError);
            }
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const answer = response.text();

        // Store in MongoDB
        const newQA = await LegalQA.create({
            question: question || 'File Analysis',
            answer,
            language,
            fileUrl,
            fileType,
        });

        return res.status(200).json({
            answer,
            question: newQA.question,
            language,
            id: newQA._id,
            fileUrl,
        });

    } catch (error: any) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message || 'An error occurred' });
    }
}
