import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String },
    attemptsLeft: { type: Number, default: 3 },
    lastLogin: { type: Date, default: Date.now },
});

// Prevent overwriting model if it already exists
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
