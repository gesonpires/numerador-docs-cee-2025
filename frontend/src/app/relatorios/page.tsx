'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, BarChart3 } from 'lucide-react';
import { Series } from '@/types';
import { apiClient } from '@/lib/api';

interface ReportData {
    totalNumbers: number;
    byState: {
        reserved: number;
        issued: number;
        voided: number;
    };
    bySeries: Array<{
        name: string;
        total: number;
    }>;
    numbers: Array<any>;
}

export default function RelatoriosPage() {
    const [series, setSeries] = useState<Series[]>([]);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        seriesId: ''
    });

    useEffect(() => {
        loadSeries();
        generateReport(); // Carregar dados automaticamente
    }, []);

    const loadSeries = async () => {
        try {
            const response = await apiClient.getSeries();
            setSeries(response.data);
        } catch (error) {
            console.error('Erro ao carregar séries:', error);
        }
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.seriesId) params.append('seriesId', filters.seriesId);
            
            const response = await fetch(`http://localhost:3001/api/reports/summary?${params}`);
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!reportData) return;
        
        const csvContent = [
            ['Número', 'Série', 'Estado', 'Data Criação', 'Processo', 'Interessado', 'Assunto'],
            ...reportData.numbers.map(num => [
                num.formatted,
                num.series.name,
                num.state,
                new Date(num.createdAt).toLocaleDateString('pt-BR'),
                num.metadata?.processo || '',
                num.metadata?.interessado || '',
                num.metadata?.assunto || ''
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Relatórios
                </h1>
                <p className="text-muted-foreground">
                    Gere relatórios e exporte dados do sistema
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Filtros do Relatório
                        </CardTitle>
                        <CardDescription>
                            Configure os filtros para gerar o relatório
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Data Inicial</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-md"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Data Final</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-md"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Série</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={filters.seriesId}
                                    onChange={(e) => setFilters({...filters, seriesId: e.target.value})}
                                >
                                    <option value="">Todas as séries</option>
                                    {series.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={generateReport} disabled={loading}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                {loading ? 'Gerando...' : 'Gerar Relatório'}
                            </Button>
                            {reportData && (
                                <Button onClick={exportToCSV} variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar CSV
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {reportData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total de Números</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{reportData.totalNumbers}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Emitidos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{reportData.byState.issued}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Reservados</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{reportData.byState.reserved}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Anulados</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{reportData.byState.voided}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {reportData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Estatísticas por Série</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {reportData.bySeries.map((serie, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="font-medium">{serie.name}</span>
                                        <span className="text-lg font-bold">{serie.total}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
