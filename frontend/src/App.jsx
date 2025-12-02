import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Lesson from './pages/Lesson';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CourseEditor from './pages/Admin/CourseEditor';
import LessonEditor from './pages/Admin/LessonEditor';
import SetupAdmin from './pages/SetupAdmin';
import Support from './pages/Support';

const App = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!user || user.isAnonymous ? <Login /> : <Navigate to="/" />}
        />

        <Route
          path="/"
          element={user ? <Home /> : <div className="text-center p-10">Autenticando...</div>}
        />

        <Route
          path="/course/:courseId"
          element={user ? <Lesson /> : <Navigate to="/" />}
        />

        <Route
          path="/course/:courseId/lesson/:lessonId"
          element={user ? <Lesson /> : <Navigate to="/" />}
        />

        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/support"
          element={user ? <Support /> : <Navigate to="/" />}
        />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/course/:courseId"
          element={isAdmin ? <CourseEditor /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/lesson/:courseId/:moduleId/:lessonId"
          element={isAdmin ? <LessonEditor /> : <Navigate to="/" />}
        />

        <Route
          path="/setup-admin"
          element={user ? <SetupAdmin /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
