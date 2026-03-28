import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Scale, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CreditCardData } from './ProfileScreen';
import { matchBrand, getBrandLogo } from '@/utils/brandMap';

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
  food: '#10b981',
  pharmacy: '#ef4444',
  subscriptions: '#a78bfa',
  transport: '#60a5fa',
  clothing: '#f472b6',
  entertainment: '#facc15',
  health: '#2dd4bf',
  education: '#818cf8',
  utilities: '#fb923c',
  others: '#9ca3af'
};

const defaultCategoryLabels: Record<string, string> = {
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

/* Small card brand logo */
const CardBrandLogo = ({ name }: { name: string }) => {
  const brand = matchBrand(name);
  const [err, setErr] = useState(false);
  if (!brand || err) return <CreditCard className="w-6 h-6 text-muted-foreground" />;
  return <img src={getBrandLogo(brand.domain)} alt={brand.name} className="w-6 h-6 rounded object-contain" onError={() => setErr(true)} />;
};

const Dashboard = ({ purchases, incomes = [], categories = [] }: DashboardProps) => {
  const [cards, setCards] = useState<CreditCardData[]>([]);
  const [cardScrollIndex, setCardScrollIndex] = useState(0);
  const [statsView, setStatsView] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    const stored = localStorage.getItem('financeAI_cards');
    if (stored) setCards(JSON.parse(stored));
  }, []);

  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.label;
    return acc;
  }, {} as Record<string, string>);
  const allCategoryLabels = { ...defaultCategoryLabels, ...categoryLabels };

  const totalSpending = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncome - totalSpending;

  const categoryData = Object.entries(
    purchases.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + p.amount; return acc; }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    name: allCategoryLabels[category] || category,
    value: amount,
    color: categoryColors[category] || '#9ca3af'
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

  const recentPurchases = [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const axisStyle = { fill: 'hsl(var(--muted-foreground))', fontSize: 11 };

  const visibleCards = cards.slice(cardScrollIndex, cardScrollIndex + 3);

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Olá! 👋</h1>
          <p className="text-muted-foreground text-sm">Todas as informações das suas finanças abaixo.</p>
        </div>

        {/* Top row: Balance card + Credit cards */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          {/* Balance Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Saldo disponível</p>
              <p className={`text-4xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex gap-6 mt-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Receitas</p>
                    <p className="text-sm font-semibold text-foreground">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Despesas</p>
                    <p className="text-sm font-semibold text-foreground">R$ {totalSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Cards Carousel */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Meus Cartões</p>
              {cards.length > 3 && (
                <div className="flex gap-1">
                  <button onClick={() => setCardScrollIndex(Math.max(0, cardScrollIndex - 1))} disabled={cardScrollIndex === 0} className="p-1 rounded hover:bg-secondary disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCardScrollIndex(Math.min(cards.length - 3, cardScrollIndex + 1))} disabled={cardScrollIndex >= cards.length - 3} className="p-1 rounded hover:bg-secondary disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {cards.length === 0 ? (
              <Card className="flex-1 flex items-center justify-center border-dashed">
                <CardContent className="py-6 text-center">
                  <CreditCard className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Cadastre cartões no Perfil</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
                {visibleCards.map(card => (
                  <Card key={card.id} className="bg-card shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between mb-3">
                        <CardBrandLogo name={card.name} />
                        <span className="text-[10px] text-muted-foreground font-medium">{card.name}</span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">•••• {card.lastDigits}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Fecha dia {card.closingDay} · Vence dia {card.dueDay}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle row: Transactions + Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Recent Transactions */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPurchases.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma transação registrada</p>
              ) : (
                recentPurchases.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: (categoryColors[p.category] || '#9ca3af') + '20' }}>
                        <DollarSign className="w-4 h-4" style={{ color: categoryColors[p.category] || '#9ca3af' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.description}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(p.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-destructive">
                      -R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground">Estatísticas</CardTitle>
                <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                  <button
                    onClick={() => setStatsView('monthly')}
                    className={`px-3 py-1 transition-colors ${statsView === 'monthly' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    Mensal
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Receitas</p>
                    <p className="text-sm font-bold text-foreground">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-destructive" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Despesas</p>
                    <p className="text-sm font-bold text-foreground">R$ {totalSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={comparisonData} barGap={4}>
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" name="Receitas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Despesas" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: Category donut + Balance evolution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  <p className="text-sm">Cadastre compras para visualizar</p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={55}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="hsl(var(--card))"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {categoryData.sort((a, b) => b.value - a.value).slice(0, 5).map((cat, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-foreground">{cat.name}</span>
                        </div>
                        <span className="text-muted-foreground font-medium">
                          R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Evolução do Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={comparisonData.map((item, index) => {
                  const prev = comparisonData.slice(0, index).reduce((a, c) => a + (c.income - c.expenses), 0);
                  return { month: item.month, balance: prev + (item.income - item.expenses) };
                })}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="balance" name="Saldo" stroke="hsl(var(--primary))" fill="url(#balGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
