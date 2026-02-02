import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, 
  ArrowUpDown, DollarSign, Calendar, RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Income {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  recurring: boolean;
}

interface IncomeTableProps {
  incomes: Income[];
  onUpdateIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => void;
}

const incomeTypes = [
  { id: 'salary', name: 'salary', label: 'Salário', color: 'bg-emerald-500' },
  { id: 'freelance', name: 'freelance', label: 'Freelance', color: 'bg-blue-500' },
  { id: 'investment', name: 'investment', label: 'Investimentos', color: 'bg-purple-500' },
  { id: 'rental', name: 'rental', label: 'Aluguel', color: 'bg-orange-500' },
  { id: 'bonus', name: 'bonus', label: 'Bônus', color: 'bg-yellow-500' },
  { id: 'gift', name: 'gift', label: 'Presente/Doação', color: 'bg-pink-500' },
  { id: 'refund', name: 'refund', label: 'Reembolso', color: 'bg-cyan-500' },
  { id: 'other', name: 'other', label: 'Outros', color: 'bg-gray-500' },
];

const typeLabels: Record<string, string> = {
  salary: 'Salário',
  freelance: 'Freelance',
  investment: 'Investimentos',
  rental: 'Aluguel',
  bonus: 'Bônus',
  gift: 'Presente/Doação',
  refund: 'Reembolso',
  other: 'Outros'
};

const typeColors: Record<string, string> = {
  salary: 'bg-emerald-100 text-emerald-700',
  freelance: 'bg-blue-100 text-blue-700',
  investment: 'bg-purple-100 text-purple-700',
  rental: 'bg-orange-100 text-orange-700',
  bonus: 'bg-yellow-100 text-yellow-700',
  gift: 'bg-pink-100 text-pink-700',
  refund: 'bg-cyan-100 text-cyan-700',
  other: 'bg-gray-100 text-gray-700'
};

const IncomeTable = ({ incomes, onUpdateIncome, onDeleteIncome }: IncomeTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRecurring, setFilterRecurring] = useState('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'description'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editForm, setEditForm] = useState<Income | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 10;

  const filteredAndSortedIncomes = useMemo(() => {
    let result = [...incomes];

    // Filter by search
    if (searchTerm) {
      result = result.filter(income =>
        income.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(income => income.type === filterType);
    }

    // Filter by recurring
    if (filterRecurring !== 'all') {
      result = result.filter(income => 
        filterRecurring === 'recurring' ? income.recurring : !income.recurring
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'description') {
        comparison = a.description.localeCompare(b.description);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [incomes, searchTerm, filterType, filterRecurring, sortField, sortDirection]);

  const paginatedIncomes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedIncomes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedIncomes, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedIncomes.length / itemsPerPage);
  const totalAmount = filteredAndSortedIncomes.reduce((sum, income) => sum + income.amount, 0);

  const handleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setEditForm({ ...income });
  };

  const handleSaveEdit = () => {
    if (editForm) {
      onUpdateIncome(editForm);
      setEditingIncome(null);
      setEditForm(null);
      toast({
        title: "Entrada atualizada!",
        description: "As informações foram salvas com sucesso.",
      });
    }
  };

  const handleDelete = (id: string) => {
    onDeleteIncome(id);
    toast({
      title: "Entrada excluída!",
      description: "A entrada foi removida com sucesso.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Entradas
          </h1>
          <p className="text-gray-600">Gerencie suas receitas e rendas</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Minhas Entradas
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{filteredAndSortedIncomes.length} registros</span>
                  <span>•</span>
                  <span className="font-bold text-emerald-600">
                    R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar entradas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-emerald-50 border-emerald-300' : ''}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Tipo</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {incomeTypes.map(type => (
                        <SelectItem key={type.id} value={type.name}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Recorrência</Label>
                  <Select value={filterRecurring} onValueChange={setFilterRecurring}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="recurring">Recorrentes</SelectItem>
                      <SelectItem value="one-time">Únicas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center gap-1">
                        Descrição
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-1">
                        Valor
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Data
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead>Recorrente</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedIncomes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Nenhuma entrada encontrada</p>
                        <p className="text-sm">Cadastre suas entradas para visualizá-las aqui</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedIncomes.map((income) => (
                      <TableRow key={income.id} className="hover:bg-emerald-50/30 transition-colors">
                        <TableCell className="font-medium">{income.description}</TableCell>
                        <TableCell className="font-bold text-emerald-600">
                          R$ {income.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[income.type] || 'bg-gray-100 text-gray-700'}`}>
                            {typeLabels[income.type] || income.type}
                          </span>
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {new Date(income.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {income.recurring ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <RefreshCw className="w-3 h-3" />
                              Sim
                            </span>
                          ) : (
                            <span className="text-gray-400">Não</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => handleEdit(income)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Entrada</DialogTitle>
                                </DialogHeader>
                                {editForm && (
                                  <div className="space-y-4 pt-4">
                                    <div>
                                      <Label>Descrição</Label>
                                      <Input
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label>Valor</Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm.amount}
                                        onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                                      />
                                    </div>
                                    <div>
                                      <Label>Tipo</Label>
                                      <Select value={editForm.type} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {incomeTypes.map(type => (
                                            <SelectItem key={type.id} value={type.name}>{type.label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Data</Label>
                                      <Input
                                        type="date"
                                        value={editForm.date}
                                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={editForm.recurring}
                                        onChange={(e) => setEditForm({ ...editForm, recurring: e.target.checked })}
                                        className="w-4 h-4"
                                      />
                                      <Label>Recorrente</Label>
                                    </div>
                                    <Button onClick={handleSaveEdit} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                      Salvar Alterações
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(income.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedIncomes.length)} de {filteredAndSortedIncomes.length}
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

export default IncomeTable;
