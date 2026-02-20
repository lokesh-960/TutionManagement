import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function StudentListPage() {
    const [students, setStudents] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchStudents = (query = '') => {
        setLoading(true)
        const params = query ? { search: query } : {}
        api.get('/students/', { params }).then((res) => {
            setStudents(res.data)
            setFiltered(res.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    const [filtered, setFiltered] = useState([])
    const [filterGender, setFilterGender] = useState('All')
    const [filterStandard, setFilterStandard] = useState('All')
    const [filterStatus, setFilterStatus] = useState('All')

    useEffect(() => { fetchStudents() }, [])

    useEffect(() => {
        let res = students
        if (search) res = res.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
        if (filterGender !== 'All') res = res.filter(s => s.gender === filterGender)
        if (filterStandard !== 'All') res = res.filter(s => s.standard === filterStandard)
        if (filterStatus !== 'All') res = res.filter(s => s.fee_status === filterStatus.toLowerCase())
        setFiltered(res)
    }, [search, filterGender, filterStandard, filterStatus, students])

    return (
        <div>
            <div className="topbar" style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Students</h2>
                <Link to="/app/students/add" className="btn btn-primary">+ Add Student</Link>
            </div>

            <div className="search-bar" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200 }}
                />
                <select className="form-input" value={filterGender} onChange={e => setFilterGender(e.target.value)} style={{ width: 120 }}>
                    <option value="All">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <select className="form-input" value={filterStandard} onChange={e => setFilterStandard(e.target.value)} style={{ width: 120 }}>
                    <option value="All">All Classes</option>
                    {[...new Set(students.map(s => s.standard))].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 120 }}>
                    <option value="All">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="due">Unpaid</option>
                </select>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : students.length === 0 ? (
                <div className="empty-state">
                    <p>No students found.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Phone</th>
                                <th>Monthly Fee</th>
                                <th>Status</th>
                                <th>Fee</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s) => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                                    <td>{s.standard}</td>
                                    <td>{s.parent_phone}</td>
                                    <td>₹{Number(s.monthly_fee).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${s.fee_status === 'paid' ? 'badge-active' : 'badge-inactive'}`}>
                                            {s.fee_status === 'paid' ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/app/students/${s.id}`} className="btn btn-outline btn-sm">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
