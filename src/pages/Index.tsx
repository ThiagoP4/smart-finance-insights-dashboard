import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Dashboard from '@/components/Dashboard';
import RegistrosScreen from '@/components/RegistrosScreen';
import AIChatMode from '@/components/AIChatMode';
import Login from '@/components/Login';
import ProfileScreen from '@/components/ProfileScreen';
import SettingsScreen from '@/components/SettingsScreen';
import { useAuth } from '@/contexts/AuthContext';

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

interface Income {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  recurring: boolean;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [contextMode, setContextMode] = useState<'month' | 'card'>('month');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleContextChange = (mode: 'month' | 'card', cardId?: string) => {
    setContextMode(mode);
    if (mode === 'card' && cardId) setSelectedCardId(cardId);
  };

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'food', name: 'food', label: 'Alimentícia' },
    { id: 'pharmacy', name: 'pharmacy', label: 'Farmacêutica' },
    { id: 'subscriptions', name: 'subscriptions', label: 'Assinaturas' },
    { id: 'transport', name: 'transport', label: 'Transporte' },
    { id: 'clothing', name: 'clothing', label: 'Vestuário' },
    { id: 'entertainment', name: 'entertainment', label: 'Entretenimento' },
    { id: 'health', name: 'health', label: 'Saúde' },
    { id: 'education', name: 'education', label: 'Educação' },
    { id: 'utilities', name: 'utilities', label: 'Contas/Utilidades' },
    { id: 'others', name: 'others', label: 'Outros' }
  ]);

  // Load data from localStorage when authenticated
  useEffect(() => {
    if (user) {
      const savedPurchases = localStorage.getItem('financeAI_purchases');
      const savedCategories = localStorage.getItem('financeAI_categories');
      const savedIncomes = localStorage.getItem('financeAI_incomes');
      
      if (savedPurchases) setPurchases(JSON.parse(savedPurchases));
      if (savedIncomes) setIncomes(JSON.parse(savedIncomes));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
    }
  }, [user]);

  // Save to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('financeAI_purchases', JSON.stringify(purchases));
  }, [purchases, user]);

  useEffect(() => {
    if (user) localStorage.setItem('financeAI_categories', JSON.stringify(categories));
  }, [categories, user]);

  useEffect(() => {
    if (user) localStorage.setItem('financeAI_incomes', JSON.stringify(incomes));
  }, [incomes, user]);

  const handleLogout = async () => {
    await signOut();
    setActiveSection('home');
  };

  const handleAddPurchase = (purchase: Purchase) => setPurchases(prev => [...prev, purchase]);
  const handleUpdatePurchase = (p: Purchase) => setPurchases(prev => prev.map(x => x.id === p.id ? p : x));
  const handleDeletePurchase = (id: string) => setPurchases(prev => prev.filter(x => x.id !== id));
  const handleAddCategory = (c: Category) => setCategories(prev => [...prev, c]);
  const handleUpdateCategory = (c: Category) => setCategories(prev => prev.map(x => x.id === c.id ? c : x));
  const handleDeleteCategory = (id: string) => setCategories(prev => prev.filter(x => x.id !== id));
  const handleAddIncome = (i: Income) => setIncomes(prev => [...prev, i]);
  const handleUpdateIncome = (i: Income) => setIncomes(prev => prev.map(x => x.id === i.id ? i : x));
  const handleDeleteIncome = (id: string) => setIncomes(prev => prev.filter(x => x.id !== id));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Login />;

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard purchases={purchases} incomes={incomes} categories={categories} />;
      case 'registros':
        return (
          <RegistrosScreen
            purchases={purchases} categories={categories} incomes={incomes}
            selectedMonth={selectedMonth} selectedYear={selectedYear}
            onUpdatePurchase={handleUpdatePurchase} onDeletePurchase={handleDeletePurchase}
            onAddPurchase={handleAddPurchase} onUpdateIncome={handleUpdateIncome}
            onDeleteIncome={handleDeleteIncome} onAddIncome={handleAddIncome}
            onAddCategory={handleAddCategory} onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case 'ai-mode': return <AIChatMode />;
      case 'profile': return <ProfileScreen />;
      case 'settings': return <SettingsScreen />;
      default:
        return <Hero setActiveSection={setActiveSection} purchases={purchases} incomes={incomes} categories={categories} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        activeSection={activeSection} setActiveSection={setActiveSection} onLogout={handleLogout}
        selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={handleMonthChange}
        contextMode={contextMode} selectedCardId={selectedCardId} onContextChange={handleContextChange}
      />
      {renderContent()}
    </div>
  );
};

export default Index;
