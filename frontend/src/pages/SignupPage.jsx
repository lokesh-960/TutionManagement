import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
    const [form, setForm] = useState({ branch_name: '', username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth() // We can use login logic or manually handle the token response

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await axios.post('http://localhost:8000/api/auth/signup/', form)
            // Auto login logic: set token and redirect
            localStorage.setItem('access_token', res.data.access)
            localStorage.setItem('refresh_token', res.data.refresh)
            localStorage.setItem('branch', JSON.stringify(res.data.branch))
            // Force reload or just navigate (AppContext reads from localStorage on init, but we might need to update state)
            // Ideally, we should use a `setAuth` method in context. 
            // For now, simple navigation might not update Context immediately if it only reads on mount.
            // Let's rely on standard login flow or simple reload.
            window.location.href = '/dashboard'
        } catch (err) {
            setError(err.response?.data?.username?.[0] || 'Signup failed')
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>🚀 Get Started</h1>
                <p className="subtitle">Create New Tuition Branch</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Branch Name</label>
                        <input className="form-input" value={form.branch_name} onChange={e => setForm({ ...form, branch_name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Admin Username</label>
                        <input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Branch'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    Already have a branch? <Link to="/" style={{ color: 'var(--color-primary)' }}>Select Branch</Link>
                </p>
            </div>
        </div>
    )
}
