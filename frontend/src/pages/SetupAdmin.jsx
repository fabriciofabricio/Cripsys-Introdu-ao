import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Shield } from 'lucide-react';

const SetupAdmin = () => {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMakeAdmin = async () => {
        if (!auth.currentUser) {
            setStatus('You must be logged in.');
            return;
        }

        setLoading(true);
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);

            // Check if doc exists, if not create it
            const docSnap = await getDoc(userRef);
            if (!docSnap.exists()) {
                await setDoc(userRef, {
                    email: auth.currentUser.email,
                    role: 'admin',
                    createdAt: new Date()
                });
                setStatus('User document created and Admin role assigned!');
            } else {
                await setDoc(userRef, { role: 'admin' }, { merge: true });
                setStatus('Admin role assigned to existing user!');
            }
        } catch (error) {
            console.error(error);
            setStatus('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-md mx-auto bg-secondary p-8 rounded-lg text-center">
                <Shield size={48} className="mx-auto text-accent mb-4" />
                <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
                <p className="text-gray-400 mb-6">
                    Click the button below to initialize your user account with Admin privileges.
                </p>

                <button
                    onClick={handleMakeAdmin}
                    disabled={loading}
                    className="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded font-bold w-full disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Make Me Admin'}
                </button>

                {status && (
                    <div className={`mt-4 p-3 rounded ${status.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {status}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default SetupAdmin;
