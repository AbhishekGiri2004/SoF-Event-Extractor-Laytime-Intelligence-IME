import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function GoogleSignInButton({ className = '' }) {
  const { handleGoogleSuccess, handleGoogleError, handleEmailSignIn } = useAuth()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  
  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (email && name) {
      handleEmailSignIn({ email, name })
      setShowEmailForm(false)
    }
  }
  
  return (
    <div className={className}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={(error) => {
          console.log('Google OAuth error:', error)
          handleGoogleError()
        }}
        useOneTap={false}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        auto_select={false}
        cancel_on_tap_outside={true}
      />
      
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500 mb-2">or</div>
        {!showEmailForm ? (
          <button
            onClick={() => setShowEmailForm(true)}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Sign in with Email
          </button>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}