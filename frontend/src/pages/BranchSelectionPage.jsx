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
    const [branchToDelete, setBranchToDelete] = useState(null)
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

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

    const handleSelectBranch = (branch) => {
        navigate('/login', { state: { branchId: branch.id, branchName: branch.name, mobile: branch.mobile } })
    }

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError('Password is required to delete the account.')
            return
        }

        setIsDeleting(true)
        setDeleteError('')
        try {
            const res = await fetch('http://localhost:8000/api/auth/delete-account/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: branchToDelete.mobile, password: deletePassword })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete account')
            }

            setBranches(branches.filter(b => b.id !== branchToDelete.id))
            setBranchToDelete(null)
            setDeletePassword('')

        } catch (err) {
            setDeleteError(err.message)
        } finally {
            setIsDeleting(false)
        }
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
                                    <div key={b.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => handleSelectBranch(b)}
                                            style={{ flex: 1, justifyContent: 'space-between', padding: '1rem', textAlign: 'left', display: 'flex', alignItems: 'center' }}
                                        >
                                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{b.name}</span>
                                            <span style={{ opacity: 0.5 }}>➜</span>
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.9rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)', minWidth: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                            onClick={() => setBranchToDelete(b)}
                                            title="Delete Branch"
                                        >
                                            🗑️
                                        </button>
                                    </div>
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

                {branchToDelete && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', borderRadius: '16px', zIndex: 10 }}>
                        <div style={{ textAlign: 'center', background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-danger)', width: '100%' }}>
                            <h3 style={{ color: 'var(--color-danger)', marginBottom: '1rem', fontSize: '1.25rem' }}>⚠️ Delete {branchToDelete.name}</h3>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                                This action **cannot** be undone and will erase all branch data.
                            </p>

                            {deleteError && <div className="login-error" style={{ marginBottom: '1rem', padding: '0.5rem', fontSize: '0.85rem' }}>{deleteError}</div>}

                            <div className="form-group" style={{ textAlign: 'left' }}>
                                <label style={{ fontSize: '0.85rem' }}>Enter Password to Confirm</label>
                                <input
                                    className="form-input"
                                    type="password"
                                    placeholder="Password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => { setBranchToDelete(null); setDeleteError(''); setDeletePassword(''); }} disabled={isDeleting} style={{ flex: 1 }}>Cancel</button>
                                <button type="button" className="btn" style={{ background: 'var(--color-danger)', color: 'white', flex: 1, border: '1px solid var(--color-danger)' }} onClick={handleDeleteAccount} disabled={isDeleting}>
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
