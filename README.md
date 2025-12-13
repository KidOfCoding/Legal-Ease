# Legal Assistant India

A mobile application that provides step-by-step legal guidance using Google Gemini AI, specifically tailored for Indian law. Users can ask legal questions in English or Hindi and receive AI-generated guidance.

## 🔗 Links

- **📱 Download APK**: [Click here to install](https://expo.dev/accounts/dannycharlees-organization/projects/legalease/builds/2108fcd6-aa3d-4ee6-b4b5-026a307ec160)
- **🌐 Website**: [Visit LegalEase](https://legal-assistant-app-five.vercel.app/)

## Features

- **Ask Legal Questions**: Enter any legal question and get detailed step-by-step guidance
- **Language Support**: Choose between English and Hindi
- **Question History**: View your last 5 questions and answers
- **AI-Powered**: Uses Google Gemini AI for intelligent legal guidance
- **Mobile-First**: Built with Expo for seamless mobile experience

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB (Mongoose)
- **Storage**: Cloudinary (for images and PDFs)
- **AI**: Google Gemini API
- **Navigation**: Expo Router with Tabs

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your credentials:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# API URL (For Production/Vercel)
EXPO_PUBLIC_API_URL=https://your-vercel-project.vercel.app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the App

```bash
npm run dev
```

Then:
- Press `a` to open in Android emulator
- Scan QR code with Expo Go app on your phone

## Database Schema

The app uses a MongoDB collection `legalqas`:

```javascript
{
  question: String,
  answer: String,
  language: String, // 'english' or 'hindi'
  fileUrl: String,  // URL from Cloudinary
  fileType: String, // 'image' or 'document'
  createdAt: Date
}
```

## API Endpoints

### POST /api/ask-legal
Accepts a legal question, language, and optional file. Queries Gemini AI, stores the Q&A in MongoDB, and returns the answer.

**Request:**
```json
{
  "question": "How to register a shop?",
  "language": "english",
  "file": {
    "base64": "...",
    "mimeType": "image/jpeg"
  }
}
```

### GET /api/history
Returns the last 5 question-answer pairs from MongoDB.

## Features

- **Ask Legal Questions**: Enter any legal question and get detailed step-by-step guidance
- **File Analysis**: Upload images or PDFs for AI analysis
- **Language Support**: Choose between English and Hindi
- **Question History**: View your last 5 questions and answers with attached files
- **AI-Powered**: Uses Google Gemini AI (gemini-2.0-flash)
- **Creator Signature**: Custom signature component

## License

MIT
