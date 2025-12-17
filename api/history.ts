import mongoose from 'mongoose';
import connectToDatabase from '../lib/db';

// Reuse the schema/model (ensure it matches the one in ask-legal)
const LegalQASchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    language: { type: String, required: true },
    fileUrl: { type: String },
    fileType: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const LegalQA = mongoose.models.LegalQA || mongoose.model('LegalQA', LegalQASchema);

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: User ID required' });
        }

        await connectToDatabase();

        const history = await LegalQA.find({ userId } as any)
            .sort({ createdAt: -1 })
            .limit(10); // Increased limit slightly for better UX

        const formattedHistory = history.map((item: any) => ({
            id: item._id.toString(),
            question: item.question,
            answer: item.answer,
            language: item.language,
            fileUrl: item.fileUrl,
            fileType: item.fileType,
            created_at: item.createdAt,
        }));

        return res.status(200).json({ history: formattedHistory });
    } catch (error: any) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message || 'An error occurred' });
    }
}
