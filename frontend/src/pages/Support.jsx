import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Mail, MessageCircle } from 'lucide-react';

const Support = () => {
    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Suporte</h1>

                <div className="bg-secondary p-8 rounded-lg border border-gray-700">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="p-4 bg-accent/20 rounded-full text-accent">
                            <MessageCircle size={48} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-2">Precisa de ajuda?</h2>
                            <p className="text-gray-400">
                                Estamos aqui para ajudar você com qualquer dúvida ou problema que possa ter durante o curso.
                            </p>
                        </div>

                        <div className="w-full bg-primary p-6 rounded-lg flex items-center justify-center space-x-3">
                            <Mail className="text-accent" />
                            <a
                                href="mailto:suporte@cripsys.com.br"
                                className="text-lg font-medium hover:text-accent transition"
                            >
                                suporte@cripsys.com.br
                            </a>
                        </div>


                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Support;
