import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Scale, Calendar } from 'lucide-react';

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

const categoryColors: Record<string, string> = {
  food: '#10b981', pharmacy: '#ef4444', subscriptions: '#a78bfa', transport: '#60a5fa',
  clothing: '#f472b6', entertainment: '#facc15', health: '#2dd4bf', education: '#818cf8',
  utilities: '#fb923c', others: '#9ca3af'
};

const incomeTypeColors: Record<string, string> = {
  salary: '#10b981', freelance: '#60a5fa', investment: '#a78bfa', rental: '#fb923c',
  bonus: '#facc15', gift: '#f472b6', refund: '#2dd4bf', other: '#9ca3af'
};

const incomeTypeLabels: Record<string, string> = {
  salary: 'Salário', freelance: 'Freelance', investment: 'Investimentos', rental: 'Aluguel',
  bonus: 'Bônus', gift: 'Presente/Doação', refund: 'Reembolso', other: 'Outros'
};

const defaultCategoryLabels: Record<string, string> = {
  food: 'Alimentícia', pharmacy: 'Farmacêutica', subscriptions: 'Assinaturas', transport: 'Transporte',
  clothing: 'Vestuário', entertainment: 'Entretenimento', health: 'Saúde', education: 'Educação',
  utilities: 'Contas/Utilidades', others: 'Outros'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl px-4 py-3 text-sm">
      <p className="text-foreground font-semibold mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: R$ {Number(entry.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl px-4 py-3 text-sm">
      <p className="text-foreground font-semibold">{payload[0].name}</p>
      <p className="text-muted-foreground">
        R$ {Number(payload[0].value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

const Dashboard = ({ purchases, incomes = [], categories = [] }: DashboardProps) => {
  const categoryLabels = categories.reduce((acc, cat) => { acc[cat.name] = cat.label; return acc; }, {} as Record<string, string>);
  const allCategoryLabels = { ...defaultCategoryLabels, ...categoryLabels };

  const totalSpending = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncome - totalSpending;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0;

  const categoryData = Object.entries(
    purchases.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + p.amount; return acc; }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    name: allCategoryLabels[category] || category,
    value: amount,
    color: categoryColors[category] || '#9ca3af'
  }));

  const incomeTypeData = Object.entries(
    incomes.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + i.amount; return acc; }, {} as Record<string, number>)
  ).map(([type, amount]) => ({
    name: incomeTypeLabels[type] || type,
    value: amount,
    color: incomeTypeColors[type] || '#9ca3af'
  }));

  const monthlyComparisonData = () => {
    const map: Record<string, { month: string; income: number; expenses: number }> = {};
    purchases.forEach(p => {
      const m = new Date(p.date).toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
      if (!map[m]) map[m] = { month: m, income: 0, expenses: 0 };
      map[m].expenses += p.amount;
    });
    incomes.forEach(i => {
      const m = new Date(i.date).toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
      if (!map[m]) map[m] = { month: m, income: 0, expenses: 0 };
      map[m].income += i.amount;
    });
    return Object.values(map).sort((a, b) => {
      const parse = (s: string) => {
        const [mStr, yStr] = s.split(' ');
        const mMap: Record<string, number> = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
        return new Date(2000 + parseInt(yStr), mMap[mStr.toLowerCase()] || 0);
      };
      return parse(a.month).getTime() - parse(b.month).getTime();
    });
  };

  const comparisonData = monthlyComparisonData();

  const balanceEvolutionData = comparisonData.map((item, index) => {
    const prev = comparisonData.slice(0, index).reduce((a, c) => a + (c.income - c.expenses), 0);
    return { month: item.month, balance: prev + (item.income - item.expenses) };
  });

  const recentPurchases = purchases.slice(-5);
  const previousPurchases = purchases.slice(-10, -5);
  const recentTotal = recentPurchases.reduce((sum, p) => sum + p.amount, 0);
  const previousTotal = previousPurchases.reduce((sum, p) => sum + p.amount, 0);
  const trend = recentTotal > previousTotal ? 'up' : 'down';
  const trendPercentage = previousTotal > 0 ? Math.abs(((recentTotal - previousTotal) / previousTotal) * 100) : 0;

  const axisStyle = { fill: 'hsl(var(--muted-foreground))', fontSize: 11 };
  const gridStyle = { stroke: 'hsl(var(--border))', strokeDasharray: '3 3' };

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h1>
          <p className="text-muted-foreground text-sm">Análise completa dos seus gastos, receitas e tendências</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-success/15 to-success/5 border-success/20 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground">Receitas</p>
                  <p className="text-lg font-bold text-foreground">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <ArrowDownRight className="w-6 h-6 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-destructive/15 to-destructive/5 border-destructive/20 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground">Despesas</p>
                  <p className="text-lg font-bold text-foreground">R$ {totalSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground">Saldo</p>
                  <p className="text-lg font-bold text-foreground">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <Scale className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/15 to-accent/5 border-accent/20 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground">Economia</p>
                  <p className="text-lg font-bold text-foreground">{savingsRate.toFixed(1)}%</p>
                </div>
                <Wallet className="w-6 h-6 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts row 1: Comparison + Balance evolution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">📊 Receitas vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonData} barGap={6}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" name="Receitas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Despesas" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">📈 Evolução do Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={balanceEvolutionData}>
                  <defs>
                    <linearGradient id="balGradDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="balance" name="Saldo" stroke="hsl(var(--primary))" fill="url(#balGradDash)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts row 2: Category donut + Income donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">💸 Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground"><p className="text-sm">Cadastre compras para visualizar</p></div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                        {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {[...categoryData].sort((a, b) => b.value - a.value).slice(0, 6).map((cat, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-foreground">{cat.name}</span>
                        </div>
                        <span className="text-muted-foreground font-medium">R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">💰 Receitas por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {incomeTypeData.length === 0 ? (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  <div className="text-center">
                    <Wallet className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm">Cadastre entradas para ver o gráfico</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
                      <Pie data={incomeTypeData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                        {incomeTypeData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {[...incomeTypeData].sort((a, b) => b.value - a.value).slice(0, 6).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-foreground">{item.name}</span>
                        </div>
                        <span className="text-muted-foreground font-medium">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/15 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                🔍 <strong className="text-foreground">Maior gasto:</strong>{' '}
                {categoryData.length > 0 ? [...categoryData].sort((a, b) => b.value - a.value)[0]?.name : 'Sem dados'}
              </p>
              <p className="text-muted-foreground">
                💰 <strong className="text-foreground">Saldo:</strong>{' '}
                {balance >= 0 ? `Positivo em R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `Negativo em R$ ${Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              </p>
              <p className="text-muted-foreground">
                📊 <strong className="text-foreground">Tendência:</strong>{' '}
                {trend === 'up' ? `Gastos aumentaram ${trendPercentage.toFixed(1)}%` : `Gastos diminuíram ${trendPercentage.toFixed(1)}%`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/15 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Recomendações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                💡 <strong className="text-foreground">Economia:</strong>{' '}
                {savingsRate >= 20 ? `Excelente! ${savingsRate.toFixed(1)}% das receitas` : savingsRate >= 0 ? 'Tente economizar pelo menos 20%' : 'Atenção: gastando mais do que ganha!'}
              </p>
              <p className="text-muted-foreground">
                📈 <strong className="text-foreground">Dica:</strong> Cadastre todas as receitas para uma visão completa.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
