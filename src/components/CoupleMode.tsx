import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Heart, Copy, UserPlus, Unlink, Users, User } from 'lucide-react';
import { useCouple } from '@/contexts/CoupleContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CoupleMode = () => {
  const { couple, mode, setMode, createCouple, joinCouple, dissolveCouple, loading } = useCouple();
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [tab, setTab] = useState<'create' | 'join'>('create');

  const copyCode = () => {
    if (couple?.invite_code) {
      navigator.clipboard.writeText(couple.invite_code);
      toast.success('Código copiado!');
    }
  };

  if (loading) return null;

  const isActive = couple?.status === 'active';
  const isPending = couple?.status === 'pending';

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mode === 'couple' ? <Users className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium text-foreground">Modo {mode === 'couple' ? 'Casal' : 'Individual'}</p>
                <p className="text-xs text-muted-foreground">
                  {mode === 'couple' ? 'Visualizando dados compartilhados' : 'Visualizando apenas seus dados'}
                </p>
              </div>
            </div>
            <Switch
              checked={mode === 'couple'}
              onCheckedChange={(c) => {
                if (c && !isActive) {
                  toast.error('Vincule-se a um parceiro primeiro');
                  return;
                }
                setMode(c ? 'couple' : 'individual');
              }}
              disabled={!isActive}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active couple info */}
      {isActive && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <p className="text-sm font-medium text-foreground">Casal vinculado</p>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Vocês estão compartilhando compras, receitas, cartões e metas.
            </p>
            <Button variant="destructive" size="sm" onClick={dissolveCouple}>
              <Unlink className="w-4 h-4 mr-2" /> Desvincular casal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending invite */}
      {isPending && couple && couple.user1_id === user?.id && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent" /> Convite pendente
            </CardTitle>
            <CardDescription>Compartilhe o código abaixo com seu parceiro(a)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-background rounded-lg px-4 py-3 text-center font-mono text-lg tracking-widest text-foreground border border-border">
                {couple.invite_code}
              </div>
              <Button variant="outline" size="icon" onClick={copyCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {couple.invite_email && (
              <p className="text-xs text-muted-foreground mt-2">Enviado para: {couple.invite_email}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create or join couple */}
      {!isActive && !isPending && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" /> Vincular casal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex rounded-lg border border-border overflow-hidden text-sm font-medium">
              <button
                onClick={() => setTab('create')}
                className={`flex-1 py-2 transition-colors ${tab === 'create' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
              >
                Criar convite
              </button>
              <button
                onClick={() => setTab('join')}
                className={`flex-1 py-2 transition-colors ${tab === 'join' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
              >
                Usar código
              </button>
            </div>

            {tab === 'create' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Email do parceiro (opcional)</Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="parceiro@email.com"
                    className="bg-background"
                  />
                </div>
                <Button className="w-full" onClick={() => createCouple(inviteEmail)}>
                  <UserPlus className="w-4 h-4 mr-2" /> Gerar convite
                </Button>
              </div>
            )}

            {tab === 'join' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Código de convite</Label>
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Ex: a1b2c3d4"
                    className="bg-background font-mono tracking-wider"
                  />
                </div>
                <Button className="w-full" onClick={() => joinCouple(joinCode)} disabled={!joinCode.trim()}>
                  <Heart className="w-4 h-4 mr-2" /> Vincular
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoupleMode;
