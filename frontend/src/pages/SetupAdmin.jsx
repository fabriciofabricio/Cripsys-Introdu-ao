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
            setStatus('Você precisa estar logado.');
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
                setStatus('Documento de usuário criado e função de Admin atribuída!');
            } else {
                await setDoc(userRef, { role: 'admin' }, { merge: true });
                setStatus('Função de Admin atribuída ao usuário existente!');
            }
        } catch (error) {
            console.error(error);
            setStatus('Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-md mx-auto bg-secondary p-8 rounded-lg text-center">
                <Shield size={48} className="mx-auto text-accent mb-4" />
                <h1 className="text-2xl font-bold mb-4">Configuração de Admin</h1>
                <p className="text-gray-400 mb-6">
                    Clique no botão abaixo para inicializar sua conta com privilégios de Admin.
                </p>

                <button
                    onClick={handleMakeAdmin}
                    disabled={loading}
                    className="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded font-bold w-full disabled:opacity-50"
                >
                    {loading ? 'Processando...' : 'Me tornar Admin'}
                </button>

                {status && (
                    <div className={`mt-4 p-3 rounded ${status.includes('Erro') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {status}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default SetupAdmin;
