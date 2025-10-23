'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToastContainer } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';
import { Series } from '@/types';
import { apiClient } from '@/lib/api';
import { Settings, Plus, Edit, Trash2, X, AlertTriangle } from 'lucide-react';

export default function SeriesPage() {
    const [series, setSeries] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSeries, setEditingSeries] = useState<Series | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        sigla: '',
        formato: '',
        tipo: 'OFICIO',
        isActive: true
    });

    const { toasts, removeToast, success, error } = useToast();

    useEffect(() => {
        loadSeries();
    }, []);

    const loadSeries = async () => {
        try {
            const response = await apiClient.getSeries();
            setSeries(response.data);
        } catch (err) {
            console.error('Erro ao carregar séries:', err);
            error('Erro', 'Não foi possível carregar as séries');
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

    const handleEdit = (serie: Series) => {
        setEditingSeries(serie);
        setEditForm({
            name: serie.name,
            sigla: serie.sigla,
            formato: serie.formato,
            tipo: serie.tipo,
            isActive: serie.isActive
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (serie: Series) => {
        setSeriesToDelete(serie);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!seriesToDelete) return;

        try {
            await apiClient.deleteSeries(seriesToDelete.id);
            loadSeries();
            success('Série excluída!', `A série "${seriesToDelete.name}" foi excluída com sucesso.`);
            setShowDeleteModal(false);
            setSeriesToDelete(null);
        } catch (err: any) {
            console.error('Erro ao excluir série:', err);
            
            // Verificar se é erro de números associados
            if (err.message && err.message.includes('números associados')) {
                error('Não é possível excluir', 'Esta série possui números associados. Remova os números primeiro.');
            } else {
                error('Erro ao excluir', 'Não foi possível excluir a série.');
            }
            setShowDeleteModal(false);
            setSeriesToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setSeriesToDelete(null);
    };

    const handleSaveEdit = async () => {
        if (!editingSeries) return;

        try {
            await apiClient.updateSeries(editingSeries.id, editForm);
            setShowEditModal(false);
            setEditingSeries(null);
            loadSeries();
            success('Série atualizada!', `A série "${editForm.name}" foi atualizada com sucesso.`);
        } catch (err) {
            console.error('Erro ao atualizar série:', err);
            error('Erro ao atualizar', 'Não foi possível atualizar a série.');
        }
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingSeries(null);
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
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEdit(serie)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteClick(serie)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && seriesToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            <h2 className="text-xl font-bold">Confirmar Exclusão</h2>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja excluir a série <strong>"{seriesToDelete.name}"</strong>?
                            <br />
                            <span className="text-sm text-red-600 mt-2 block">
                                ⚠️ Esta ação não pode ser desfeita.
                            </span>
                        </p>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleDeleteCancel}>
                                Cancelar
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteConfirm}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Editar Série</h2>
                            <Button variant="outline" onClick={closeEditModal}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Nome</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Sigla</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        value={editForm.sigla}
                                        onChange={(e) => setEditForm({...editForm, sigla: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Formato</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Ex: #{seq:3}/#{sigla}"
                                    value={editForm.formato}
                                    onChange={(e) => setEditForm({...editForm, formato: e.target.value})}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Preview: {formatPreview(editForm.formato, editForm.sigla)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Tipo</label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={editForm.tipo}
                                        onChange={(e) => setEditForm({...editForm, tipo: e.target.value})}
                                    >
                                        <option value="OFICIO">Ofício</option>
                                        <option value="CI">CI</option>
                                        <option value="ANALISE">Análise</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={editForm.isActive}
                                        onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium">
                                        Série ativa
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={closeEditModal}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSaveEdit}>
                                    Salvar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Container de Notificações */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
    );
}
