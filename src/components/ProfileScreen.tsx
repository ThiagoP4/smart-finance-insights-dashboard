import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Wallet, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileData {
  name: string;
  cpf: string;
  expectedMonthlyBalance: string;
}

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const validateCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(digits[10]);
};

const formatCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const number = parseInt(digits) / 100;
  return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ProfileScreen = () => {
  const [profile, setProfile] = useState<ProfileData>({ name: '', cpf: '', expectedMonthlyBalance: '' });
  const [errors, setErrors] = useState<Partial<ProfileData>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('financeAI_profile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<ProfileData> = {};

    if (!profile.name.trim() || profile.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (profile.cpf && !validateCPF(profile.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    const balanceDigits = profile.expectedMonthlyBalance.replace(/\D/g, '');
    if (balanceDigits && parseInt(balanceDigits) === 0) {
      newErrors.expectedMonthlyBalance = 'Saldo esperado deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    localStorage.setItem('financeAI_profile', JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(p => ({ ...p, cpf: formatCPF(e.target.value) }));
    setErrors(e2 => ({ ...e2, cpf: undefined }));
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setProfile(p => ({ ...p, expectedMonthlyBalance: formatted }));
    setErrors(e2 => ({ ...e2, expectedMonthlyBalance: undefined }));
  };

  const cpfValid = profile.cpf.length > 0 && validateCPF(profile.cpf);
  const cpfInvalid = profile.cpf.length > 0 && !validateCPF(profile.cpf);

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e financeiras</p>
        </div>

        <Card className="shadow-lg border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <User className="w-5 h-5 text-blue-500" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={profile.name}
                onChange={(e) => {
                  setProfile(p => ({ ...p, name: e.target.value }));
                  setErrors(e2 => ({ ...e2, name: undefined }));
                }}
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.name && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.name}
                </p>
              )}
            </div>

            {/* CPF */}
            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF (Carteira)</Label>
              <div className="relative">
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={profile.cpf}
                  onChange={handleCPFChange}
                  className={`pr-9 ${cpfInvalid ? 'border-destructive focus-visible:ring-destructive' : cpfValid ? 'border-success focus-visible:ring-success' : ''}`}
                />
                {cpfValid && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(142,71%,45%)]" />}
                {cpfInvalid && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />}
              </div>
              {errors.cpf && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.cpf}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-border bg-card mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Wallet className="w-5 h-5 text-emerald-500" />
              Metas Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Saldo esperado */}
            <div className="space-y-1.5">
              <Label htmlFor="balance">Saldo mensal esperado</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">R$</span>
                <Input
                  id="balance"
                  placeholder="0,00"
                  value={profile.expectedMonthlyBalance}
                  onChange={handleBalanceChange}
                  className={`pl-10 ${errors.expectedMonthlyBalance ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.expectedMonthlyBalance && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.expectedMonthlyBalance}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Quanto você deseja ter de saldo ao final de cada mês
              </p>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {saved ? (
                <><CheckCircle className="w-4 h-4 mr-2" /> Salvo com sucesso!</>
              ) : (
                'Salvar Perfil'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileScreen;
