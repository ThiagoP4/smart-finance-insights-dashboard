
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, MessageSquare, TrendingUp, Shield, Plus } from 'lucide-react';

interface HeroProps {
  setActiveSection: (section: string) => void;
}

const Hero = ({ setActiveSection }: HeroProps) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
            Seu Agente
            <br />
            Financeiro IA
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Controle suas finanças de forma inteligente. Cadastre suas compras, 
            analise tendências e tome decisões financeiras mais assertivas com nossa IA.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => setActiveSection('add-purchase')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Compra
            </Button>
            
            <Button
              onClick={() => setActiveSection('dashboard')}
              variant="outline"
              className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Ver Dashboard
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Análise Inteligente</h3>
            <p className="text-gray-600">
              Nossa IA analisa seus gastos e identifica padrões para ajudar você a economizar mais.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">WhatsApp Bot</h3>
            <p className="text-gray-600">
              Cadastre suas compras rapidamente via WhatsApp com nosso bot inteligente.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Dados Seguros</h3>
            <p className="text-gray-600">
              Seus dados financeiros são protegidos com criptografia de ponta a ponta.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-16">
          <Button
            onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de cadastrar uma compra via WhatsApp', '_blank')}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Começar pelo WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
