import { useState } from 'react'
import api from '../api'

export default function CircularPage() {
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [toast, setToast] = useState('')
    const [sending, setSending] = useState(false)

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!title.trim()) { showToast('Title is required'); return }
        setSending(true)
        try {
            const { data } = await api.post('/notifications/circular/', { title, body })
            showToast(data.message)
            setTitle('')
            setBody('')
        } catch { showToast('Failed to send circular') }
        setSending(false)
    }

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem' }}>Send Circular</h2>

            <div className="card glass notify-form">
                <div className="card-body">
                    <form onSubmit={handleSend}>
                        <div className="form-group">
                            <label>Circular Title</label>
                            <input
                                className="form-input"
                                placeholder="e.g. Holiday Announcement"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                id="circular-title"
                            />
                        </div>
                        <div className="form-group">
                            <label>Message Body</label>
                            <textarea
                                placeholder="Write your circular message here..."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={6}
                            />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={sending} id="circular-send">
                            {sending ? 'Sending...' : '📢 Send Circular to All Parents'}
                        </button>
                    </form>
                </div>
            </div>

            {toast && <div className="toast">{toast}</div>}
        </div>
    )
}
