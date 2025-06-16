
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

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

interface DashboardProps {
  purchases: Purchase[];
  categories?: Category[];
}

const categoryColors = {
  food: '#10b981',
  pharmacy: '#ef4444',
  subscriptions: '#8b5cf6',
  transport: '#3b82f6',
  clothing: '#ec4899',
  entertainment: '#eab308',
  health: '#14b8a6',
  education: '#6366f1',
  utilities: '#f97316',
  others: '#6b7280'
};

const defaultCategoryLabels = {
  food: 'Alimentícia',
  pharmacy: 'Farmacêutica',
  subscriptions: 'Assinaturas',
  transport: 'Transporte',
  clothing: 'Vestuário',
  entertainment: 'Entretenimento',
  health: 'Saúde',
  education: 'Educação',
  utilities: 'Contas/Utilidades',
  others: 'Outros'
};

const Dashboard = ({ purchases, categories = [] }: DashboardProps) => {
  // Create category labels map from categories prop or use defaults
  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.label;
    return acc;
  }, {} as Record<string, string>);

  // Merge with default labels for backward compatibility
  const allCategoryLabels = { ...defaultCategoryLabels, ...categoryLabels };

  // Calculate total spending
  const totalSpending = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

  // Calculate spending by category
  const categoryData = Object.entries(
    purchases.reduce((acc, purchase) => {
      acc[purchase.category] = (acc[purchase.category] || 0) + purchase.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    name: allCategoryLabels[category] || category,
    value: amount,
    color: categoryColors[category as keyof typeof categoryColors] || '#6b7280'
  }));

  // Calculate monthly spending
  const monthlyData = purchases.reduce((acc, purchase) => {
    const month = new Date(purchase.date).toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + purchase.amount;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount
  }));

  const recentPurchases = purchases.slice(-5);
  const previousPurchases = purchases.slice(-10, -5);
  const recentTotal = recentPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const previousTotal = previousPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const trend = recentTotal > previousTotal ? 'up' : 'down';
  const trendPercentage = previousTotal > 0 ? Math.abs(((recentTotal - previousTotal) / previousTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Dashboard Financeiro
          </h1>
          <p className="text-gray-600 text-lg">
            Análise completa dos seus gastos e tendências de consumo
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Gasto</p>
                  <p className="text-2xl font-bold">
                    R$ {totalSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Compras Realizadas</p>
                  <p className="text-2xl font-bold">{purchases.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Média por Compra</p>
                  <p className="text-2xl font-bold">
                    R$ {purchases.length > 0 ? (totalSpending / purchases.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${trend === 'up' ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} text-white border-0 shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${trend === 'up' ? 'text-red-100' : 'text-green-100'} text-sm font-medium`}>Tendência</p>
                  <p className="text-2xl font-bold">
                    {trend === 'up' ? '+' : '-'}{trendPercentage.toFixed(1)}%
                  </p>
                </div>
                {trend === 'up' ? 
                  <TrendingUp className="w-8 h-8 text-red-200" /> : 
                  <TrendingDown className="w-8 h-8 text-green-200" />
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Gastos por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Gastos']} />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Análise Detalhada por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Insights da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-blue-700">
                  🔍 <strong>Análise Principal:</strong> {categoryData.length > 0 ? 
                    `Sua maior categoria de gastos é ${categoryData.sort((a, b) => b.value - a.value)[0]?.name}` :
                    'Comece cadastrando suas compras para receber análises personalizadas'
                  }
                </p>
                <p className="text-blue-700">
                  📊 <strong>Tendência:</strong> {trend === 'up' ? 
                    'Seus gastos aumentaram nas últimas compras. Considere revisar seu orçamento.' :
                    'Parabéns! Seus gastos diminuíram recentemente.'
                  }
                </p>
                <p className="text-blue-700">
                  💡 <strong>Dica:</strong> Mantenha o controle registrando todas as compras para análises mais precisas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-green-800">Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-green-700">
                  💰 <strong>Economia:</strong> {totalSpending > 1000 ? 
                    'Considere definir um limite mensal para suas principais categorias de gastos.' :
                    'Você está mantendo um bom controle dos gastos!'
                  }
                </p>
                <p className="text-green-700">
                  📱 <strong>Facilidade:</strong> Use nosso bot do WhatsApp para registrar compras rapidamente.
                </p>
                <p className="text-green-700">
                  📈 <strong>Acompanhamento:</strong> Verifique seu dashboard semanalmente para manter o controle.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
