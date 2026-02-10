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
import { Search, Edit, Trash2, Filter, FileSpreadsheet, FileText, BarChart3, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToCSV, exportToPowerBI } from '@/utils/exportUtils';

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
  onAddPurchase: (purchase: Purchase) => void;
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

const PurchaseTable = ({ purchases, categories, onUpdatePurchase, onDeletePurchase, onAddPurchase }: PurchaseTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: ''
  });
  const [newPurchase, setNewPurchase] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.label;
    return acc;
  }, {} as Record<string, string>);

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
      toast({ title: "Erro", description: "Por favor, preencha todos os campos obrigatórios.", variant: "destructive" });
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
    toast({ title: "Compra atualizada!", description: "Os dados foram salvos com sucesso." });
  };

  const handleDelete = (id: string) => {
    onDeletePurchase(id);
    toast({ title: "Compra excluída!", description: "O registro foi removido com sucesso." });
  };

  const handleExportExcel = () => {
    exportToExcel(filteredAndSortedPurchases, categories);
    toast({ title: "Exportação realizada!", description: "Arquivo Excel baixado com sucesso." });
  };

  const handleExportCSV = () => {
    exportToCSV(filteredAndSortedPurchases, categories);
    toast({ title: "Exportação realizada!", description: "Arquivo CSV baixado com sucesso." });
  };

  const handleExportPowerBI = () => {
    exportToPowerBI(filteredAndSortedPurchases, categories);
    toast({ title: "Exportação realizada!", description: "Arquivo JSON para Power BI baixado com sucesso." });
  };

  const handleAddPurchase = () => {
    if (!newPurchase.description || !newPurchase.amount || !newPurchase.category) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    const purchase: Purchase = {
      id: Date.now().toString(),
      description: newPurchase.description,
      amount: parseFloat(newPurchase.amount),
      category: newPurchase.category,
      date: newPurchase.date
    };
    onAddPurchase(purchase);
    setNewPurchase({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
    setShowAddPurchase(false);
    toast({ title: "Compra cadastrada!", description: "Sua compra foi registrada com sucesso." });
  };

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Cadastros de Compras
              </h1>
              <p className="text-muted-foreground text-lg">
                Gerencie, filtre e analise todos os seus cadastros
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Dialog open={showAddPurchase} onOpenChange={setShowAddPurchase}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Compra
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Nova Compra</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="new-description">Descrição *</Label>
                      <Input id="new-description" placeholder="Ex: Supermercado, Farmácia..." value={newPurchase.description} onChange={(e) => setNewPurchase({ ...newPurchase, description: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="new-amount">Valor (R$) *</Label>
                      <Input id="new-amount" type="number" step="0.01" placeholder="0,00" value={newPurchase.amount} onChange={(e) => setNewPurchase({ ...newPurchase, amount: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="new-category">Categoria *</Label>
                      <Select value={newPurchase.category} onValueChange={(value) => setNewPurchase({ ...newPurchase, category: value })}>
                        <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
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
                      <Label htmlFor="new-date">Data</Label>
                      <Input id="new-date" type="date" value={newPurchase.date} onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })} />
                    </div>
                    <Button onClick={handleAddPurchase} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Compra
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </Button>
              
              <div className="flex space-x-2">
                <Button onClick={handleExportExcel} variant="outline" className="flex items-center space-x-2 text-green-500 hover:text-green-400">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Excel</span>
                </Button>
                <Button onClick={handleExportCSV} variant="outline" className="flex items-center space-x-2 text-blue-500 hover:text-blue-400">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">CSV</span>
                </Button>
                <Button onClick={handleExportPowerBI} variant="outline" className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-400">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Power BI</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <Card className="shadow-lg border-border bg-card mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-foreground flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="search" placeholder="Buscar por descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category-filter">Categoria</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
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
                    <SelectTrigger><SelectValue placeholder="Todos os períodos" /></SelectTrigger>
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
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => { const [newSortBy, newSortOrder] = value.split('-'); setSortBy(newSortBy); setSortOrder(newSortOrder); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
        )}

        {/* Enhanced Table */}
        <Card className="shadow-lg border-border bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl text-foreground">
                Cadastros ({filteredAndSortedPurchases.length} {filteredAndSortedPurchases.length === 1 ? 'item' : 'itens'})
              </CardTitle>
              <div className="text-sm text-muted-foreground font-medium">
                Total: R$ {filteredAndSortedPurchases.reduce((sum, p) => sum + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-accent font-semibold" onClick={() => handleSort('description')}>
                      Descrição {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-accent font-semibold text-right" onClick={() => handleSort('amount')}>
                      Valor {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-accent font-semibold" onClick={() => handleSort('category')}>
                      Categoria {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-accent font-semibold" onClick={() => handleSort('date')}>
                      Data {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="font-semibold text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPurchases.map((purchase) => (
                    <TableRow key={purchase.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium py-4">{purchase.description}</TableCell>
                      <TableCell className="text-right py-4 font-semibold text-green-500">
                        R$ {purchase.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${categoryColors[purchase.category as keyof typeof categoryColors] || 'bg-gray-500'}`}></div>
                          <span className="font-medium">{categoryLabels[purchase.category] || purchase.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-medium">{new Date(purchase.date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex justify-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(purchase)}>
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
                                  <Input id="edit-description" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                                </div>
                                <div>
                                  <Label htmlFor="edit-amount">Valor (R$)</Label>
                                  <Input id="edit-amount" type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
                                </div>
                                <div>
                                  <Label htmlFor="edit-category">Categoria</Label>
                                  <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                                  <Input id="edit-date" type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} />
                                </div>
                                <Button onClick={handleSaveEdit} className="w-full">Salvar Alterações</Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
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
                                <AlertDialogAction onClick={() => handleDelete(purchase.id)} className="bg-destructive hover:bg-destructive/90">
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

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {filteredAndSortedPurchases.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-lg">Nenhuma compra encontrada com os filtros aplicados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseTable;
