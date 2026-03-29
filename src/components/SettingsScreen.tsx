import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Globe, DollarSign, Calendar, Shield, Database, ChevronRight, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Settings {
  currency: string;
  dateFormat: string;
  notifyDueDate: boolean;
  notifyDueDays: number;
  notifyBudgetLimit: boolean;
  notifyBudgetPercent: number;
  notifyWeeklySummary: boolean;
  language: string;
  startOfWeek: string;
}

const DEFAULT_SETTINGS: Settings = {
  currency: 'BRL',
  dateFormat: 'dd/MM/yyyy',
  notifyDueDate: true,
  notifyDueDays: 3,
  notifyBudgetLimit: true,
  notifyBudgetPercent: 80,
  notifyWeeklySummary: false,
  language: 'pt-BR',
  startOfWeek: 'monday',
};

const CURRENCIES = [
  { value: 'BRL', label: 'Real (R$)', symbol: 'R$' },
  { value: 'USD', label: 'Dólar (US$)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'Libra (£)', symbol: '£' },
];

const DATE_FORMATS = [
  { value: 'dd/MM/yyyy', label: '31/12/2024' },
  { value: 'MM/dd/yyyy', label: '12/31/2024' },
  { value: 'yyyy-MM-dd', label: '2024-12-31' },
];

const SettingsScreen = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('financeAI_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('financeAI_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Configuração salva');
  };

  const clearAllData = () => {
    if (confirm('Tem certeza? Isso apagará todos os dados locais (compras, receitas, categorias, cartões). Essa ação não pode ser desfeita.')) {
      localStorage.removeItem('financeAI_purchases');
      localStorage.removeItem('financeAI_incomes');
      localStorage.removeItem('financeAI_categories');
      localStorage.removeItem('financeAI_cards');
      toast.success('Todos os dados foram apagados. Recarregue a página.');
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.success('Configurações restauradas ao padrão');
  };

  return (
    <div className="pt-24 pb-10 px-4 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalize sua experiência no Somma AI</p>
      </div>

      {/* Aparência */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            <CardTitle className="text-base">Aparência</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Tema Escuro</p>
              <p className="text-xs text-muted-foreground">Alternar entre modo claro e escuro</p>
            </div>
            <Switch checked={isDark} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} />
          </div>
        </CardContent>
      </Card>

      {/* Moeda e Formato */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Moeda e Formato</CardTitle>
          </div>
          <CardDescription>Defina a moeda e o formato de data padrão</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Moeda</label>
            <Select value={settings.currency} onValueChange={(v) => updateSetting('currency', v)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5" /> {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Formato de Data</label>
            <Select value={settings.dateFormat} onValueChange={(v) => updateSetting('dateFormat', v)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map(f => (
                  <SelectItem key={f.value} value={f.value}>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" /> {f.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Início da semana</label>
            <Select value={settings.startOfWeek} onValueChange={(v) => updateSetting('startOfWeek', v)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Segunda-feira</SelectItem>
                <SelectItem value="sunday">Domingo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Notificações</CardTitle>
          </div>
          <CardDescription>Configure alertas e lembretes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Lembrete de vencimento</p>
              <p className="text-xs text-muted-foreground">Aviso antes do vencimento da fatura</p>
            </div>
            <Switch checked={settings.notifyDueDate} onCheckedChange={(c) => updateSetting('notifyDueDate', c)} />
          </div>

          {settings.notifyDueDate && (
            <div className="space-y-2 pl-1">
              <label className="text-sm font-medium text-foreground">Dias de antecedência</label>
              <Select value={String(settings.notifyDueDays)} onValueChange={(v) => updateSetting('notifyDueDays', Number(v))}>
                <SelectTrigger className="bg-background border-border w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 7].map(d => (
                    <SelectItem key={d} value={String(d)}>{d} {d === 1 ? 'dia' : 'dias'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator className="bg-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Alerta de orçamento</p>
              <p className="text-xs text-muted-foreground">Aviso ao atingir % do saldo mensal</p>
            </div>
            <Switch checked={settings.notifyBudgetLimit} onCheckedChange={(c) => updateSetting('notifyBudgetLimit', c)} />
          </div>

          {settings.notifyBudgetLimit && (
            <div className="space-y-2 pl-1">
              <label className="text-sm font-medium text-foreground">Percentual limite</label>
              <Select value={String(settings.notifyBudgetPercent)} onValueChange={(v) => updateSetting('notifyBudgetPercent', Number(v))}>
                <SelectTrigger className="bg-background border-border w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[50, 60, 70, 80, 90, 95].map(p => (
                    <SelectItem key={p} value={String(p)}>{p}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator className="bg-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Resumo semanal</p>
              <p className="text-xs text-muted-foreground">Receba um resumo dos gastos da semana</p>
            </div>
            <Switch checked={settings.notifyWeeklySummary} onCheckedChange={(c) => updateSetting('notifyWeeklySummary', c)} />
          </div>
        </CardContent>
      </Card>

      {/* Dados */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Dados</CardTitle>
          </div>
          <CardDescription>Gerencie seus dados locais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={resetSettings}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
          >
            <span className="text-foreground font-medium">Restaurar configurações padrão</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={clearAllData}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors text-sm"
          >
            <span className="text-destructive font-medium">Apagar todos os dados</span>
            <ChevronRight className="w-4 h-4 text-destructive" />
          </button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground pt-2">Somma AI v1.0 · Feito com ♥</p>
    </div>
  );
};

export default SettingsScreen;
