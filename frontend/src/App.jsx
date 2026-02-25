import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import BranchSelectionPage from './pages/BranchSelectionPage'
import SignupPage from './pages/SignupPage'
import HistoryPage from './pages/HistoryPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentListPage from './pages/StudentListPage'
import AddStudentPage from './pages/AddStudentPage'
import StudentProfilePage from './pages/StudentProfilePage'
import PaymentHistoryPage from './pages/PaymentHistoryPage'
import DueNotifyPage from './pages/DueNotifyPage'
import CircularPage from './pages/CircularPage'

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth()
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<BranchSelectionPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="students" element={<StudentListPage />} />
                <Route path="students/add" element={<AddStudentPage />} />
                <Route path="students/:id" element={<StudentProfilePage />} />
                <Route path="students/:id/payments" element={<PaymentHistoryPage />} />
                <Route path="students/:id/payments" element={<PaymentHistoryPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="notifications/due" element={<DueNotifyPage />} />
                <Route path="notifications/circular" element={<CircularPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
    )
}
