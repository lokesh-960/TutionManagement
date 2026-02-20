import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const [username, setUsername] = useState('')
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
        const result = await login(username, password)
        if (result.success) {
            navigate('/app/dashboard')
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>📚 TuitionPro</h1>
                <p className="subtitle">Multi-Branch Tuition Management</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            id="login-username"
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
