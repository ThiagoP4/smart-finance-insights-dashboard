import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Income {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  recurring: boolean;
}

interface AddIncomeFormProps {
  onAddIncome: (income: Income) => void;
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

const AddIncomeForm = ({ onAddIncome }: AddIncomeFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurring, setRecurring] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !type) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const income: Income = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      type,
      date,
      recurring
    };

    onAddIncome(income);
    
    // Reset form
    setDescription('');
    setAmount('');
    setType('');
    setDate(new Date().toISOString().split('T')[0]);
    setRecurring(false);
    
    toast({
      title: "Entrada cadastrada!",
      description: "Sua entrada foi registrada com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Cadastrar Nova Entrada
          </h1>
          <p className="text-gray-600 text-lg">
            Registre suas receitas para ter um controle completo das suas finanças
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-center text-gray-800 flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-500" />
              Detalhes da Entrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Descrição da Entrada *
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Ex: Salário Janeiro, Freelance Design..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Valor (R$) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Tipo de Entrada *
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeTypes.map((incomeType) => (
                      <SelectItem key={incomeType.id} value={incomeType.name}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${incomeType.color}`}></div>
                          <span>{incomeType.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Data da Entrada
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="recurring"
                  type="checkbox"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="w-5 h-5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                />
                <Label htmlFor="recurring" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Entrada recorrente (mensal)
                </Label>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Cadastrar Entrada
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddIncomeForm;
