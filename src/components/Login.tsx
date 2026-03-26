
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('Credenciais inválidas. Use admin/admin');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
      
      <Card className="w-full max-w-md relative bg-card/80 backdrop-blur-sm shadow-xl border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-primary to-accent rounded-2xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            D'accord
          </CardTitle>
          <p className="text-muted-foreground">Finanças do casal, em harmonia 💕</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong className="text-foreground">Credenciais de teste:</strong><br />
              Email: admin<br />
              Senha: admin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
