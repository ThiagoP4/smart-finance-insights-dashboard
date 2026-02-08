import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Dashboard from '@/components/Dashboard';
import PurchaseTable from '@/components/PurchaseTable';
import IncomeTable from '@/components/IncomeTable';
import CategoryTable from '@/components/CategoryTable';
import Login from '@/components/Login';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
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

  // Check authentication status on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('financeAI_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load purchases, incomes and categories from localStorage on component mount
  useEffect(() => {
    if (isAuthenticated) {
      const savedPurchases = localStorage.getItem('financeAI_purchases');
      const savedCategories = localStorage.getItem('financeAI_categories');
      const savedIncomes = localStorage.getItem('financeAI_incomes');
      
      if (savedPurchases) {
        setPurchases(JSON.parse(savedPurchases));
      } else {
        // Add some sample data for demonstration
        const samplePurchases: Purchase[] = [
          {
            id: '1',
            description: 'Supermercado Extra',
            amount: 150.50,
            category: 'food',
            date: '2024-06-10'
          },
          {
            id: '2',
            description: 'Netflix',
            amount: 29.90,
            category: 'subscriptions',
            date: '2024-06-12'
          },
          {
            id: '3',
            description: 'Farmácia São Paulo',
            amount: 45.80,
            category: 'pharmacy',
            date: '2024-06-14'
          },
          {
            id: '4',
            description: 'Uber',
            amount: 18.50,
            category: 'transport',
            date: '2024-06-15'
          }
        ];
        setPurchases(samplePurchases);
        localStorage.setItem('financeAI_purchases', JSON.stringify(samplePurchases));
      }

      if (savedIncomes) {
        setIncomes(JSON.parse(savedIncomes));
      } else {
        // Add sample income data
        const sampleIncomes: Income[] = [
          {
            id: '1',
            description: 'Salário Janeiro',
            amount: 5000.00,
            type: 'salary',
            date: '2024-06-05',
            recurring: true
          },
          {
            id: '2',
            description: 'Freelance Design',
            amount: 1500.00,
            type: 'freelance',
            date: '2024-06-10',
            recurring: false
          }
        ];
        setIncomes(sampleIncomes);
        localStorage.setItem('financeAI_incomes', JSON.stringify(sampleIncomes));
      }

      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    }
  }, [isAuthenticated]);

  // Save purchases to localStorage whenever purchases change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('financeAI_purchases', JSON.stringify(purchases));
    }
  }, [purchases, isAuthenticated]);

  // Save categories to localStorage whenever categories change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('financeAI_categories', JSON.stringify(categories));
    }
  }, [categories, isAuthenticated]);

  // Save incomes to localStorage whenever incomes change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('financeAI_incomes', JSON.stringify(incomes));
    }
  }, [incomes, isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('financeAI_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('financeAI_auth');
    setActiveSection('home');
  };

  const handleAddPurchase = (purchase: Purchase) => {
    setPurchases(prev => [...prev, purchase]);
  };

  const handleAddCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories(prev => prev.map(category => 
      category.id === updatedCategory.id ? updatedCategory : category
    ));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const handleUpdatePurchase = (updatedPurchase: Purchase) => {
    setPurchases(prev => prev.map(purchase => 
      purchase.id === updatedPurchase.id ? updatedPurchase : purchase
    ));
  };

  const handleDeletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(purchase => purchase.id !== id));
  };

  const handleAddIncome = (income: Income) => {
    setIncomes(prev => [...prev, income]);
  };

  const handleUpdateIncome = (updatedIncome: Income) => {
    setIncomes(prev => prev.map(income => 
      income.id === updatedIncome.id ? updatedIncome : income
    ));
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(income => income.id !== id));
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard purchases={purchases} incomes={incomes} categories={categories} />;
      case 'purchases':
        return <PurchaseTable 
          purchases={purchases} 
          categories={categories}
          onUpdatePurchase={handleUpdatePurchase}
          onDeletePurchase={handleDeletePurchase}
          onAddPurchase={handleAddPurchase}
        />;
      case 'incomes':
        return <IncomeTable 
          incomes={incomes}
          onUpdateIncome={handleUpdateIncome}
          onDeleteIncome={handleDeleteIncome}
          onAddIncome={handleAddIncome}
        />;
      case 'categories':
        return <CategoryTable 
          categories={categories}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
        />;
      default:
        return <Hero setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        onLogout={handleLogout}
      />
      {renderContent()}
    </div>
  );
};

export default Index;
