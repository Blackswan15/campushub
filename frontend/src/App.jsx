import { lazy, Suspense, Fragment } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Code splitting — lazy load page components (React.lazy + Suspense)
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const MyEvents = lazy(() => import('./pages/MyEvents'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const OrganizerPanel = lazy(() => import('./pages/OrganizerPanel'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Fragment used explicitly to demonstrate React.Fragment */}
        <Fragment>
          <Navbar />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#06b6d4', secondary: '#fff' } },
            }}
          />
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/events/:id" element={<EventDetail />} />

              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/my-events" element={
                <ProtectedRoute roles={['student', 'organizer', 'pending_org']}><MyEvents /></ProtectedRoute>
              } />

              <Route path="/organizer" element={
                <ProtectedRoute roles={['organizer', 'admin', 'pending_org']}><OrganizerPanel /></ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>
              } />

              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center text-center">
                  <div>
                    <h1 className="text-6xl font-serif-italic text-cyan-500 mb-4">404</h1>
                    <p className="text-gray-500 mb-6">Page not found.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </Fragment>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
