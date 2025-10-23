'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Series, DocNumber } from '@/types';
import { apiClient } from '@/lib/api';
import { FileText, Plus, CheckCircle } from 'lucide-react';

export default function EmitirPage() {
    const [series, setSeries] = useState<Series[]>([]);
    const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
    const [count, setCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [reservedNumbers, setReservedNumbers] = useState<DocNumber[]>([]);
    const [metadata, setMetadata] = useState({
        processo: '',
        interessado: '',
        assunto: ''
    });

    useEffect(() => {
        loadSeries();
    }, []);

    const loadSeries = async () => {
        try {
            const response = await apiClient.getSeries();
            setSeries(response.data);
        } catch (error) {
            console.error('Erro ao carregar séries:', error);
        }
    };

    const handleReserveNumbers = async () => {
        if (!selectedSeries) return;

        setLoading(true);
        try {
            const response = await apiClient.reserveNumber({
                seriesId: selectedSeries.id,
                count
            });
            setReservedNumbers(response.data);
        } catch (error) {
            console.error('Erro ao reservar números:', error);
            alert('Erro ao reservar números');
        } finally {
            setLoading(false);
        }
    };

    const handleIssueNumber = async (numberId: string) => {
        try {
            await apiClient.issueNumber(numberId, { metadata });
            setReservedNumbers(prev =>
                prev.map(n => n.id === numberId ? { ...n, state: 'ISSUED' as const } : n)
            );
            alert('Número emitido com sucesso!');
        } catch (error) {
            console.error('Erro ao emitir número:', error);
            alert('Erro ao emitir número');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Emitir Números
                </h1>
                <p className="text-muted-foreground">
                    Reserve e emita números de documentos oficiais
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Seleção de Série */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Selecionar Série
                        </CardTitle>
                        <CardDescription>
                            Escolha a série e configure a quantidade
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Série</label>
                            <select
                                className="w-full mt-1 p-2 border rounded-md"
                                value={selectedSeries?.id || ''}
                                onChange={(e) => {
                                    const seriesId = e.target.value;
                                    const selectedSeries = series.find(s => s.id === seriesId);
                                    setSelectedSeries(selectedSeries || null);
                                }}
                            >
                                <option value="">Selecione uma série</option>
                                {series.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} - {s.nextNumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedSeries && (
                            <div className="p-4 bg-muted rounded-md">
                                <h4 className="font-medium mb-2">Preview do Próximo Número</h4>
                                <div className="text-2xl font-mono font-bold text-primary">
                                    {selectedSeries.nextNumber}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Sequência atual: {selectedSeries.currentSeq}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium">Quantidade</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                                className="w-full mt-1 p-2 border rounded-md"
                            />
                        </div>

                        <Button
                            onClick={handleReserveNumbers}
                            disabled={!selectedSeries || loading}
                            className="w-full"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {loading ? 'Reservando...' : 'Reservar Números'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Metadados e Emissão */}
                {reservedNumbers.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Emitir Números
                            </CardTitle>
                            <CardDescription>
                                Preencha os metadados e emita os números reservados
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium">Processo</label>
                                    <input
                                        type="text"
                                        value={metadata.processo}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, processo: e.target.value }))}
                                        className="w-full mt-1 p-2 border rounded-md"
                                        placeholder="Número do processo"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Interessado</label>
                                    <input
                                        type="text"
                                        value={metadata.interessado}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, interessado: e.target.value }))}
                                        className="w-full mt-1 p-2 border rounded-md"
                                        placeholder="Nome do interessado"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Assunto</label>
                                    <input
                                        type="text"
                                        value={metadata.assunto}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, assunto: e.target.value }))}
                                        className="w-full mt-1 p-2 border rounded-md"
                                        placeholder="Assunto do documento"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium">Números Reservados</h4>
                                {reservedNumbers.map(number => (
                                    <div key={number.id} className="flex items-center justify-between p-3 border rounded-md">
                                        <div>
                                            <div className="font-mono font-bold">{number.formatted}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {number.state === 'RESERVED' ? 'Reservado' : 'Emitido'}
                                            </div>
                                        </div>
                                        {number.state === 'RESERVED' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleIssueNumber(number.id)}
                                            >
                                                Emitir
                                            </Button>
                                        )}
                                        {number.state === 'ISSUED' && (
                                            <div className="text-green-600 text-sm font-medium">
                                                ✓ Emitido
                                            </div>
                                        )}
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
