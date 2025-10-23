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
            setPagination(response.pagination);
        } catch (error) {
            console.error('Erro ao carregar números:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVoidNumber = async (numberId: string) => {
        const reason = prompt('Motivo da anulação:');
        if (!reason) return;

        try {
            await apiClient.voidNumber(numberId, { reason });
            loadNumbers(); // Recarregar lista
            alert('Número anulado com sucesso!');
        } catch (error) {
            console.error('Erro ao anular número:', error);
            alert('Erro ao anular número');
        }
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case 'RESERVED': return 'bg-yellow-100 text-yellow-800';
            case 'ISSUED': return 'bg-green-100 text-green-800';
            case 'VOIDED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStateLabel = (state: string) => {
        switch (state) {
            case 'RESERVED': return 'Reservado';
            case 'ISSUED': return 'Emitido';
            case 'VOIDED': return 'Anulado';
            default: return state;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Histórico de Números
                </h1>
                <p className="text-muted-foreground">
                    Consulte e gerencie números de documentos
                </p>
            </div>

            {/* Filtros */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium">Série</label>
                            <select
                                className="w-full mt-1 p-2 border rounded-md"
                                value={filters.seriesId}
                                onChange={(e) => setFilters(prev => ({ ...prev, seriesId: e.target.value }))}
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
                                className="w-full mt-1 p-2 border rounded-md"
                                value={filters.year}
                                onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Estado</label>
                            <select
                                className="w-full mt-1 p-2 border rounded-md"
                                value={filters.state}
                                onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                            >
                                <option value="">Todos os estados</option>
                                <option value="RESERVED">Reservado</option>
                                <option value="ISSUED">Emitido</option>
                                <option value="VOIDED">Anulado</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Busca</label>
                            <div className="relative mt-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    className="w-full pl-8 pr-2 py-2 border rounded-md"
                                    placeholder="Número ou metadados..."
                                    value={filters.q}
                                    onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button onClick={loadNumbers} disabled={loading}>
                            <Search className="mr-2 h-4 w-4" />
                            {loading ? 'Buscando...' : 'Buscar'}
                        </Button>
                        <Button variant="outline" onClick={() => setFilters({ seriesId: '', year: new Date().getFullYear(), state: '', q: '' })}>
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
                        <Button variant="outline" size="sm">
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
                        <div className="space-y-2">
                            {numbers.map(number => (
                                <div key={number.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="font-mono font-bold text-lg">{number.formatted}</div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(number.state)}`}>
                                                {getStateLabel(number.state)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {number.series?.name} • {number.year}
                                        </div>
                                        {number.metadata && (
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {number.metadata.processo && `Processo: ${number.metadata.processo}`}
                                                {number.metadata.interessado && ` • Interessado: ${number.metadata.interessado}`}
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {number.state === 'RESERVED' && number.reservedAt && `Reservado em: ${new Date(number.reservedAt).toLocaleString()}`}
                                            {number.state === 'ISSUED' && number.issuedAt && `Emitido em: ${new Date(number.issuedAt).toLocaleString()}`}
                                            {number.state === 'VOIDED' && number.voidedAt && `Anulado em: ${new Date(number.voidedAt).toLocaleString()}`}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {number.state !== 'VOIDED' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleVoidNumber(number.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Paginação */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                                Página {pagination.page} de {pagination.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === pagination.totalPages}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
