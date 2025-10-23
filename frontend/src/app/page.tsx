'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, History, Settings } from 'lucide-react';
import { DashboardStats } from '@/types';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function HomePage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const statsResponse = await apiClient.getDashboardStats();
            setStats(statsResponse);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                    CEE-SC Enumerador de Documentos
                </h1>
                <p className="text-muted-foreground text-lg">
                    Sistema de numeração de documentos oficiais
                </p>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Carregando dados...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Séries
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalSeries || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Ativas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Emitidos Hoje
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.emittedToday || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Documentos emitidos
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pendentes
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Aguardando emissão
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Emitidos
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalEmitted || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Todos os tempos
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Emitir Número
                        </CardTitle>
                        <CardDescription>
                            Gerar e emitir um novo número de documento
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/emitir">
                            <Button className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Emitir Número
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Histórico
                        </CardTitle>
                        <CardDescription>
                            Consultar números emitidos e reservados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/historico">
                            <Button variant="outline" className="w-full">
                                <History className="h-4 w-4 mr-2" />
                                Ver Histórico
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Gerenciar Séries
                        </CardTitle>
                        <CardDescription>
                            Configurar séries de numeração
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/series">
                            <Button variant="outline" className="w-full">
                                <Settings className="h-4 w-4 mr-2" />
                                Gerenciar Séries
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Relatórios
                        </CardTitle>
                        <CardDescription>
                            Exportar relatórios e dados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/relatorios">
                            <Button variant="outline" className="w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                Gerar Relatórios
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
