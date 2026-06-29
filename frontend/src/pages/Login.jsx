import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { API_URL } from './dashboardData.js'
import logo from '../assets/eugia.jpg'

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  })
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setLoginInfo({ ...loginInfo, [name]: value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!loginInfo.email || !loginInfo.password) {
      toast.error('Email and password are required')
      return
    }

    try {
      const url = `${API_URL}/auth/login`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginInfo)
      })
      const result = await response.json()
      const { success, message, jwtToken, name, error } = result

      if (response.ok && success) {
        localStorage.setItem('token', jwtToken)
        localStorage.setItem('loggedInUser', name)
        localStorage.setItem('loggedInEmail', loginInfo.email)
        toast.success(message)
        setTimeout(() => {
          navigate('/home')
        }, 1000)
      } else if (error) {
        toast.error(error?.details?.[0]?.message || message)
      } else {
        toast.error(message || 'Login failed')
      }
    } catch (err) {
      toast.error('Cannot connect to backend. Please try again later.')
      console.error('Login request failed:', err)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <div className="auth-brand">
          <img src={logo} alt="Eugia Pharma" className="auth-logo" />
          <div className="brand-copy">
            <p className="brand-eyebrow">Eugia Pharma </p>
            <h1>Secure sign in</h1>
            <p className="brand-subtitle">Access the internal warehouse operations portal.</p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-with-icon">
            <span className="field-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16v16H4z" />
                <path d="M22 6L12 13 2 6" />
              </svg>
            </span>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              name="email"
              value={loginInfo.email}
              onChange={handleChange}
              autoFocus
              autoComplete="username"
              inputMode="email"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-icon">
            <span className="field-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              name="password"
              value={loginInfo.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
        </div>

        <button className="primary-button" type="submit">
          Sign In
        </button>

        <p className="auth-switch">
          Do not have an account? <Link to="/signup">Sign up</Link>
        </p>

        <p className="auth-footer">© 2025 Eugia Pharma . All Rights Reserved.</p>
      </form>
    </div>
  )
}

export default Login
