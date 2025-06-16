
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Purchase {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface AddPurchaseFormProps {
  onAddPurchase: (purchase: Purchase) => void;
}

const categories = [
  { value: 'food', label: 'Alimentícia', color: 'bg-green-500' },
  { value: 'pharmacy', label: 'Farmacêutica', color: 'bg-red-500' },
  { value: 'subscriptions', label: 'Assinaturas', color: 'bg-purple-500' },
  { value: 'transport', label: 'Transporte', color: 'bg-blue-500' },
  { value: 'clothing', label: 'Vestuário', color: 'bg-pink-500' },
  { value: 'entertainment', label: 'Entretenimento', color: 'bg-yellow-500' },
  { value: 'health', label: 'Saúde', color: 'bg-teal-500' },
  { value: 'education', label: 'Educação', color: 'bg-indigo-500' },
  { value: 'utilities', label: 'Contas/Utilidades', color: 'bg-orange-500' },
  { value: 'others', label: 'Outros', color: 'bg-gray-500' }
];

const AddPurchaseForm = ({ onAddPurchase }: AddPurchaseFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !category) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const purchase: Purchase = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category,
      date
    };

    onAddPurchase(purchase);
    
    // Reset form
    setDescription('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    
    toast({
      title: "Compra cadastrada!",
      description: "Sua compra foi registrada com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Cadastrar Nova Compra
          </h1>
          <p className="text-gray-600 text-lg">
            Registre suas compras para acompanhar seus gastos e receber análises personalizadas
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-center text-gray-800">
              Detalhes da Compra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Descrição da Compra *
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Ex: Supermercado, Farmácia, Netflix..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Categoria *
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Data da Compra
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Cadastrar Compra
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de cadastrar uma compra via WhatsApp', '_blank')}
                  variant="outline"
                  className="w-full bg-green-50 border-green-200 text-green-600 hover:bg-green-100 h-12 text-lg font-medium shadow-sm hover:shadow-md transition-all hover:scale-105"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Cadastrar via WhatsApp
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddPurchaseForm;
