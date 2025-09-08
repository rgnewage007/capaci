'use client';

import { useState, useEffect } from 'react';
import { useSafeQuery } from '@/hooks/useSafeQuery';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/sidebar';
import MediaUpload from '@/components/media-upload';
import MediaViewer from '@/components/media-viewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Trash2, Search, Filter, Grid, List } from 'lucide-react';

export default function MediaPage() {
    const [activeTab, setActiveTab] = useState('upload');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const { toast } = useToast();

    const { data: media, isLoading, refetch } = useSafeQuery({
        queryKey: ['/api/media'],
    });

    const { data: courses } = useSafeQuery({
        queryKey: ['/api/courses'],
    });

    const { data: modules } = useSafeQuery({
        queryKey: ['/api/course-modules'],
    });

    const filteredMedia = media?.filter((item: any) => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' || item.media_type === typeFilter;

        return matchesSearch && matchesType;
    }) || [];

    const handleDeleteMedia = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

        try {
            const response = await fetch(`/api/media/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: "Archivo eliminado",
                    description: "El archivo ha sido eliminado correctamente",
                });
                refetch();
            } else {
                throw new Error('Error al eliminar');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el archivo",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Download className="text-white" size={20} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Biblioteca Multimedia</h2>
                                <p className="text-gray-600">Gestiona imágenes, videos y archivos de la plataforma</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="upload">Subir Archivos</TabsTrigger>
                            <TabsTrigger value="browse">Explorar Biblioteca</TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload">
                            <MediaUpload
                                courses={courses || []}
                                modules={modules || []}
                                onUploadSuccess={refetch}
                            />
                        </TabsContent>

                        <TabsContent value="browse">
                            {/* Filtros y búsqueda */}
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Buscar por título o descripción..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full"
                                            />
                                        </div>

                                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Todos los tipos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los tipos</SelectItem>
                                                <SelectItem value="image">Imágenes</SelectItem>
                                                <SelectItem value="video">Videos</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <div className="flex space-x-2">
                                            <Button
                                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                                size="icon"
                                                onClick={() => setViewMode('grid')}
                                            >
                                                <Grid className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                                size="icon"
                                                onClick={() => setViewMode('list')}
                                            >
                                                <List className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Grid de archivos */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <Card key={i} className="animate-pulse">
                                            <CardContent className="p-4">
                                                <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : filteredMedia.length > 0 ? (
                                viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredMedia.map((item: any) => (
                                            <Card key={item.id} className="group relative overflow-hidden">
                                                <MediaViewer media={item} className="aspect-video" />
                                                <CardContent className="p-4">
                                                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
                                                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">
                                                            {item.file_type.split('/')[1]}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteMedia(item.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredMedia.map((item: any) => (
                                            <Card key={item.id} className="group">
                                                <div className="flex items-center space-x-4 p-4">
                                                    <div className="flex-shrink-0">
                                                        <MediaViewer media={item} className="w-20 h-20" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>{item.file_type.split('/')[1]}</span>
                                                            <span>{(item.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteMedia(item.id)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-16">
                                    <Download className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {searchTerm ? "No se encontraron archivos" : "Biblioteca vacía"}
                                    </h3>
                                    <p className="text-gray-600">
                                        {searchTerm
                                            ? "Intenta con otros términos de búsqueda"
                                            : "Sube tu primer archivo para comenzar"
                                        }
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}