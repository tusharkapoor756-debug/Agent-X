import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BusinessOnboarding from './pages/BusinessOnboarding';
import Dashboard from './pages/Dashboard';
import ChatInterface from './components/ChatInterface';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<BusinessOnboarding />} />
                <Route path="/dashboard/:businessId" element={<Dashboard />} />
                <Route path="/chat/:businessId" element={<ChatInterface />} />

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
