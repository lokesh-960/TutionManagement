import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function AddStudentPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '', standard: '', parent_name: '', parent_phone: '',
        monthly_fee: '', join_date: new Date().toISOString().slice(0, 10),
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        try {
            await api.post('/students/', form)
            navigate('/app/students')
        } catch (err) {
            setError(JSON.stringify(err.response?.data) || 'Failed to add student')
            setSaving(false)
        }
    }

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>Add New Student</h2>

            <div className="card" style={{ maxWidth: 600 }}>
                <div className="card-body">
                    {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Student Name</label>
                            <input className="form-input" name="name" value={form.name} onChange={handleChange} required id="student-name" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Class / Standard</label>
                                <input className="form-input" name="standard" value={form.standard} onChange={handleChange} required id="student-standard" />
                            </div>
                            <div className="form-group">
                                <label>Monthly Fee (₹)</label>
                                <input className="form-input" name="monthly_fee" type="number" value={form.monthly_fee} onChange={handleChange} required id="student-fee" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Parent Name</label>
                                <input className="form-input" name="parent_name" value={form.parent_name} onChange={handleChange} required id="student-parent" />
                            </div>
                            <div className="form-group">
                                <label>Parent Phone</label>
                                <input className="form-input" name="parent_phone" value={form.parent_phone} onChange={handleChange} required id="student-phone" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Join Date</label>
                            <input className="form-input" name="join_date" type="date" value={form.join_date} onChange={handleChange} required id="student-join-date" />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button className="btn btn-primary" type="submit" disabled={saving} id="student-submit">
                                {saving ? 'Saving...' : 'Add Student'}
                            </button>
                            <button className="btn btn-outline" type="button" onClick={() => navigate('/app/students')}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
