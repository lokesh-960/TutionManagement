import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function BranchSelectionPage() {
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const [showBranches, setShowBranches] = useState(false)
    const [branches, setBranches] = useState([])
    const [loading, setLoading] = useState(false)

    const handleLoginClick = async () => {
        if (!showBranches) {
            setLoading(true)
            setShowBranches(true)
            try {
                const res = await axios.get('http://localhost:8000/api/auth/branches/')
                setBranches(res.data)
            } catch (err) {
                console.error('Failed to load branches', err)
            } finally {
                setLoading(false)
            }
        } else {
            setShowBranches(false)
        }
    }

    const handleSelectBranch = (branchId) => {
        navigate('/login', { state: { branchId } })
    }

    return (
        <div className="login-page">
            <div className="login-card" style={{ maxWidth: 450, position: 'relative', textAlign: 'center' }}>
                <button
                    className="btn btn-icon"
                    onClick={toggleTheme}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
                    title="Toggle theme"
                >
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to TuitionPro</h1>
                <p className="subtitle" style={{ marginBottom: '2rem' }}>Manage your tuition center efficiently.</p>

                {!showBranches ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button onClick={handleLoginClick} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}>
                            Login to Your Account
                        </button>

                        <Link to="/signup" className="btn btn-outline" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}>
                            Create New Account
                        </Link>
                    </div>
                ) : (
                    <div>
                        <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Select your account to login:</p>

                        {loading ? (
                            <p style={{ margin: '2rem 0', color: 'var(--color-text-muted)' }}>Loading accounts...</p>
                        ) : branches.length === 0 ? (
                            <p style={{ margin: '2rem 0', color: 'var(--color-text-muted)' }}>No accounts found. Please create one.</p>
                        ) : (
                            <div className="branch-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {branches.map(b => (
                                    <button
                                        key={b.id}
                                        className="btn btn-outline"
                                        onClick={() => handleSelectBranch(b.id)}
                                        style={{ justifyContent: 'space-between', padding: '1rem', textAlign: 'left', display: 'flex', alignItems: 'center' }}
                                    >
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{b.name}</span>
                                        <span style={{ opacity: 0.5 }}>➜</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            className="btn btn-outline"
                            onClick={() => setShowBranches(false)}
                            style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
                        >
                            ← Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
