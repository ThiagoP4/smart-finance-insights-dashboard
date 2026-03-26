
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, MessageSquare, TrendingUp, Shield, Plus } from 'lucide-react';
import logo from '@/assets/logo.png';

interface HeroProps {
  setActiveSection: (section: string) => void;
}

const Hero = ({ setActiveSection }: HeroProps) => {
  return (
    <div className="relative min-h-screen bg-background pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="D'accord" className="w-24 h-24 drop-shadow-lg" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6 leading-tight">
            D'accord
            <br />
            <span className="text-3xl md:text-4xl">Finanças do Casal</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Controlem suas finanças juntos, de forma inteligente. Cadastrem compras, 
            analisem tendências e tomem decisões financeiras em harmonia 💕
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => setActiveSection('add-purchase')}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Compra
            </Button>
            
            <Button
              onClick={() => setActiveSection('dashboard')}
              variant="outline"
              className="border-2 border-primary/20 text-primary hover:bg-primary/5 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Ver Dashboard
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-border/50">
            <div className="w-12 h-12 bg-gradient-to-r from-success to-emerald-500 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Análise a Dois</h3>
            <p className="text-muted-foreground">
              Nossa IA analisa os gastos do casal e identifica padrões para economizar juntos.
            </p>
          </div>
          
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-border/50">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Controle Compartilhado</h3>
            <p className="text-muted-foreground">
              Visualizem juntos as despesas, receitas e faturas em um só lugar.
            </p>
          </div>
          
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-border/50">
            <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Dados Seguros</h3>
            <p className="text-muted-foreground">
              Os dados financeiros do casal são protegidos com criptografia de ponta a ponta.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-16">
          <Button
            onClick={() => setActiveSection('dashboard')}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Começar Agora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
