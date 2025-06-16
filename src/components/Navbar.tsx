
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, BarChart3, Plus, LogOut, Tag } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const Navbar = ({ activeSection, setActiveSection, onLogout }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => setActiveSection('home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceAI
            </span>
          </button>
          
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setActiveSection('home')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeSection === 'home' 
                  ? 'bg-blue-100 text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeSection === 'dashboard' 
                  ? 'bg-blue-100 text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection('add-purchase')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeSection === 'add-purchase' 
                  ? 'bg-blue-100 text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Adicionar Compra
            </button>
            <button
              onClick={() => setActiveSection('add-category')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeSection === 'add-category' 
                  ? 'bg-blue-100 text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Tag className="w-4 h-4 mr-1" />
              Categorias
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de cadastrar uma compra via WhatsApp', '_blank')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp Bot</span>
            </Button>
            
            <Button
              onClick={() => setActiveSection('add-purchase')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all hover:scale-105 md:hidden"
            >
              <Plus className="w-4 h-4" />
            </Button>

            <Button
              onClick={onLogout}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
