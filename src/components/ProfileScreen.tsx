import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Wallet, CheckCircle, AlertCircle, CreditCard, Plus, Trash2, ChevronDown } from 'lucide-react';
import { BANKS, getBrandLogo, matchBrand } from '@/utils/brandMap';

interface ProfileData {
  name: string;
  cpf: string;
  expectedMonthlyBalance: string;
}

export interface CreditCardData {
  id: string;
  name: string;
  lastDigits: string;
  closingDay: number;
  dueDay: number;
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

const emptyCard = (): Omit<CreditCardData, 'id'> => ({
  name: '',
  lastDigits: '',
  closingDay: 1,
  dueDay: 8,
});

interface BrandLogoProps {
  name: string;
  size?: number;
}
const BrandLogo = ({ name, size = 28 }: BrandLogoProps) => {
  const brand = matchBrand(name);
  const [errored, setErrored] = useState(false);
  if (!brand || errored) {
    return (
      <div style={{ width: size, height: size }} className="rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
        <CreditCard className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} />
      </div>
    );
  }
  return (
    <img
      src={getBrandLogo(brand.domain)}
      alt={brand.name}
      style={{ width: size, height: size }}
      className="rounded-md object-contain bg-white p-0.5 shrink-0"
      onError={() => setErrored(true)}
    />
  );
};

