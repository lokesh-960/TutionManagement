import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function PaymentHistoryPage() {
    const { id } = useParams()
    const [records, setRecords] = useState([])
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState('')

    // New fee form
    const now = new Date()
    const [newMonth, setNewMonth] = useState(now.getMonth() + 1)
    const [newYear, setNewYear] = useState(now.getFullYear())

    const fetchData = () => {
        Promise.all([
            api.get(`/fees/${id}/`),
            api.get(`/students/${id}/`),
        ]).then(([feeRes, stuRes]) => {
            setRecords(feeRes.data)
            setStudent(stuRes.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [id])

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    const handleAddFee = async () => {
        try {
            await api.post(`/fees/${id}/`, {
                student: id,
                month: newMonth,
                year: newYear,
                amount: student?.monthly_fee || 0,
                status: 'due',
            })
            showToast('Fee record added')
            fetchData()
        } catch (err) {
            showToast(err.response?.data?.month?.[0] || 'Failed to add fee')
        }
    }

    const markPaid = async (feeId) => {
        await api.post(`/fees/mark-paid/${feeId}/`)
        showToast('Marked as paid')
        fetchData()
    }

    const markDue = async (feeId) => {
        await api.post(`/fees/mark-due/${feeId}/`)
        showToast('Marked as due')
        fetchData()
    }

    if (loading) return <p>Loading...</p>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                    Payment History — {student?.name}
                </h2>
                <Link to={`/app/students/${id}`} className="btn btn-outline btn-sm">← Back to Profile</Link>
            </div>

            {/* Add new fee record */}
            <div className="card glass" style={{ marginBottom: '1.25rem' }}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Month</label>
                        <select className="form-input" value={newMonth} onChange={(e) => setNewMonth(+e.target.value)} style={{ width: 100 }}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2000, i).toLocaleString('default', { month: 'short' })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Year</label>
                        <input className="form-input" type="number" value={newYear} onChange={(e) => setNewYear(+e.target.value)} style={{ width: 100 }} />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleAddFee}>+ Add Fee Record</button>
                </div>
            </div>

            {/* Fee records table */}
            {records.length === 0 ? (
                <div className="empty-state"><p>No payment records yet.</p></div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Year</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Payment Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((r) => (
                                <tr key={r.id}>
                                    <td>{new Date(2000, r.month - 1).toLocaleString('default', { month: 'long' })}</td>
                                    <td>{r.year}</td>
                                    <td>₹{Number(r.amount).toLocaleString()}</td>
                                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                                    <td>{r.payment_date || '—'}</td>
                                    <td>
                                        {r.status !== 'paid' ? (
                                            <button className="btn btn-success btn-sm" onClick={() => markPaid(r.id)}>✓ Mark Paid</button>
                                        ) : (
                                            <button className="btn btn-outline btn-sm" onClick={() => markDue(r.id)}>Undo</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {toast && <div className="toast">{toast}</div>}
        </div>
    )
}
