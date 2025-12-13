import mongoose from 'mongoose';
import connectToDatabase from '../../lib/db';

// Reuse the schema/model (ensure it matches the one in ask-legal)
const LegalQASchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    language: { type: String, required: true },
    fileUrl: { type: String },
    fileType: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const LegalQA = mongoose.models.LegalQA || mongoose.model('LegalQA', LegalQASchema);

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const history = await LegalQA.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const formattedHistory = history.map((item: any) => ({
            id: item._id.toString(),
            question: item.question,
            answer: item.answer,
            language: item.language,
            fileUrl: item.fileUrl,
            fileType: item.fileType,
            created_at: item.createdAt,
        }));

        return Response.json({ history: formattedHistory });
    } catch (error: any) {
        console.error('Error:', error);
        return Response.json(
            { error: error.message || 'An error occurred' },
            { status: 500 }
        );
    }
}
