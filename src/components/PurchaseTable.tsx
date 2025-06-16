
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Edit, Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Purchase {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface Category {
  id: string;
  name: string;
  label: string;
}

interface PurchaseTableProps {
  purchases: Purchase[];
  categories: Category[];
  onUpdatePurchase: (purchase: Purchase) => void;
  onDeletePurchase: (id: string) => void;
}

const categoryColors = {
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

const PurchaseTable = ({ purchases, categories, onUpdatePurchase, onDeletePurchase }: PurchaseTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: ''
  });
  const { toast } = useToast();

  // Create category labels map
  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.label;
    return acc;
  }, {} as Record<string, string>);

  // Filter and sort purchases
  const filteredAndSortedPurchases = useMemo(() => {
    let filtered = purchases.filter(purchase => {
      const matchesSearch = purchase.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || purchase.category === categoryFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const purchaseDate = new Date(purchase.date);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            matchesDate = purchaseDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = purchaseDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            matchesDate = purchaseDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesDate;
    });

    // Sort purchases
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'category':
          aValue = categoryLabels[a.category] || a.category;
          bValue = categoryLabels[b.category] || b.category;
          break;
        case 'date':
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [purchases, searchTerm, categoryFilter, dateFilter, sortBy, sortOrder, categoryLabels]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPurchases = filteredAndSortedPurchases.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setEditForm({
      description: purchase.description,
      amount: purchase.amount.toString(),
      category: purchase.category,
      date: purchase.date
    });
  };

  const handleSaveEdit = () => {
    if (!editingPurchase) return;

    if (!editForm.description || !editForm.amount || !editForm.category) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const updatedPurchase: Purchase = {
      ...editingPurchase,
      description: editForm.description,
      amount: parseFloat(editForm.amount),
      category: editForm.category,
      date: editForm.date
    };

    onUpdatePurchase(updatedPurchase);
    setEditingPurchase(null);
    toast({
      title: "Compra atualizada!",
      description: "Os dados foram salvos com sucesso.",
    });
  };

  const handleDelete = (id: string) => {
    onDeletePurchase(id);
    toast({
      title: "Compra excluída!",
      description: "O registro foi removido com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Planilha de Compras
          </h1>
          <p className="text-gray-600 text-lg">
            Gerencie, filtre e analise todas as suas compras cadastradas
          </p>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Buscar por descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category-filter">Categoria</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${categoryColors[cat.name as keyof typeof categoryColors] || 'bg-gray-500'}`}></div>
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date-filter">Período</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort">Ordenar por</Label>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Data (mais recente)</SelectItem>
                    <SelectItem value="date-asc">Data (mais antiga)</SelectItem>
                    <SelectItem value="amount-desc">Valor (maior)</SelectItem>
                    <SelectItem value="amount-asc">Valor (menor)</SelectItem>
                    <SelectItem value="description-asc">Descrição (A-Z)</SelectItem>
                    <SelectItem value="description-desc">Descrição (Z-A)</SelectItem>
                    <SelectItem value="category-asc">Categoria (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              Compras Cadastradas ({filteredAndSortedPurchases.length} {filteredAndSortedPurchases.length === 1 ? 'item' : 'itens'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('description')}
                    >
                      Descrição {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('amount')}
                    >
                      Valor {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('category')}
                    >
                      Categoria {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('date')}
                    >
                      Data {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.description}</TableCell>
                      <TableCell>R$ {purchase.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${categoryColors[purchase.category as keyof typeof categoryColors] || 'bg-gray-500'}`}></div>
                          <span>{categoryLabels[purchase.category] || purchase.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(purchase.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(purchase)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Compra</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-description">Descrição</Label>
                                  <Input
                                    id="edit-description"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-amount">Valor (R$)</Label>
                                  <Input
                                    id="edit-amount"
                                    type="number"
                                    step="0.01"
                                    value={editForm.amount}
                                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-category">Categoria</Label>
                                  <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                          <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${categoryColors[cat.name as keyof typeof categoryColors] || 'bg-gray-500'}`}></div>
                                            <span>{cat.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-date">Data</Label>
                                  <Input
                                    id="edit-date"
                                    type="date"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                  />
                                </div>
                                <Button onClick={handleSaveEdit} className="w-full">
                                  Salvar Alterações
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a compra "{purchase.description}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(purchase.id)}
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
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {filteredAndSortedPurchases.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Nenhuma compra encontrada com os filtros aplicados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseTable;
