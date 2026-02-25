import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1) // 1: Request OTP, 2: Verify & Reset
    const [mobile, setMobile] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleRequestOTP = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await axios.post('http://localhost:8000/api/auth/request-otp/', { mobile })
            setMessage('OTP sent to your mobile number')
            setStep(2)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')
        try {
            await axios.post('http://localhost:8000/api/auth/reset-password/', { mobile, otp, new_password: newPassword })
            setMessage('Password reset successfully! Redirecting to login...')
            setStep(1) // Reset state conceptually
            setTimeout(() => navigate('/login'), 2000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>{step === 1 ? 'Forgot Password?' : 'Reset Password'}</h1>
                <p className="subtitle">
                    {step === 1 ? 'Enter your mobile number to receive an OTP' : 'Enter OTP and your new password'}
                </p>

                {error && <div className="login-error">{error}</div>}
                {message && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{message}</div>}

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP}>
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input
                                className="form-input"
                                type="tel"
                                placeholder="Enter mobile number"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                required
                            />
                        </div>
                        <button className="login-btn" type="submit" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label>OTP</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="login-btn" type="submit" disabled={loading}>
                            {loading ? 'Resetting...' : 'Verify & Reset Password'}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link to="/login" style={{ color: '#a5b4fc', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Login</Link>
                </p>
            </div>
        </div>
    )
}
