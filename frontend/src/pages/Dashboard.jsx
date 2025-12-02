import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Award, Clock, Book, CheckCircle } from 'lucide-react';

const Dashboard = () => {
    // Mock data
    const stats = [
        { label: 'Cursos em Andamento', value: '2', icon: Book, color: 'text-blue-500' },
        { label: 'Aulas Concluídas', value: '12', icon: CheckCircle, color: 'text-green-500' },
        { label: 'Horas Assistidas', value: '5.4', icon: Clock, color: 'text-purple-500' },
    ];

    // Helper for icon since I can't use it in stats array directly before definition if not careful, 
    // but here it's fine as they are just references.
    // Wait, CheckCircle is not imported.

    return (
        <MainLayout>
            <h1 className="text-3xl font-bold mb-8">Meu Painel</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-secondary p-6 rounded-lg flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-500">
                        <Book size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Cursos em Andamento</p>
                        <p className="text-2xl font-bold">2</p>
                    </div>
                </div>

                <div className="bg-secondary p-6 rounded-lg flex items-center space-x-4">
                    <div className="p-3 bg-green-500/20 rounded-full text-green-500">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Certificados</p>
                        <p className="text-2xl font-bold">0</p>
                    </div>
                </div>

                <div className="bg-secondary p-6 rounded-lg flex items-center space-x-4">
                    <div className="p-3 bg-purple-500/20 rounded-full text-purple-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Horas Assistidas</p>
                        <p className="text-2xl font-bold">5.4h</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Continuar Assistindo</h2>
            <div className="bg-secondary rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-lg">Introdução ao Cripsys</h3>
                        <p className="text-sm text-gray-400">Módulo 1: Primeiros Passos</p>
                    </div>
                    <button className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition">
                        Continuar
                    </button>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-accent h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-right text-xs text-gray-400 mt-2">45% Concluído</p>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
