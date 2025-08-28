import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Get Google OAuth Client ID from environment
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Check if Google OAuth is properly configured
if (!googleClientId || googleClientId === 'your-google-client-id.apps.googleusercontent.com') {
  console.warn('Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env.local file.');
  console.warn('Get your Client ID from: https://console.cloud.google.com/');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || 'dummy-client-id'}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
