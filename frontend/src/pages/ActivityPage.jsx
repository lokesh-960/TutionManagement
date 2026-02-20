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

export default function ActivityPage() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/activity/').then((res) => {
            setLogs(res.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    if (loading) return <p>Loading...</p>

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>Activity Log</h2>

            <div className="card">
                <div className="card-body">
                    {logs.length === 0 ? (
                        <div className="empty-state"><p>No activity recorded yet.</p></div>
                    ) : (
                        logs.map((a, i) => (
                            <div key={i} className="activity-item">
                                <span className="activity-dot" style={{ background: actionColors[a.action_type] || '#94a3b8' }} />
                                <div>
                                    <div className="activity-text">
                                        {a.description}
                                        {a.student_name && <span style={{ color: 'var(--color-text-muted)', marginLeft: 6, fontSize: '0.75rem' }}>({a.student_name})</span>}
                                    </div>
                                    <div className="activity-time">{timeAgo(a.timestamp)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
