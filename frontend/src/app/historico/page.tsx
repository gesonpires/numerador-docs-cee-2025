'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Series, DocNumber, PaginatedResponse } from '@/types';
import { apiClient } from '@/lib/api';
import { Search, Filter, Download, Eye, X } from 'lucide-react';

export default function HistoricoPage() {
    const [numbers, setNumbers] = useState<DocNumber[]>([]);
    const [series, setSeries] = useState<Series[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const [filters, setFilters] = useState({
        seriesId: '',
        year: new Date().getFullYear(),
        state: '',
        q: ''
    });

    useEffect(() => {
        loadSeries();
        loadNumbers();
    }, []);

    useEffect(() => {
        loadNumbers();
    }, [filters, pagination.page]);

    const loadSeries = async () => {
        try {
            const response = await apiClient.getSeries();
            setSeries(response.data);
        } catch (error) {
            console.error('Erro ao carregar séries:', error);
        }
    };

    const loadNumbers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.getNumbers({
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            });
            setNumbers(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.pagination.total,
                totalPages: response.pagination.pages
            }));
        } catch (error) {
            console.error('Erro ao carregar números:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        loadNumbers();
    };

    const handleClear = () => {
        setFilters({
            seriesId: '',
            year: new Date().getFullYear(),
            state: '',
            q: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const exportToCSV = () => {
        if (numbers.length === 0) {
            alert('Nenhum número para exportar');
            return;
        }

        const csvContent = [
            ['Número', 'Série', 'Estado', 'Data Criação', 'Processo', 'Interessado', 'Assunto'],
            ...numbers.map(num => [
                num.formatted,
                num.series?.name || '',
                num.state,
                new Date(num.createdAt).toLocaleDateString('pt-BR'),
                num.metadata?.processo || '',
                num.metadata?.interessado || '',
                num.metadata?.assunto || ''
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historico_numeros_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const voidNumber = async (id: string) => {
        if (!confirm('Tem certeza que deseja anular este número?')) return;
        
        try {
            await apiClient.voidNumber(id, { reason: 'Anulado pelo usuário' });
            loadNumbers();
        } catch (error) {
            console.error('Erro ao anular número:', error);
            alert('Erro ao anular número');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Histórico de Números
                </h1>
                <p className="text-muted-foreground">
                    Visualize e gerencie números de documentos
                </p>
            </div>

            <div className="grid gap-6">
                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            <div>
                                <label className="text-sm font-medium">Ano</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-md"
                                    value={filters.year}
                                    onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Estado</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={filters.state}
                                    onChange={(e) => setFilters({...filters, state: e.target.value})}
                                >
                                    <option value="">Todos os estados</option>
                                    <option value="RESERVED">Reservado</option>
                                    <option value="ISSUED">Emitido</option>
                                    <option value="VOIDED">Anulado</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Busca</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Número ou metadados..."
                                    value={filters.q}
                                    onChange={(e) => setFilters({...filters, q: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                Buscar
                            </Button>
                            <Button variant="outline" onClick={handleClear}>
                                Limpar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Números */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Números Encontrados ({pagination.total})</span>
                            <Button variant="outline" size="sm" onClick={exportToCSV}>
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-muted-foreground">Carregando...</p>
                            </div>
                        ) : numbers.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">Nenhum número encontrado</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {numbers.map((number) => (
                                    <div key={number.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">{number.formatted}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    number.state === 'ISSUED' ? 'bg-green-100 text-green-800' :
                                                    number.state === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {number.state === 'ISSUED' ? 'Emitido' :
                                                     number.state === 'RESERVED' ? 'Reservado' : 'Anulado'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {number.series?.name} • {number.year}
                                            </p>
                                            {number.metadata && (
                                                <div className="mt-2 text-sm">
                                                    {number.metadata.processo && (
                                                        <p><strong>Processo:</strong> {number.metadata.processo}</p>
                                                    )}
                                                    {number.metadata.interessado && (
                                                        <p><strong>Interessado:</strong> {number.metadata.interessado}</p>
                                                    )}
                                                    {number.metadata.assunto && (
                                                        <p><strong>Assunto:</strong> {number.metadata.assunto}</p>
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {number.state === 'ISSUED' ? 'Emitido em:' :
                                                 number.state === 'RESERVED' ? 'Reservado em:' : 'Anulado em:'} {new Date(number.createdAt).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {number.state !== 'VOIDED' && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => voidNumber(number.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
