import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
    const [form, setForm] = useState({ branch_name: '', mobile: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { setAuthData } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await api.post('/auth/signup/', form)
            // Auto login logic: update context and navigate seamlessly
            setAuthData(res.data)
            window.location.href = '/app/dashboard'
        } catch (err) {
            const errorMsg = err.response?.data?.mobile?.[0] || err.response?.data?.error || err.response?.data?.detail || err.message || 'Signup failed'
            setError(errorMsg)
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
                        <label>Mobile Number</label>
                        <input className="form-input" type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} required />
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
