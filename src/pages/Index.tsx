
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Dashboard from '@/components/Dashboard';
import AddPurchaseForm from '@/components/AddPurchaseForm';

interface Purchase {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // Load purchases from localStorage on component mount
  useEffect(() => {
    const savedPurchases = localStorage.getItem('financeAI_purchases');
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
  }, []);

  // Save purchases to localStorage whenever purchases change
  useEffect(() => {
    localStorage.setItem('financeAI_purchases', JSON.stringify(purchases));
  }, [purchases]);

  const handleAddPurchase = (purchase: Purchase) => {
    setPurchases(prev => [...prev, purchase]);
    setActiveSection('dashboard'); // Navigate to dashboard after adding purchase
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard purchases={purchases} />;
      case 'add-purchase':
        return <AddPurchaseForm onAddPurchase={handleAddPurchase} />;
      default:
        return <Hero setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      {renderContent()}
    </div>
  );
};

export default Index;
