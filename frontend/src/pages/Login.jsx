import React from 'react';
import AuthForm from '../components/AuthForm';

const Login = () => {
    return (
        <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <img src="/logo.png" alt="Cripsys Logo" className="h-24 w-auto object-contain mx-auto mb-4" />
                <p className="text-gray-400">Platforma de Ensino</p>
            </div>

            <div className="w-full max-w-md">
                <AuthForm />
            </div>
        </div>
    );
};

export default Login;
