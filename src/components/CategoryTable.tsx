import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Edit2, Trash2, Plus, Tag, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  label: string;
}

interface CategoryTableProps {
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  food: 'bg-green-500',
  pharmacy: 'bg-red-500',
  subscriptions: 'bg-purple-500',
  transport: 'bg-blue-500',
  clothing: 'bg-pink-500',
  entertainment: 'bg-yellow-500',
  health: 'bg-teal-500',
  education: 'bg-indigo-500',
  utilities: 'bg-orange-500',
  others: 'bg-gray-500'
};

const CategoryTable = ({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }: CategoryTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'label'>('label');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', label: '' });
  const { toast } = useToast();
  const itemsPerPage = 10;

  const filteredAndSortedCategories = useMemo(() => {
    let result = [...categories];

    // Filter by search
    if (searchTerm) {
      result = result.filter(category =>
        category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'label') {
        comparison = a.label.localeCompare(b.label);
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [categories, searchTerm, sortField, sortDirection]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCategories, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage);

  const handleSort = (field: 'name' | 'label') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setEditForm({ ...category });
  };

  const handleSaveEdit = () => {
    if (editForm) {
      onUpdateCategory(editForm);
      setEditingCategory(null);
      setEditForm(null);
      toast({
        title: "Categoria atualizada!",
        description: "As informações foram salvas com sucesso.",
      });
    }
  };

  const handleDelete = (id: string) => {
    onDeleteCategory(id);
    toast({
      title: "Categoria excluída!",
      description: "A categoria foi removida com sucesso.",
      variant: "destructive",
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim() || !newCategory.label.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const category: Category = {
      id: newCategory.name.toLowerCase().replace(/\s+/g, ''),
      name: newCategory.name.toLowerCase().replace(/\s+/g, ''),
      label: newCategory.label.trim()
    };

    onAddCategory(category);
    setNewCategory({ name: '', label: '' });
    setShowAddCategory(false);
    toast({
      title: "Categoria cadastrada!",
      description: "Nova categoria criada com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Categorias
          </h1>
          <p className="text-gray-600">Gerencie suas categorias de despesas</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-500" />
                  Minhas Categorias
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{filteredAndSortedCategories.length} categorias</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Cadastrar Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="cat-name">Nome (ID)</Label>
                        <Input
                          id="cat-name"
                          placeholder="Ex: eletronicos"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Identificador interno (sem espaços)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="cat-label">Nome de Exibição</Label>
                        <Input
                          id="cat-label"
                          placeholder="Ex: Eletrônicos"
                          value={newCategory.label}
                          onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddCategory} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <Tag className="w-4 h-4 mr-2" />
                        Cadastrar Categoria
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar categorias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-12">Cor</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('label')}
                    >
                      <div className="flex items-center gap-1">
                        Nome de Exibição
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                        <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Nenhuma categoria encontrada</p>
                        <p className="text-sm">Cadastre suas categorias para visualizá-las aqui</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCategories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-purple-50/30 transition-colors">
                        <TableCell>
                          <div className={`w-4 h-4 rounded-full ${categoryColors[category.name] || 'bg-gray-400'}`}></div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">{category.name}</TableCell>
                        <TableCell className="font-medium">{category.label}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog open={editingCategory?.id === category.id} onOpenChange={(open) => !open && setEditingCategory(null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEdit(category)}
                                  className="hover:bg-purple-100 hover:text-purple-600"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Editar Categoria</DialogTitle>
                                </DialogHeader>
                                {editForm && (
                                  <div className="space-y-4 pt-4">
                                    <div>
                                      <Label htmlFor="edit-cat-name">Nome (ID)</Label>
                                      <Input
                                        id="edit-cat-name"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-cat-label">Nome de Exibição</Label>
                                      <Input
                                        id="edit-cat-label"
                                        value={editForm.label}
                                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                                      />
                                    </div>
                                    <Button onClick={handleSaveEdit} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                      Salvar Alterações
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="hover:bg-red-100 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a categoria "{category.label}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(category.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedCategories.length)} de {filteredAndSortedCategories.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryTable;
