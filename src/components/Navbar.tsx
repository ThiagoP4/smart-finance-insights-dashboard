import React from 'react';
import { BarChart, FileSpreadsheet, Wallet, Tag, Sparkles, Menu } from 'lucide-react';
import AppSidebar from './AppSidebar';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const Navbar = ({ activeSection, setActiveSection, onLogout }: NavbarProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'purchases', label: 'Cadastros', icon: FileSpreadsheet },
    { id: 'incomes', label: 'Entradas', icon: Wallet },
    { id: 'categories', label: 'Categorias', icon: Tag },
    { id: 'ai-mode', label: 'Modo IA', icon: Sparkles },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <AppSidebar onLogout={onLogout}>
              <button className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </AppSidebar>

            <button
              onClick={() => setActiveSection('home')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              Finance AI
            </button>
          </div>

          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isAI = item.id === 'ai-mode';
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:scale-105 ${
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
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="w-10 md:w-0" />
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-3">
          <div className="flex space-x-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isAI = item.id === 'ai-mode';
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
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
                  <span className="text-sm font-medium">{item.label}</span>
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
