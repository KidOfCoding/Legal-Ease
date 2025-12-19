import connectToDatabase from '../../lib/db';
import User from '../../lib/models/User';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const email = url.searchParams.get('email');

        if (!userId) {
            return Response.json({ error: 'UserId is required' }, { status: 400 });
        }

        await connectToDatabase();

        // Find or Create User
        let user = await User.findOne({ firebaseUid: userId });

        if (!user) {
            console.log('Creating new user in DB:', userId);
            user = await User.create({
                firebaseUid: userId,
                email: email || '',
                attemptsLeft: 3, // Default 3 attempts
            });
        }

        return Response.json({
            attemptsLeft: user.attemptsLeft,
            email: user.email,
            lastLogin: user.lastLogin
        });

    } catch (error: any) {
        console.error('User API Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
