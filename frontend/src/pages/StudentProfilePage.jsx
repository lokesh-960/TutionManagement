import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

const API_BASE = 'http://localhost:8000'

export default function StudentProfilePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const [student, setStudent] = useState(null)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [showLightbox, setShowLightbox] = useState(false)

    useEffect(() => {
        api.get(`/students/${id}/`).then((res) => {
            setStudent(res.data)
            setForm(res.data)
            setLoading(false)
        }).catch(() => { setLoading(false) })
    }, [id])

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleSave = async () => {
        try {
            let res
            if (selectedFile) {
                // Use FormData for file upload
                const formData = new FormData()
                formData.append('profile_photo', selectedFile)
                formData.append('name', form.name)
                formData.append('standard', form.standard)
                formData.append('parent_name', form.parent_name)
                formData.append('parent_phone', form.parent_phone)
                formData.append('monthly_fee', form.monthly_fee)
                formData.append('join_date', form.join_date)
                formData.append('gender', form.gender || 'Male')
                formData.append('is_active', form.is_active)
                res = await api.put(`/students/${id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            } else {
                res = await api.put(`/students/${id}/`, form)
            }
            setStudent(res.data)
            setForm(res.data)
            setEditing(false)
            setSelectedFile(null)
            setPreviewUrl(null)
            showToast('Student updated successfully')
        } catch { showToast('Failed to update') }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this student?')) return
        try {
            await api.delete(`/students/${id}/`)
            navigate('/app/students')
        } catch { showToast('Failed to delete') }
    }

    const getPhotoUrl = () => {
        if (!student?.profile_photo) return null
        return student.profile_photo.startsWith('http')
            ? student.profile_photo
            : `${API_BASE}${student.profile_photo}`
    }

    if (loading) return <p>Loading...</p>
    if (!student) return <p>Student not found.</p>

    const initials = student.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    const photoUrl = getPhotoUrl()
    const displayUrl = previewUrl || photoUrl

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/app/students')}>← Back</button>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Student Profile</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={`tel:${student.parent_phone}`} className="btn btn-primary btn-sm">📞 Call Parent</a>
                    <Link to={`/app/students/${id}/payments`} className="btn btn-outline btn-sm">💰 Payments</Link>
                </div>
            </div>

            <div className="card glass">
                <div className="profile-header">
                    {/* Avatar with edit overlay */}
                    <div
                        className="profile-avatar"
                        style={{ position: 'relative', cursor: displayUrl ? 'pointer' : 'default' }}
                        onClick={() => { if (displayUrl && !editing) setShowLightbox(true) }}
                    >
                        {displayUrl ? (
                            <img
                                src={displayUrl}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        ) : initials}

                        {/* Camera edit button — always visible */}
                        <button
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                            style={{
                                position: 'absolute', bottom: -2, right: -2,
                                width: 26, height: 26, borderRadius: '50%',
                                background: 'var(--color-primary)', border: '2px solid var(--color-surface)',
                                color: 'white', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', padding: 0,
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'transform 0.15s'
                            }}
                            title="Change photo"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                    </div>

                    <div className="profile-info">
                        <h3>{student.name}</h3>
                        <p>Class {student.standard} · Joined {new Date(student.join_date).toLocaleDateString()}</p>
                    </div>
                </div>

                {editing ? (
                    <div className="card-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name</label>
                                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Class</label>
                                <input className="form-input" value={form.standard} onChange={(e) => setForm({ ...form, standard: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Parent Name</label>
                                <input className="form-input" value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Parent Phone</label>
                                <input className="form-input" value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Monthly Fee (₹)</label>
                                <input className="form-input" type="number" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Join Date</label>
                                <input className="form-input" type="date" value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select className="form-input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Photo preview during edit */}
                        {previewUrl && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={previewUrl} alt="Preview" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>New photo selected</span>
                                <button
                                    className="btn btn-outline btn-sm"
                                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null) }}
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                            <button className="btn btn-outline" onClick={() => { setEditing(false); setForm(student); setSelectedFile(null); setPreviewUrl(null) }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="profile-details">
                            <div className="profile-field"><label>Parent</label><span>{student.parent_name}</span></div>
                            <div className="profile-field"><label>Phone</label><span>{student.parent_phone}</span></div>
                            <div className="profile-field"><label>Monthly Fee</label><span>₹{Number(student.monthly_fee).toLocaleString()}</span></div>
                            <div className="profile-field"><label>Status</label><span className={`badge ${student.is_active ? 'badge-active' : 'badge-inactive'}`}>{student.is_active ? 'Active' : 'Inactive'}</span></div>
                        </div>
                        <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑️ Delete</button>
                        </div>
                    </>
                )}
            </div>

            {/* Lightbox Modal */}
            {showLightbox && displayUrl && (
                <div
                    onClick={() => setShowLightbox(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', backdropFilter: 'blur(6px)',
                        animation: 'fade-in 0.2s ease'
                    }}
                >
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh' }}>
                        <img
                            src={displayUrl}
                            alt={student.name}
                            style={{
                                maxWidth: '90vw', maxHeight: '85vh',
                                borderRadius: '12px', objectFit: 'contain',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                            }}
                        />
                        <div style={{
                            textAlign: 'center', marginTop: '1rem',
                            color: 'white', fontSize: '1rem', fontWeight: 600
                        }}>
                            {student.name}
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="toast">{toast}</div>}
        </div>
    )
}
