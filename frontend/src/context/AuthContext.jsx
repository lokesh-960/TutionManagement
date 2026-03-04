import { createContext, useContext, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('access_token'))
    const [branch, setBranch] = useState(() => {
        const saved = localStorage.getItem('branch')
        // Default fallback branch so the UI doesn't crash if no branch object exists
        return saved ? JSON.parse(saved) : { id: 1, name: 'Default Branch', fee_due_day: 5 }
    })
    const [loading, setLoading] = useState(false)
    const [token, setToken] = useState(() => localStorage.getItem('access_token'))

    const isAuthenticated = !!token

    async function login(mobile, password) {
        setLoading(true)
        try {
            const { data } = await api.post('/auth/login/', { mobile, password })
            localStorage.setItem('access_token', data.access)
            localStorage.setItem('refresh_token', data.refresh)
            localStorage.setItem('branch', JSON.stringify(data.branch))
            setToken(data.access)
            setBranch(data.branch)
            return { success: true }
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Login failed' }
        } finally {
            setLoading(false)
        }
    }

    function logout() {
        const refreshToken = localStorage.getItem('refresh_token')
        api.post('/auth/logout/', { refresh: refreshToken }).catch(() => { })
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('branch')
        setToken(null)
        setBranch(null)
    }

    function setAuthData(data) {
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        localStorage.setItem('branch', JSON.stringify(data.branch))
        setToken(data.access)
        setBranch(data.branch)
    }

    return (
        <AuthContext.Provider value={{ branch, isAuthenticated, login, logout, loading, setAuthData }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
