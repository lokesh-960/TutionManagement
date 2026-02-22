import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
export default function BranchSelectionPage() {
    const [branches, setBranches] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()

    useEffect(() => {
        axios.get('http://localhost:8000/api/auth/branches/')
            .then(res => {
                setBranches(res.data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const handleSelect = (branchId) => {
        // We can pass the selected branch to the login page via state
        navigate('/login', { state: { branchId } })
    }

    return (
        <div className="login-page">
            <div className="login-card" style={{ maxWidth: 500, position: 'relative' }}>
                <button
                    className="btn btn-icon"
                    onClick={toggleTheme}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
                    title="Toggle theme"
                >
                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <h1>📚 TuitionPro</h1>
                <p className="subtitle">Select Your Branch</p>

                {loading ? (
                    <p>Loading branches...</p>
                ) : (
                    <div className="branch-list" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {branches.map(b => (
                            <button
                                key={b.id}
                                className="btn btn-outline"
                                onClick={() => handleSelect(b.id)}
                                style={{ justifyContent: 'space-between', padding: '1rem', textAlign: 'left' }}
                            >
                                <span style={{ fontWeight: 600 }}>{b.name}</span>
                                <span style={{ opacity: 0.5 }}>➜</span>
                            </button>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>New to TuitionPro?</p>
                    <Link to="/signup" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                        Create New Branch
                    </Link>
                </div>
            </div>
        </div>
    )
}
