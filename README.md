# Firebase AI Studio React Application

A complete React application for Firebase AI Studio with chat and live API features.

## Features

- Chat interface with dual sidebars
- Live API page for voice/video conversations
- Multiple AI model support
- Theme switching (dark/light mode)
- File upload support
- Voice and video recording
- Firebase integration
- Conversation history

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd firebase-ai-studio
```

2. Create a `.env` file in the root directory with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
src/
  ├── components/
  │   ├── Chat/
  │   │   ├── ChatInterface.jsx
  │   │   └── MessageBubble.jsx
  │   ├── Layout/
  │   │   ├── LeftSidebar.jsx
  │   │   └── RightSidebar.jsx
  │   └── LiveAPI/
  │       └── LiveAPIPage.jsx
  ├── contexts/
  │   ├── ThemeContext.jsx
  │   └── ChatContext.jsx
  ├── firebase-config.js
  └── utils/
web/
  ├── App.jsx
  ├── index.html
  ├── main.js
  └── style.css
```

## Available Scripts

- `npm start`: Starts the development server
- `npm run build`: Builds the app for production
- `npm run preview`: Preview the production build locally

## Firebase Configuration

Make sure you have:
1. Created a Firebase project
2. Enabled Authentication
3. Set up Firestore Database
4. Configured Firebase App Check
5. Set up the necessary security rules

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request