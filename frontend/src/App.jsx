import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Pages
import Home from './pages/Home';
import Lesson from './pages/Lesson';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CourseEditor from './pages/Admin/CourseEditor';
import LessonEditor from './pages/Admin/LessonEditor';
import SetupAdmin from './pages/SetupAdmin';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" />}
        />

        <Route
          path="/course/:courseId"
          element={user ? <Lesson /> : <Navigate to="/login" />}
        />

        <Route
          path="/course/:courseId/lesson/:lessonId"
          element={user ? <Lesson /> : <Navigate to="/login" />}
        />

        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={user ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/course/:courseId"
          element={user ? <CourseEditor /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/lesson/:courseId/:moduleId/:lessonId"
          element={user ? <LessonEditor /> : <Navigate to="/login" />}
        />

        <Route
          path="/setup-admin"
          element={user ? <SetupAdmin /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
