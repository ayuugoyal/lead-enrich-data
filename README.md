# Lead Enrichment Preview Tool

This project is a full-stack application that demonstrates a lead enrichment tool. It consists of a Next.js frontend with Firebase authentication and a Flask backend that uses Google's Gemini API for lead data enrichment.

## Why Google Gemini?

We chose to use Google's Gemini API for lead enrichment because:
- Clearbit was experiencing sign-in issues at the time of development.
- Other similar services required paid subscriptions.
- Gemini provides a flexible, AI-powered solution for generating company information.

## Prerequisites

- Node.js (v14 or later)
- Python (v3.7 or later)
- Google Cloud account with Gemini API access
- Firebase project

## Local Installation and Setup

### Backend (Flask Server)

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows: `venv\\Scripts\\activate`
   - On macOS and Linux: `source venv/bin/activate`

4. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env` file in the server directory with your Google AI API key:
   ```
   GOOGLE_API_KEY=your_google_ai_api_key_here
   ```

### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Create a `.env.local` file in the frontend directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## Running the Application

1. Start the backend server:
   - In the server directory:
     ```
     python app.py
     ```
   - The server will start on `http://localhost:5000`

2. Start the frontend development server:
   - In the frontend directory:
     ```
     npm run dev
     ```
   - The frontend will be available at `http://localhost:3000`

3. Open your browser and navigate to `http://localhost:3000` to use the application.

## Usage

1. Log in using your Google account.
2. Enter a company name and website URL.
3. Click "Enrich Lead" to get AI-generated information about the company.

