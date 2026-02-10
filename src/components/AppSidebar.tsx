import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, LogOut, Settings, User, HelpCircle, Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  onLogout: () => void;
  children: React.ReactNode;
}

const AppSidebar = ({ onLogout, children }: AppSidebarProps) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const menuItems = [
    { icon: User, label: 'Meu Perfil', action: () => {} },
    { icon: Settings, label: 'Configurações', action: () => {} },
    { icon: HelpCircle, label: 'Ajuda', action: () => {} },
    { icon: Info, label: 'Sobre', action: () => {} },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Finance AI
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-5rem)]">
          {/* Theme toggle */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between rounded-lg bg-sidebar-accent p-3">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span className="text-sm font-medium">Tema Escuro</span>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Menu items */}
          <div className="flex-1 px-3 py-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Logout */}
          <div className="px-3 py-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebar;
