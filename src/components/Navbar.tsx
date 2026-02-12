import React, { useState } from 'react';
import { BarChart, FileSpreadsheet, Sparkles, Menu, CalendarDays, ChevronDown } from 'lucide-react';
import AppSidebar from './AppSidebar';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const Navbar = ({ activeSection, setActiveSection, onLogout, selectedMonth, selectedYear, onMonthChange }: NavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedYear);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'registros', label: 'Registros', icon: FileSpreadsheet },
    { id: 'ai-mode', label: 'Modo IA', icon: Sparkles },
  ];

  const selectMonth = (month: number) => {
    onMonthChange(month, viewYear);
    setDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <AppSidebar onLogout={onLogout}>
              <button className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </AppSidebar>
            <button
              onClick={() => setActiveSection('home')}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              Finance AI
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
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : isAI
                          ? 'text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Month/Year dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium text-foreground"
            >
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="hidden sm:inline">{MONTHS[selectedMonth].slice(0, 3)}</span>
              <span className="sm:hidden">{MONTHS[selectedMonth].slice(0, 3)}</span>
              <span>{selectedYear}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-xl z-50 p-3">
                  {/* Year selector */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <button onClick={() => setViewYear(y => y - 1)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                    <span className="text-sm font-semibold text-foreground">{viewYear}</span>
                    <button onClick={() => setViewYear(y => y + 1)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                  </div>
                  {/* Month grid */}
                  <div className="grid grid-cols-3 gap-1">
                    {MONTHS.map((month, i) => {
                      const isSelected = selectedMonth === i && selectedYear === viewYear;
                      return (
                        <button
                          key={i}
                          onClick={() => selectMonth(i)}
                          className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-accent'
                          }`}
                        >
                          {month.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
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
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : isAI
                        ? 'text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
