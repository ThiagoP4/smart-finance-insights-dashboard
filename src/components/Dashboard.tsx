import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Wallet, ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';

interface Purchase {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface Income {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  recurring: boolean;
}

interface Category {
  id: string;
  name: string;
  label: string;
}

interface DashboardProps {
  purchases: Purchase[];
  incomes?: Income[];
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

const incomeTypeColors = {
  salary: '#10b981',
  freelance: '#3b82f6',
  investment: '#8b5cf6',
  rental: '#f97316',
  bonus: '#eab308',
  gift: '#ec4899',
  refund: '#14b8a6',
  other: '#6b7280'
};

const incomeTypeLabels: Record<string, string> = {
  salary: 'Salário',
  freelance: 'Freelance',
  investment: 'Investimentos',
  rental: 'Aluguel',
  bonus: 'Bônus',
  gift: 'Presente/Doação',
  refund: 'Reembolso',
  other: 'Outros'
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

const Dashboard = ({ purchases, incomes = [], categories = [] }: DashboardProps) => {
  // Create category labels map from categories prop or use defaults
  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.label;
    return acc;
  }, {} as Record<string, string>);

  // Merge with default labels for backward compatibility
  const allCategoryLabels = { ...defaultCategoryLabels, ...categoryLabels };

  // Calculate totals
  const totalSpending = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const balance = totalIncome - totalSpending;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0;

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

  // Calculate income by type
  const incomeTypeData = Object.entries(
    incomes.reduce((acc, income) => {
      acc[income.type] = (acc[income.type] || 0) + income.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, amount]) => ({
    name: incomeTypeLabels[type] || type,
    value: amount,
    color: incomeTypeColors[type as keyof typeof incomeTypeColors] || '#6b7280'
  }));

  // Calculate monthly data for income vs expenses
  const monthlyComparisonData = () => {
    const monthlyMap: Record<string, { month: string; income: number; expenses: number }> = {};
    
    purchases.forEach(purchase => {
      const month = new Date(purchase.date).toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, income: 0, expenses: 0 };
      }
      monthlyMap[month].expenses += purchase.amount;
    });

    incomes.forEach(income => {
      const month = new Date(income.date).toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, income: 0, expenses: 0 };
      }
      monthlyMap[month].income += income.amount;
    });

    return Object.values(monthlyMap).sort((a, b) => {
      const parseDate = (str: string) => {
        const [monthStr, yearStr] = str.split(' ');
        const monthMap: Record<string, number> = { 'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11 };
        return new Date(2000 + parseInt(yearStr), monthMap[monthStr.toLowerCase()] || 0);
      };
      return parseDate(a.month).getTime() - parseDate(b.month).getTime();
    });
  };

  const comparisonData = monthlyComparisonData();

  // Calculate balance evolution
  const balanceEvolutionData = comparisonData.map((item, index) => {
    const previousBalance = comparisonData.slice(0, index).reduce((acc, curr) => acc + (curr.income - curr.expenses), 0);
    return {
      month: item.month,
      balance: previousBalance + (item.income - item.expenses),
      income: item.income,
      expenses: item.expenses
    };
  });

  const recentPurchases = purchases.slice(-5);
  const previousPurchases = purchases.slice(-10, -5);
  const recentTotal = recentPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const previousTotal = previousPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const trend = recentTotal > previousTotal ? 'up' : 'down';
  const trendPercentage = previousTotal > 0 ? Math.abs(((recentTotal - previousTotal) / previousTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Dashboard Financeiro
          </h1>
          <p className="text-gray-600 text-lg">
            Análise completa dos seus gastos, receitas e tendências
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Receitas</p>
                  <p className="text-2xl font-bold">
                    R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Despesas</p>
                  <p className="text-2xl font-bold">
                    R$ {totalSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <ArrowDownRight className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white border-0 shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${balance >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm font-medium`}>Saldo</p>
                  <p className="text-2xl font-bold">
                    R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Scale className="w-8 h-8 text-white/60" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${savingsRate >= 0 ? 'from-purple-500 to-purple-600' : 'from-gray-500 to-gray-600'} text-white border-0 shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Taxa de Economia</p>
                  <p className="text-2xl font-bold">
                    {savingsRate.toFixed(1)}%
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Compras Realizadas</p>
                  <p className="text-2xl font-bold text-gray-800">{purchases.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Média por Compra</p>
                  <p className="text-2xl font-bold text-gray-800">
                    R$ {purchases.length > 0 ? (totalSpending / purchases.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Tendência Gastos</p>
                  <p className={`text-2xl font-bold ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                    {trend === 'up' ? '+' : '-'}{trendPercentage.toFixed(1)}%
                  </p>
                </div>
                {trend === 'up' ? 
                  <TrendingUp className="w-8 h-8 text-red-400" /> : 
                  <TrendingDown className="w-8 h-8 text-green-400" />
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income vs Expenses Comparison */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">📊 Receitas vs Despesas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                />
                <Legend />
                <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Balance Evolution */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">📈 Evolução do Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={balanceEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  name="Saldo Acumulado"
                  stroke="#3b82f6" 
                  fill="url(#balanceGradient)" 
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">💸 Gastos por Categoria</CardTitle>
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
              <CardTitle className="text-xl text-gray-800">💰 Receitas por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {incomeTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incomeTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomeTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  <div className="text-center">
                    <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Cadastre suas entradas para ver o gráfico</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">📋 Análise Detalhada por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  💰 <strong>Saldo:</strong> {balance >= 0 ? 
                    `Você está com saldo positivo de R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Continue assim!` :
                    `Atenção! Suas despesas superam suas receitas em R$ ${Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  }
                </p>
                <p className="text-blue-700">
                  📊 <strong>Tendência:</strong> {trend === 'up' ? 
                    'Seus gastos aumentaram nas últimas compras. Considere revisar seu orçamento.' :
                    'Parabéns! Seus gastos diminuíram recentemente.'
                  }
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
                  💡 <strong>Economia:</strong> {savingsRate >= 20 ? 
                    `Excelente! Você está economizando ${savingsRate.toFixed(1)}% das suas receitas.` :
                    savingsRate >= 0 ?
                    `Tente aumentar sua taxa de economia para pelo menos 20% das receitas.` :
                    'Atenção: você está gastando mais do que ganha!'
                  }
                </p>
                <p className="text-green-700">
                  📱 <strong>Facilidade:</strong> Use nosso bot do WhatsApp para registrar compras rapidamente.
                </p>
                <p className="text-green-700">
                  📈 <strong>Acompanhamento:</strong> Cadastre todas as suas receitas para ter uma visão completa.
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
