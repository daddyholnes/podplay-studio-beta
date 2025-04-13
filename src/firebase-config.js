  import { initializeApp } from '@firebase/app';
  import { getFirestore } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
  import { getVertexAI, getGenerativeModel } from '@firebase/vertexai';
  import { initializeAppCheck, ReCaptchaV3Provider } from '@firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Vertex AI
const vertexAI = getVertexAI(app);

// Create a generative model instance
export const geminiModel = getGenerativeModel(vertexAI, {
  model: 'gemini-2.0-flash' // Choose appropriate model for your use case
});

// Initialize App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true
});

export { app, vertexAI };