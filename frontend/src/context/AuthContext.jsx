import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Check if user is admin
                if (!currentUser.isAnonymous) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                        if (userDoc.exists() && userDoc.data().role === 'admin') {
                            setIsAdmin(true);
                        } else {
                            setIsAdmin(false);
                        }
                    } catch (error) {
                        console.error("Error fetching user role:", error);
                        setIsAdmin(false);
                    }
                } else {
                    setIsAdmin(false);
                }

                setLoading(false);
            } else {
                // Auto login anonymously if no user
                try {
                    await signInAnonymously(auth);
                    // Listener will trigger again with the anonymous user
                } catch (error) {
                    console.error("Error signing in anonymously:", error);
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        isAdmin,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
