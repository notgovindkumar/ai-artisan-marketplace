import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Firebase Configuration
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "sujaan-haat-ai.firebaseapp.com",
  projectId: "sujaan-haat-ai",
  storageBucket: "sujaan-haat-ai.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
