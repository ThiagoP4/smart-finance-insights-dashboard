import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, Download, Calendar, CalendarDays, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Purchase { id: string; description: string; amount: number; category: string; date: string; }
interface Income { id: string; description: string; amount: number; type: string; date: string; recurring: boolean; }
interface Category { id: string; name: string; label: string; }

interface ExcelModalProps {
  purchases: Purchase[];
  incomes: Income[];
  categories: Category[];
  selectedMonth: number;
  selectedYear: number;
  onImportPurchases: (purchases: Purchase[]) => void;
  onImportIncomes: (incomes: Income[]) => void;
}

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const ExcelModal = ({ purchases, incomes, categories, selectedMonth, selectedYear, onImportPurchases, onImportIncomes }: ExcelModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<'month' | 'all'>('month');
  const importRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categoryLabels = categories.reduce((acc, cat) => { acc[cat.name] = cat.label; return acc; }, {} as Record<string, string>);

  const filterByScope = <T extends { date: string }>(items: T[]): T[] => {
    if (scope === 'all') return items;
    return items.filter(item => {
      const d = new Date(item.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  };

  const handleExport = () => {
    const fp = filterByScope(purchases);
    const fi = filterByScope(incomes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fp.map(p => ({
      'Descrição': p.description, 'Valor (R$)': p.amount,
      'Categoria': categoryLabels[p.category] || p.category,
      'Data': new Date(p.date).toLocaleDateString('pt-BR'),
    }))), 'Compras');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fi.map(i => ({
      'Descrição': i.description, 'Valor (R$)': i.amount,
      'Tipo': i.type, 'Data': new Date(i.date).toLocaleDateString('pt-BR'),
      'Recorrente': i.recurring ? 'Sim' : 'Não',
    }))), 'Entradas');
    XLSX.writeFile(wb, `FinanceAI_${scope === 'month' ? `${MONTHS[selectedMonth]}_${selectedYear}` : 'Todos'}.xlsx`);
    toast({ title: 'Exportado!', description: 'Planilha baixada com sucesso.' });
    setIsOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(new Uint8Array(evt.target?.result as ArrayBuffer), { type: 'array' });
        const ps = wb.Sheets['Compras'];
        if (ps) {
          onImportPurchases(XLSX.utils.sheet_to_json<Record<string,string>>(ps).map((row, i) => {
            const parts = (row['Data'] || '').split('/');
            return { id: `imp_p_${Date.now()}_${i}`, description: row['Descrição'] || '', amount: parseFloat(String(row['Valor (R$)']).replace(',','.')), category: categories.find(c => c.label === row['Categoria'])?.name || 'others', date: parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}` : new Date().toISOString().split('T')[0] };
          }).filter(p => p.description));
        }
        const is = wb.Sheets['Entradas'];
        if (is) {
          onImportIncomes(XLSX.utils.sheet_to_json<Record<string,string>>(is).map((row, i) => {
            const parts = (row['Data'] || '').split('/');
            return { id: `imp_i_${Date.now()}_${i}`, description: row['Descrição'] || '', amount: parseFloat(String(row['Valor (R$)']).replace(',','.')), type: row['Tipo'] || 'other', date: parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}` : new Date().toISOString().split('T')[0], recurring: row['Recorrente'] === 'Sim' };
          }).filter(i => i.description));
        }
        toast({ title: 'Importado!', description: 'Registros adicionados com sucesso.' });
        setIsOpen(false);
      } catch { toast({ title: 'Erro', description: 'Arquivo inválido.', variant: 'destructive' }); }
    };
    reader.readAsArrayBuffer(file);
    if (importRef.current) importRef.current.value = '';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span className="hidden sm:inline">Excel</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-popover border border-border rounded-xl shadow-xl p-3 w-52">
            {/* Scope toggle */}
            <div className="flex gap-1 mb-3 p-1 bg-muted rounded-lg">
              <button onClick={() => setScope('month')} className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-xs font-medium transition-colors ${scope === 'month' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Calendar className="w-3 h-3" />{MONTHS[selectedMonth]} {selectedYear}
              </button>
              <button onClick={() => setScope('all')} className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-xs font-medium transition-colors ${scope === 'all' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <CalendarDays className="w-3 h-3" />Todos
              </button>
            </div>

            <div className="space-y-1.5">
              <button onClick={handleExport} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                <Download className="w-4 h-4" /> Exportar
              </button>
              <button onClick={() => importRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                <Upload className="w-4 h-4" /> Importar
              </button>
            </div>

            <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
          </div>
        </>
      )}
    </div>
  );
};

export default ExcelModal;
