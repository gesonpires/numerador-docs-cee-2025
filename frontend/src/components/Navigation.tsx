'use client';

import Link from 'next/link';
import { Home, FileText, History, Settings, BarChart3 } from 'lucide-react';

export default function Navigation() {
    return (
        <nav className="bg-gray-900 text-white p-4">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                    <FileText className="h-6 w-6" />
                    CEE-SC Enumerador
                </Link>
                
                <div className="flex gap-4">
                    <Link href="/" className="flex items-center gap-2 hover:text-blue-300 transition-colors">
                        <Home className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link href="/emitir" className="flex items-center gap-2 hover:text-blue-300 transition-colors">
                        <FileText className="h-4 w-4" />
                        Emitir
                    </Link>
                    <Link href="/historico" className="flex items-center gap-2 hover:text-blue-300 transition-colors">
                        <History className="h-4 w-4" />
                        Histórico
                    </Link>
                    <Link href="/series" className="flex items-center gap-2 hover:text-blue-300 transition-colors">
                        <Settings className="h-4 w-4" />
                        Séries
                    </Link>
                    <Link href="/relatorios" className="flex items-center gap-2 hover:text-blue-300 transition-colors">
                        <BarChart3 className="h-4 w-4" />
                        Relatórios
                    </Link>
                </div>
            </div>
        </nav>
    );
}
