
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Tag } from 'lucide-react';

interface AddCategoryFormProps {
  onAddCategory: (category: { id: string; name: string; label: string }) => void;
  onBack: () => void;
}

const AddCategoryForm = ({ onAddCategory, onBack }: AddCategoryFormProps) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim() && categoryLabel.trim()) {
      const newCategory = {
        id: categoryName.toLowerCase().replace(/\s+/g, ''),
        name: categoryName.toLowerCase().replace(/\s+/g, ''),
        label: categoryLabel.trim()
      };
      onAddCategory(newCategory);
      setCategoryName('');
      setCategoryLabel('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <Tag className="w-6 h-6 mr-2 text-blue-600" />
              Cadastrar Nova Categoria
            </CardTitle>
            <p className="text-gray-600">Adicione uma nova categoria para organizar seus gastos</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nome da Categoria (ID)</Label>
                <Input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: eletronicos"
                  className="bg-white/70"
                  required
                />
                <p className="text-sm text-gray-500">
                  Este será usado como identificador interno (sem espaços ou caracteres especiais)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoryLabel">Nome de Exibição</Label>
                <Input
                  id="categoryLabel"
                  type="text"
                  value={categoryLabel}
                  onChange={(e) => setCategoryLabel(e.target.value)}
                  placeholder="Ex: Eletrônicos"
                  className="bg-white/70"
                  required
                />
                <p className="text-sm text-gray-500">
                  Este será o nome mostrado nos formulários e gráficos
                </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Categoria
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCategoryForm;
