import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const location = useLocation()
    const state = location.state || {}
    const [mobile, setMobile] = useState(state.mobile || '')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login, loading, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/app/dashboard', { replace: true })
        }
    }, [isAuthenticated, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        const result = await login(mobile, password)
        if (!result.success) {
            setError(result.error)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <img src="/logo.png?v=2" alt="Tuition Manager Logo" style={{ height: '80px', width: '100%', objectFit: 'contain', display: 'block', margin: '0 auto 1.5rem' }} />
                <p className="subtitle">Multi-Branch Tuition Management</p>

                {state.branchName && (
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center', background: 'var(--color-primary-light)', padding: '0.75rem', borderRadius: '8px', color: 'var(--color-primary)' }}>
                        Logging into <strong style={{ fontWeight: 800 }}>{state.branchName}</strong>
                    </div>
                )}

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Mobile Number</label>
                        <input
                            className="form-input"
                            type="tel"
                            placeholder="Enter mobile number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            required
                            id="login-mobile"
                            readOnly={!!state.mobile}
                            style={state.mobile ? { backgroundColor: 'var(--color-background)', opacity: 0.7, cursor: 'not-allowed' } : {}}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            id="login-password"
                        />
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                        <Link to="/forgot-password" style={{ color: '#a5b4fc', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot Password?</Link>
                    </div>
                    <button className="login-btn" type="submit" disabled={loading} id="login-submit">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: '#818cf8', fontSize: '0.75rem', marginTop: '1.5rem', opacity: 0.7 }}>
                    Demo: username <strong>demo</strong>, password <strong>demo1234</strong>
                </p>

                <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link to="/" style={{ color: '#a5b4fc', fontSize: '0.85rem', textDecoration: 'none' }}>← Change Branch</Link>
                </p>
            </div>
        </div>
    )
}
