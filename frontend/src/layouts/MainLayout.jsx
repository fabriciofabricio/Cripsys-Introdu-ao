import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { LogOut, BookOpen, User } from 'lucide-react';

const MainLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-secondary p-6 flex flex-col">
                <div className="mb-8 flex justify-center">
                    <img src="/logo.png" alt="Cripsys Logo" className="h-12 w-auto object-contain" />
                </div>

                <nav className="flex-1 space-y-2">
                    <Link to="/" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded transition">
                        <BookOpen size={20} />
                        <span>Courses</span>
                    </Link>
                    <Link to="/dashboard" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded transition">
                        <User size={20} />
                        <span>Dashboard</span>
                    </Link>
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 text-gray-400 hover:text-white w-full p-2 rounded transition"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
