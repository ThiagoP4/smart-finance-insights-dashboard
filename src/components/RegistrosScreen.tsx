import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Wallet, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import PurchaseTable from './PurchaseTable';
import IncomeTable from './IncomeTable';
import CategoryTable from './CategoryTable';
import ExcelModal from './ExcelModal';

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

interface RegistrosScreenProps {
  purchases: Purchase[];
  categories: Category[];
  incomes: Income[];
  onUpdatePurchase: (purchase: Purchase) => void;
  onDeletePurchase: (id: string) => void;
  onAddPurchase: (purchase: Purchase) => void;
  onUpdateIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => void;
  onAddIncome: (income: Income) => void;
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const tabs = [
  { id: 'purchases', label: 'Cadastros', icon: FileSpreadsheet },
  { id: 'incomes', label: 'Entradas', icon: Wallet },
  { id: 'categories', label: 'Categorias', icon: Tag },
];

const RegistrosScreen = ({
  purchases, categories, incomes,
  onUpdatePurchase, onDeletePurchase, onAddPurchase,
  onUpdateIncome, onDeleteIncome, onAddIncome,
  onAddCategory, onUpdateCategory, onDeleteCategory,
}: RegistrosScreenProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = (index: number) => {
    if (index >= 0 && index < tabs.length) setActiveTab(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      goTo(activeTab + (diff > 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  const renderTab = () => {
    switch (activeTab) {
      case 0:
        return (
          <PurchaseTable
            purchases={purchases}
            categories={categories}
            onUpdatePurchase={onUpdatePurchase}
            onDeletePurchase={onDeletePurchase}
            onAddPurchase={onAddPurchase}
          />
        );
      case 1:
        return (
          <IncomeTable
            incomes={incomes}
            onUpdateIncome={onUpdateIncome}
            onDeleteIncome={onDeleteIncome}
            onAddIncome={onAddIncome}
          />
        );
      case 2:
        return (
          <CategoryTable
            categories={categories}
            onAddCategory={onAddCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="pt-20 md:pt-20 pb-6">
      {/* Sub-tab navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(activeTab - 1)}
            disabled={activeTab === 0}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === index;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goTo(activeTab + 1)}
            disabled={activeTab === tabs.length - 1}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-2">
          {tabs.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === activeTab ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Swipeable content area */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="min-h-[60vh]"
      >
        {renderTab()}
      </div>
    </div>
  );
};

export default RegistrosScreen;