const ProfileScreen = () => {
  const [profile, setProfile] = useState<ProfileData>({ name: '', cpf: '', expectedMonthlyBalance: '' });
  const [errors, setErrors] = useState<Partial<ProfileData>>({});
  const [saved, setSaved] = useState(false);

  const [cards, setCards] = useState<CreditCardData[]>([]);
  const [newCard, setNewCard] = useState(emptyCard());
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof Omit<CreditCardData, 'id'>, string>>>({});
  const [addingCard, setAddingCard] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('financeAI_profile');
    if (s) setProfile(JSON.parse(s));
    const c = localStorage.getItem('financeAI_cards');
    if (c) setCards(JSON.parse(c));
  }, []);

  const saveCards = (updated: CreditCardData[]) => {
    setCards(updated);
    localStorage.setItem('financeAI_cards', JSON.stringify(updated));
  };

  const validate = (): boolean => {
    const newErrors: Partial<ProfileData> = {};
    if (!profile.name.trim() || profile.name.trim().length < 3)
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    if (profile.cpf && !validateCPF(profile.cpf))
      newErrors.cpf = 'CPF inválido';
    const balanceDigits = profile.expectedMonthlyBalance.replace(/\D/g, '');
    if (balanceDigits && parseInt(balanceDigits) === 0)
      newErrors.expectedMonthlyBalance = 'Saldo esperado deve ser maior que zero';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    localStorage.setItem('financeAI_profile', JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const validateCard = (): boolean => {
    const errs: typeof cardErrors = {};
    if (!newCard.name.trim()) errs.name = 'Nome obrigatório';
    const d = newCard.lastDigits.replace(/\D/g, '');
    if (d.length !== 4) errs.lastDigits = '4 dígitos';
    if (newCard.closingDay < 1 || newCard.closingDay > 28) errs.closingDay = '1-28';
    if (newCard.dueDay < 1 || newCard.dueDay > 28) errs.dueDay = '1-28';
    setCardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddCard = () => {
    if (!validateCard()) return;
    const card: CreditCardData = { ...newCard, id: crypto.randomUUID(), lastDigits: newCard.lastDigits.replace(/\D/g, '') };
    saveCards([...cards, card]);
    setNewCard(emptyCard());
    setAddingCard(false);
    setCardErrors({});
  };

  const handleDeleteCard = (id: string) => saveCards(cards.filter(c => c.id !== id));

  const cpfValid = profile.cpf.length > 0 && validateCPF(profile.cpf);
  const cpfInvalid = profile.cpf.length > 0 && !validateCPF(profile.cpf);

  const bankSuggestions = newCard.name.length >= 1
    ? BANKS.filter(b => b.name.toLowerCase().includes(newCard.name.toLowerCase())).slice(0, 5)
    : BANKS.slice(0, 6);

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e financeiras</p>
        </div>

        {/* Dados Pessoais */}
        <Card className="shadow-lg border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <User className="w-5 h-5 text-blue-500" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={profile.name}
                onChange={(e) => { setProfile(p => ({ ...p, name: e.target.value })); setErrors(e2 => ({ ...e2, name: undefined })); }}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF</Label>
              <div className="relative">
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={profile.cpf}
                  onChange={(e) => { setProfile(p => ({ ...p, cpf: formatCPF(e.target.value) })); setErrors(e2 => ({ ...e2, cpf: undefined })); }}
                  className={`pr-9 ${cpfInvalid ? 'border-destructive' : cpfValid ? 'border-success' : ''}`}
                />
                {cpfValid && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />}
                {cpfInvalid && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />}
              </div>
              {errors.cpf && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cpf}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Metas Financeiras */}
        <Card className="shadow-lg border-border bg-card mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Wallet className="w-5 h-5 text-emerald-500" />
              Metas Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="balance">Saldo mensal esperado</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">R$</span>
                <Input
                  id="balance"
                  placeholder="0,00"
                  value={profile.expectedMonthlyBalance}
                  onChange={(e) => { setProfile(p => ({ ...p, expectedMonthlyBalance: formatCurrency(e.target.value) })); setErrors(e2 => ({ ...e2, expectedMonthlyBalance: undefined })); }}
                  className={`pl-10 ${errors.expectedMonthlyBalance ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.expectedMonthlyBalance && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.expectedMonthlyBalance}</p>}
              <p className="text-muted-foreground text-xs">Quanto você deseja ter de saldo ao final de cada mês</p>
            </div>

            <Button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              {saved ? <><CheckCircle className="w-4 h-4 mr-2" /> Salvo!</> : 'Salvar Perfil'}
            </Button>
          </CardContent>
        </Card>

        {/* Cartões de Crédito */}
        <Card className="shadow-lg border-border bg-card mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                <CreditCard className="w-5 h-5 text-violet-500" />
                Meus Cartões
              </CardTitle>
              {!addingCard && (
                <Button variant="outline" size="sm" onClick={() => setAddingCard(true)} className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {cards.length === 0 && !addingCard && (
              <p className="text-muted-foreground text-sm text-center py-2">Nenhum cartão cadastrado</p>
            )}

            {cards.map(card => (
              <div key={card.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                <div className="flex items-center gap-3">
                  <BrandLogo name={card.name} size={32} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{card.name}</p>
                    <p className="text-xs text-muted-foreground">
                      •••• {card.lastDigits} &nbsp;·&nbsp; Fecha dia {card.closingDay} &nbsp;·&nbsp; Vence dia {card.dueDay}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {addingCard && (
              <div className="border border-border rounded-xl p-4 space-y-3 bg-secondary/20">
                <p className="text-sm font-medium text-foreground">Novo cartão</p>

                {/* Name + bank picker */}
                <div className="space-y-1">
                  <Label className="text-xs">Nome do cartão</Label>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0"><BrandLogo name={newCard.name} size={28} /></div>
                      <Input
                        placeholder="Ex: Nubank, Inter, C6..."
                        value={newCard.name}
                        onChange={e => { setNewCard(p => ({ ...p, name: e.target.value })); setCardErrors(e2 => ({ ...e2, name: undefined })); setShowBankPicker(true); }}
                        onFocus={() => setShowBankPicker(true)}
                        className={`h-8 text-sm ${cardErrors.name ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {cardErrors.name && <p className="text-destructive text-xs mt-1">{cardErrors.name}</p>}

                    {/* Bank suggestions */}
                    {showBankPicker && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {bankSuggestions.map(bank => (
                          <BankChip
                            key={bank.domain}
                            bank={bank}
                            onSelect={() => { setNewCard(p => ({ ...p, name: bank.name })); setShowBankPicker(false); setCardErrors(e2 => ({ ...e2, name: undefined })); }}
                          />
                        ))}
                        <button type="button" onClick={() => setShowBankPicker(false)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Últimos 4 dígitos</Label>
                    <Input
                      placeholder="0000" maxLength={4}
                      value={newCard.lastDigits}
                      onChange={e => { setNewCard(p => ({ ...p, lastDigits: e.target.value.replace(/\D/g, '').slice(0, 4) })); setCardErrors(e2 => ({ ...e2, lastDigits: undefined })); }}
                      className={`h-8 text-sm ${cardErrors.lastDigits ? 'border-destructive' : ''}`}
                    />
                    {cardErrors.lastDigits && <p className="text-destructive text-xs">{cardErrors.lastDigits}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Dia fechamento</Label>
                    <Input
                      type="number" min={1} max={28} placeholder="15"
                      value={newCard.closingDay}
                      onChange={e => { setNewCard(p => ({ ...p, closingDay: Number(e.target.value) })); setCardErrors(e2 => ({ ...e2, closingDay: undefined })); }}
                      className={`h-8 text-sm ${cardErrors.closingDay ? 'border-destructive' : ''}`}
                    />
                    {cardErrors.closingDay && <p className="text-destructive text-xs">{cardErrors.closingDay}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Dia vencimento</Label>
                    <Input
                      type="number" min={1} max={28} placeholder="22"
                      value={newCard.dueDay}
                      onChange={e => { setNewCard(p => ({ ...p, dueDay: Number(e.target.value) })); setCardErrors(e2 => ({ ...e2, dueDay: undefined })); }}
                      className={`h-8 text-sm ${cardErrors.dueDay ? 'border-destructive' : ''}`}
                    />
                    {cardErrors.dueDay && <p className="text-destructive text-xs">{cardErrors.dueDay}</p>}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={handleAddCard} className="flex-1 h-8 text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700">
                    Salvar cartão
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setAddingCard(false); setNewCard(emptyCard()); setCardErrors({}); setShowBankPicker(false); }} className="h-8 text-xs">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileScreen;
