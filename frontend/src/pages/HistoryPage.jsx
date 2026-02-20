import { useState, useEffect } from 'react'
import api from '../api'

function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

const actionColors = {
    student_added: '#10b981', student_updated: '#3b82f6', student_deleted: '#ef4444',
    fee_paid: '#10b981', fee_due: '#f59e0b', notification_sent: '#8b5cf6',
    login: '#6366f1', logout: '#64748b',
}

export default function HistoryPage() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState('All')
    const [selected, setSelected] = useState([])
    const [selectionMode, setSelectionMode] = useState(false)

    useEffect(() => {
        api.get('/activity/').then((res) => {
            setLogs(res.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const handleDelete = async (ids) => {
        if (!window.confirm(`Delete ${ids.length} log entry(s)?`)) return
        try {
            // Delete individually since backend doesn't support bulk delete yet
            // Or we could add a bulk delete endpoint. For now, Promise.all
            await Promise.all(ids.map(id => api.delete(`/activity/${id}/`)))
            setLogs(logs.filter(l => !ids.includes(l.id)))
            setSelected([])
            if (ids.length === logs.length) setSelectionMode(false)
        } catch (err) {
            alert('Failed to delete logs')
        }
    }

    const filteredLogs = filterType === 'All' ? logs : logs.filter(l => l.action_type === filterType)

    const toggleSelect = (id) => {
        if (selected.includes(id)) {
            const newSelected = selected.filter(x => x !== id)
            setSelected(newSelected)
            if (newSelected.length === 0) setSelectionMode(false)
        } else {
            setSelected([...selected, id])
        }
    }

    // Simulate long press
    const handleLongPress = (id) => {
        if (!selectionMode) {
            setSelectionMode(true)
            setSelected([id])
        }
    }

    if (loading) return <p>Loading...</p>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>System History</h2>
                    {selectionMode && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected)}>
                            Delete {selected.length} Selected
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="form-input" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: 150 }}>
                        <option value="All">All Activities</option>
                        <option value="student_added">Student Added</option>
                        <option value="student_updated">Student Updated</option>
                        <option value="student_deleted">Student Deleted</option>
                        <option value="fee_paid">Fee Paid</option>
                        <option value="fee_due">Fee Due</option>
                        <option value="notification_sent">Notification Sent</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                    </select>
                    {selectionMode && (
                        <button className="btn btn-outline btn-sm" onClick={() => { setSelectionMode(false); setSelected([]) }}>Cancel</button>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    {filteredLogs.length === 0 ? (
                        <div className="empty-state"><p>No activity found.</p></div>
                    ) : (
                        filteredLogs.map((a) => (
                            <div
                                key={a.id}
                                className={`activity-item ${selected.includes(a.id) ? 'selected-item' : ''}`}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: selected.includes(a.id) ? 'var(--color-bg-secondary)' : 'transparent',
                                    borderRadius: '8px', padding: '0.5rem', transition: 'background 0.2s'
                                }}
                                onContextMenu={(e) => { e.preventDefault(); handleLongPress(a.id); }} // Right click to simulate long press on desktop
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%' }}>
                                    {selectionMode && (
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(a.id)}
                                            onChange={() => toggleSelect(a.id)}
                                            style={{ marginTop: 6 }}
                                        />
                                    )}
                                    <span className="activity-dot" style={{ background: actionColors[a.action_type] || '#94a3b8', marginTop: 6 }} />
                                    <div style={{ flex: 1 }} onDoubleClick={() => handleLongPress(a.id)}> {/* Double click as alt trigger */}
                                        <div className="activity-text">
                                            {a.description}
                                            {a.student_name && <span style={{ color: 'var(--color-text-muted)', marginLeft: 6, fontSize: '0.75rem' }}>({a.student_name})</span>}
                                        </div>
                                        <div className="activity-time">{timeAgo(a.timestamp)}</div>
                                    </div>
                                </div>
                                {!selectionMode && (
                                    <button
                                        onClick={() => handleDelete([a.id])}
                                        title="Delete Log"
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            opacity: 0.4,
                                            transition: 'all 0.2s',
                                            color: 'var(--color-danger)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.opacity = 1
                                            e.currentTarget.style.transform = 'scale(1.1)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.opacity = 0.4
                                            e.currentTarget.style.transform = 'scale(1)'
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <style>{`
                .selected-item { border: 1px solid var(--color-primary); }
            `}</style>
        </div>
    )
}
