import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function FeeDuePopup({ count, onClose }) {
    if (!count) return null
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div className="card glass" style={{ maxWidth: 400, width: '90%', animation: 'slideUp 0.3s ease-out' }}>
                <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fee Payment Alert</h3>
                    <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>
                        <strong style={{ color: 'var(--color-danger)' }}>{count} students</strong> have unpaid fees overdue.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <Link to="/app/students" className="btn btn-primary" onClick={onClose}>View Unpaid Students</Link>
                        <Link to="/app/notifications/due" className="btn btn-warning" onClick={onClose}>Send Reminders Now</Link>
                        <button className="btn btn-outline" onClick={onClose}>Dismiss</button>
                    </div>
                </div>
            </div>
        </div>
    )
}


function PieChart({ data }) {
    const total = (data.paid || 0) + (data.due || 0) + (data.partial || 0)
    if (total === 0) return <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>No data</p>

    const colors = { paid: '#10b981', due: '#ef4444', partial: '#f59e0b' }
    let cumulative = 0
    const segments = Object.entries(data).map(([key, value]) => {
        const start = cumulative
        cumulative += (value / total) * 360
        return { key, value, start, end: cumulative, color: colors[key] }
    })

    const size = 100 // Further reduced from 120
    const r = 38 // Further reduced from 45
    const cx = size / 2
    const cy = size / 2

    function arcPath(startAngle, endAngle) {
        if (endAngle - startAngle >= 360) {
            return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`
        }
        const s = ((startAngle - 90) * Math.PI) / 180
        const e = ((endAngle - 90) * Math.PI) / 180
        const largeArc = endAngle - startAngle > 180 ? 1 : 0
        return `M ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 ${largeArc} 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)} L ${cx} ${cy} Z`
    }

    return (
        <div className="pie-wrap" style={{ padding: '0.25rem', gap: '1rem' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {segments.map((seg) =>
                    seg.value > 0 ? (
                        <path key={seg.key} d={arcPath(seg.start, seg.end)} fill={seg.color} opacity={0.9}>
                            <title>{seg.key}: {seg.value}</title>
                        </path>
                    ) : null
                )}
                <circle cx={cx} cy={cy} r="22" fill="var(--color-surface)" />
                <text x={cx} y={cy + 3} textAnchor="middle" fill="var(--color-text)" fontSize="11" fontWeight="700">
                    {total}
                </text>
            </svg>
            <div className="pie-legend" style={{ gap: '0.25rem' }}>
                {segments.map((seg) => (
                    <div key={seg.key} className="pie-legend-item">
                        <span className="pie-dot" style={{ background: seg.color, width: 6, height: 6 }} />
                        <span style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>{seg.key}: {seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function BarChart({ data }) {
    if (!data || data.length === 0) return <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>No data</p>

    const maxVal = Math.max(...data.map(d => d.revenue), 1)
    const chartW = 260 // Further reduced width
    const chartH = 80 // Further reduced height form 100
    const barGap = 6
    const barW = (chartW - barGap * (data.length + 1)) / data.length
    const labelH = 16
    const topPad = 8

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.25rem 0 0' }}>
            <svg width={chartW} height={chartH + labelH + topPad} viewBox={`0 0 ${chartW} ${chartH + labelH + topPad}`} style={{ maxWidth: '100%' }}>
                {/* Grid lines */}
                {[0, 0.5, 1].map((frac, i) => {
                    const y = topPad + chartH - frac * chartH
                    return (
                        <g key={i}>
                            <line x1={0} y1={y} x2={chartW} y2={y} stroke="var(--color-border)" strokeWidth="1" strokeDasharray={frac > 0 ? "4,4" : "0"} />
                            <text x={0} y={y - 3} fill="var(--color-text-muted)" fontSize="7" fontWeight="500">
                                ₹{Math.round(maxVal * frac).toLocaleString()}
                            </text>
                        </g>
                    )
                })}

                {/* Bars */}
                {data.map((d, i) => {
                    const barH = (d.revenue / maxVal) * chartH
                    const x = barGap + i * (barW + barGap)
                    const y = topPad + chartH - barH
                    const isCurrentMonth = i === data.length - 1

                    return (
                        <g key={d.month}>
                            <rect
                                x={x} y={y} width={barW} height={barH}
                                rx={2} ry={2}
                                fill={isCurrentMonth ? 'var(--color-primary)' : 'var(--color-primary-light)'}
                                opacity={isCurrentMonth ? 1 : 0.6}
                                style={{ transition: 'all 0.3s ease' }}
                            >
                                <title>₹{d.revenue.toLocaleString()}</title>
                            </rect>
                            {/* Month label */}
                            <text
                                x={x + barW / 2} y={topPad + chartH + 10}
                                textAnchor="middle" fill="var(--color-text-muted)" fontSize="8" fontWeight={isCurrentMonth ? '700' : '500'}
                            >
                                {d.month}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}


export default function DashboardPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showPopup, setShowPopup] = useState(false)
    const { branch } = useAuth()

    useEffect(() => {
        api.get('/dashboard/').then((res) => {
            setData(res.data)
            setLoading(false)

            // Check popup logic
            const today = new Date()
            const dueDay = branch?.fee_due_day || 5

            // If Today > Due Day AND Due Count > 0 AND not dismissed
            if (today.getDate() > dueDay && res.data.due_count > 0) {
                const dismissed = sessionStorage.getItem('popup_dismissed')
                if (!dismissed) setShowPopup(true)
            }
        }).catch(() => setLoading(false))
    }, [branch])

    function handleClosePopup() {
        setShowPopup(false)
        sessionStorage.setItem('popup_dismissed', 'true')
    }

    if (loading) return <p>Loading dashboard...</p>
    if (!data) return <p>Failed to load dashboard.</p>

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>Dashboard</h2>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card glass purple">
                    <div className="kpi-label">Total Students</div>
                    <div className="kpi-value">{data.total_students}</div>
                    <div className="kpi-sub">{data.inactive_students} inactive</div>
                </div>
                <div className="kpi-card glass green">
                    <div className="kpi-label">Fees Collected</div>
                    <div className="kpi-value">₹{data.revenue_this_month.toLocaleString()}</div>
                    <div className="kpi-sub">of ₹{data.expected_revenue.toLocaleString()} expected</div>
                </div>
                <div className="kpi-card glass amber">
                    <div className="kpi-label">Due This Month</div>
                    <div className="kpi-value">{data.due_count}</div>
                    <div className="kpi-sub">student(s) pending</div>
                </div>
                <div className="kpi-card glass rose">
                    <div className="kpi-label">Collection Rate</div>
                    <div className="kpi-value">{data.collection_rate}%</div>
                    <div className="kpi-sub">{data.paid_count} paid of {data.total_students}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>Financial Analytics</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>Fee Status & Revenue Trends</span>
                </div>
                <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center', padding: '0.5rem 1rem 1rem' }}>
                    <div>
                        <h4 style={{ fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>This Month's Status</h4>
                        <PieChart data={data.pie_data} />
                    </div>
                    <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}>
                        <h4 style={{ fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>Revenue Trend (6 Months)</h4>
                        <BarChart data={data.monthly_revenue || []} />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/app/students/add" className="btn btn-primary">+ Add Student</Link>
                <Link to="/app/notifications/due" className="btn btn-warning">⚡ Send Reminders</Link>
                <Link to="/app/notifications/circular" className="btn btn-outline">📢 New Circular</Link>
            </div>

            {showPopup && <FeeDuePopup count={data.due_count} onClose={handleClosePopup} />}
        </div>
    )
}
