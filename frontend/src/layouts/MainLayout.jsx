import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { LogOut, BookOpen, User, Menu, X } from 'lucide-react';

const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header / Navbar */}
            <header className="bg-secondary p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-white hover:text-accent transition"
                    >
                        <Menu size={28} />
                    </button>
                    <Link to="/" className="flex items-center">
                        <img src="/logo.png" alt="Cripsys Logo" className="h-8 w-auto object-contain" />
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    {/* User profile or other header items could go here */}
                </div>
            </header>

            <div className="flex flex-1 relative">
                {/* Collapsible Sidebar */}
                <aside
                    className={`
                        fixed inset-y-0 left-0 z-40 w-64 bg-secondary transform transition-transform duration-300 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        pt-20 pb-6 px-6 flex flex-col shadow-2xl
                    `}
                >
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden"
                    >
                        <X size={24} />
                    </button>

                    <nav className="flex-1 space-y-2">
                        <Link
                            to="/"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded transition"
                        >
                            <BookOpen size={20} />
                            <span>Courses</span>
                        </Link>
                        <Link
                            to="/dashboard"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded transition"
                        >
                            <User size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/admin"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded transition"
                        >
                            <User size={20} />
                            <span>Admin</span>
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

                {/* Overlay for mobile when sidebar is open */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
