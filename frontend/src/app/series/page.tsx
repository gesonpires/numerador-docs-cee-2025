'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Series } from '@/types';
import { apiClient } from '@/lib/api';
import { Settings, Plus, Edit, Trash2 } from 'lucide-react';

export default function SeriesPage() {
    const [series, setSeries] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSeries();
    }, []);

    const loadSeries = async () => {
        try {
            const response = await apiClient.getSeries();
            setSeries(response.data);
        } catch (error) {
            console.error('Erro ao carregar séries:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPreview = (formato: string, sigla: string) => {
        let preview = formato;
        preview = preview.replace(/#{seq:(\d+)}/g, (match, digits) => {
            return '001'.padStart(parseInt(digits), '0');
        });
        preview = preview.replace(/#{sigla}/g, sigla);
        preview = preview.replace(/#{ano}/g, new Date().getFullYear().toString());
        return preview;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Gerenciar Séries
                </h1>
                <p className="text-muted-foreground">
                    Configure as séries de numeração de documentos
                </p>
            </div>

            <div className="grid gap-6">
                {series.map((serie) => (
                    <Card key={serie.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                {serie.name}
                            </CardTitle>
                            <CardDescription>
                                {serie.tipo} • {serie.sigla} • <span className="font-mono bg-gray-100 px-2 py-1 rounded">{formatPreview(serie.formato, serie.sigla)}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
