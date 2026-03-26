import React, { useState, useEffect } from 'react';
import { BarChart, FileSpreadsheet, Sparkles, Menu, CalendarDays, ChevronDown, CreditCard, Calendar } from 'lucide-react';
import AppSidebar from './AppSidebar';
import type { CreditCardData } from './ProfileScreen';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  contextMode?: 'month' | 'card';
  selectedCardId?: string | null;
  onContextChange?: (mode: 'month' | 'card', cardId?: string) => void;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const Navbar = ({
  activeSection,
  setActiveSection,
  onLogout,
  selectedMonth,
  selectedYear,
  onMonthChange,
  contextMode = 'month',
  selectedCardId = null,
  onContextChange,
}: NavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedYear);
  const [cards, setCards] = useState<CreditCardData[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('financeAI_cards');
    if (stored) setCards(JSON.parse(stored));

    const handleStorage = () => {
      const s = localStorage.getItem('financeAI_cards');
      setCards(s ? JSON.parse(s) : []);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // re-read cards when dropdown opens (same-tab update)
  const handleDropdownToggle = () => {
    const s = localStorage.getItem('financeAI_cards');
    setCards(s ? JSON.parse(s) : []);
    setDropdownOpen(o => !o);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'registros', label: 'Registros', icon: FileSpreadsheet },
    { id: 'ai-mode', label: 'Modo IA', icon: Sparkles },
  ];

  const selectMonth = (month: number) => {
    onMonthChange(month, viewYear);
    onContextChange?.('month');
    setDropdownOpen(false);
  };

  const selectCard = (cardId: string) => {
    onContextChange?.('card', cardId);
    setDropdownOpen(false);
  };

  const activeCard = cards.find(c => c.id === selectedCardId);

  const buttonLabel = contextMode === 'card' && activeCard
    ? `${activeCard.name} ••${activeCard.lastDigits.slice(-2)}`
    : `${MONTHS[selectedMonth].slice(0, 3)} ${selectedYear}`;

  const ButtonIcon = contextMode === 'card' ? CreditCard : CalendarDays;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <AppSidebar onLogout={onLogout} onNavigate={setActiveSection}>
              <button className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </AppSidebar>
            <button
              onClick={() => setActiveSection('home')}
              className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform tracking-tight"
            >
              D'accord
            </button>
          </div>

          {/* Center: Nav items */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isAI = item.id === 'ai-mode';
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 text-sm font-medium ${
                      activeSection === item.id
                        ? isAI
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                          : 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                        : isAI
                          ? 'text-primary hover:bg-primary/10 border border-primary/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Context dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={handleDropdownToggle}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium text-foreground"
            >
              <ButtonIcon className="w-4 h-4 text-muted-foreground" />
              <span className="max-w-[110px] truncate">{buttonLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-xl shadow-xl z-50 p-3 space-y-3">

                  {/* Mode toggle */}
                  <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
                    <button
                      onClick={() => onContextChange?.('month')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 transition-colors ${contextMode === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                    >
                      <Calendar className="w-3.5 h-3.5" /> Por Mês
                    </button>
                    <button
                      onClick={() => onContextChange?.('card')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 transition-colors ${contextMode === 'card' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Por Fatura
                    </button>
                  </div>

                  {/* Month picker */}
                  {contextMode === 'month' && (
                    <>
                      <div className="flex items-center justify-between px-1">
                        <button onClick={() => setViewYear(y => y - 1)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>
                        <span className="text-sm font-semibold text-foreground">{viewYear}</span>
                        <button onClick={() => setViewYear(y => y + 1)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {MONTHS.map((month, i) => {
                          const isSelected = selectedMonth === i && selectedYear === viewYear && contextMode === 'month';
                          return (
                            <button
                              key={i}
                              onClick={() => selectMonth(i)}
                              className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'}`}
                            >
                              {month.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Card picker */}
                  {contextMode === 'card' && (
                    <div className="space-y-1">
                      {cards.length === 0 ? (
                        <div className="text-center py-3 space-y-1">
                          <p className="text-muted-foreground text-xs">Nenhum cartão cadastrado</p>
                          <button
                            onClick={() => { setDropdownOpen(false); setActiveSection('profile'); }}
                            className="text-xs text-primary underline underline-offset-2"
                          >
                            Cadastrar no Perfil
                          </button>
                        </div>
                      ) : (
                        cards.map(card => (
                          <button
                            key={card.id}
                            onClick={() => selectCard(card.id)}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${selectedCardId === card.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'}`}
                          >
                            <CreditCard className="w-4 h-4 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{card.name}</p>
                              <p className={`text-xs truncate ${selectedCardId === card.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                •••• {card.lastDigits} · fecha dia {card.closingDay}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden pb-3">
          <div className="flex justify-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isAI = item.id === 'ai-mode';
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
                    activeSection === item.id
                      ? isAI
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                        : 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                      : isAI
                        ? 'text-primary border border-primary/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
