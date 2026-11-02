// KaamSetu - Main Application Component
// Defines all routes for the application

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import FindJobs from './pages/worker/FindJobs';
import MyApplications from './pages/worker/MyApplications';
import WorkerProfile from './pages/worker/WorkerProfile';
import WorkerVerification from './pages/worker/WorkerVerification';
import WorkerRatings from './pages/worker/WorkerRatings';

// Employer Pages
import EmployerDashboard from './pages/employer/EmployerDashboard';
import PostJob from './pages/employer/PostJob';
import MyJobs from './pages/employer/MyJobs';
import EmployerApplications from './pages/employer/EmployerApplications';
import EmployerProfile from './pages/employer/EmployerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminVerification from './pages/admin/AdminVerification';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminReviews from './pages/admin/AdminReviews';

// Shared Pages
import Notifications from './pages/Notifications';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Worker Routes */}
              <Route path="/worker/dashboard" element={
                <ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>
              } />
              <Route path="/worker/jobs" element={
                <ProtectedRoute allowedRoles={['worker']}><FindJobs /></ProtectedRoute>
              } />
              <Route path="/worker/applications" element={
                <ProtectedRoute allowedRoles={['worker']}><MyApplications /></ProtectedRoute>
              } />
              <Route path="/worker/profile" element={
                <ProtectedRoute allowedRoles={['worker']}><WorkerProfile /></ProtectedRoute>
              } />
              <Route path="/worker/verification" element={
                <ProtectedRoute allowedRoles={['worker']}><WorkerVerification /></ProtectedRoute>
              } />
              <Route path="/worker/ratings" element={
                <ProtectedRoute allowedRoles={['worker']}><WorkerRatings /></ProtectedRoute>
              } />

              {/* Employer Routes */}
              <Route path="/employer/dashboard" element={
                <ProtectedRoute allowedRoles={['employer']}><EmployerDashboard /></ProtectedRoute>
              } />
              <Route path="/employer/post-job" element={
                <ProtectedRoute allowedRoles={['employer']}><PostJob /></ProtectedRoute>
              } />
              <Route path="/employer/jobs" element={
                <ProtectedRoute allowedRoles={['employer']}><MyJobs /></ProtectedRoute>
              } />
              <Route path="/employer/applications" element={
                <ProtectedRoute allowedRoles={['employer']}><EmployerApplications /></ProtectedRoute>
              } />
              <Route path="/employer/profile" element={
                <ProtectedRoute allowedRoles={['employer']}><EmployerProfile /></ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>
              } />
              <Route path="/admin/jobs" element={
                <ProtectedRoute allowedRoles={['admin']}><AdminJobs /></ProtectedRoute>
              } />
              <Route path="/admin/verification" element={
                <ProtectedRoute allowedRoles={['admin']}><AdminVerification /></ProtectedRoute>
              } />
              <Route path="/admin/complaints" element={
                <ProtectedRoute allowedRoles={['admin']}><AdminComplaints /></ProtectedRoute>
              } />
              <Route path="/admin/reviews" element={
                <ProtectedRoute allowedRoles={['admin']}><AdminReviews /></ProtectedRoute>
              } />

              {/* Shared Routes */}
              <Route path="/notifications" element={
                <ProtectedRoute><Notifications /></ProtectedRoute>
              } />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ChatBot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
