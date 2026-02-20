import { useState, useEffect } from 'react'
import api from '../api'

export default function DueNotifyPage() {
    const [students, setStudents] = useState([])
    const [selected, setSelected] = useState([])
    const [message, setMessage] = useState('Dear Parent, your child\'s tuition fee is due. Please pay at the earliest. Thank you.')
    const [toast, setToast] = useState('')
    const [sending, setSending] = useState(false)

    useEffect(() => {
        api.get('/students/').then((res) => {
            // Filter only students with due status
            const due = res.data.filter((s) => s.fee_status === 'due')
            setStudents(due)
        })
    }, [])

    const [filterStandard, setFilterStandard] = useState('All')
    const [sortBy, setSortBy] = useState('name') // name, standard, fee

    const filteredStudents = students
        .filter(s => filterStandard === 'All' || s.standard === filterStandard)
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'standard') return a.standard.localeCompare(b.standard)
            if (sortBy === 'fee') return Number(b.monthly_fee) - Number(a.monthly_fee)
            return 0
        })

    const toggleSelect = (id) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
    }

    const selectAll = () => {
        if (selected.length === students.length) {
            setSelected([])
        } else {
            setSelected(students.map((s) => s.id))
        }
    }

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    const handleSend = async () => {
        if (selected.length === 0) { showToast('Please select at least one student'); return }
        setSending(true)
        try {
            const { data } = await api.post('/notifications/due/', { student_ids: selected, message })
            showToast(data.message)
            setSelected([])
        } catch { showToast('Failed to send') }
        setSending(false)
    }

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>Due Fee Reminders</h2>

            <div className="notify-form card glass" style={{ marginBottom: '1.25rem' }}>
                <div className="card-body">
                    <div className="form-group">
                        <label>Reminder Message</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
                    </div>
                    <button className="btn btn-warning" onClick={handleSend} disabled={sending}>
                        {sending ? 'Sending...' : `⚡ Send to ${selected.length} parent(s)`}
                    </button>
                </div>
            </div>

            <div className="search-bar" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <select className="form-input" value={filterStandard} onChange={e => setFilterStandard(e.target.value)} style={{ width: 150 }}>
                    <option value="All">All Classes</option>
                    {[...new Set(students.map(s => s.standard))].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="form-input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 150 }}>
                    <option value="name">Sort by Name</option>
                    <option value="standard">Sort by Class</option>
                    <option value="fee">Sort by Fee Amount</option>
                </select>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="card">
                    <div className="empty-state"><p>{students.length === 0 ? '🎉 All fees are paid!' : 'No students match filter.'}</p></div>
                </div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" checked={selected.length === students.length && students.length > 0} onChange={selectAll} />
                                </th>
                                <th>Student</th>
                                <th>Class</th>
                                <th>Parent Phone</th>
                                <th>Monthly Fee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((s) => (
                                <tr key={s.id}>
                                    <td><input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)} /></td>
                                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                                    <td>{s.standard}</td>
                                    <td>{s.parent_phone}</td>
                                    <td>₹{Number(s.monthly_fee).toLocaleString()}</td>
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
