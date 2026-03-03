import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, Download, X, Calendar, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Purchase {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface Income {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  recurring: boolean;
}

interface Category {
  id: string;
  name: string;
  label: string;
}

interface ExcelModalProps {
  purchases: Purchase[];
  incomes: Income[];
  categories: Category[];
  selectedMonth: number;
  selectedYear: number;
  onImportPurchases: (purchases: Purchase[]) => void;
  onImportIncomes: (incomes: Income[]) => void;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const ExcelModal = ({
  purchases, incomes, categories,
  selectedMonth, selectedYear,
  onImportPurchases, onImportIncomes
}: ExcelModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<'month' | 'all'>('month');
  const importRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.label;
    return acc;
  }, {} as Record<string, string>);

  const filterByScope = <T extends { date: string }>(items: T[]): T[] => {
    if (scope === 'all') return items;
    return items.filter(item => {
      const d = new Date(item.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  };

  const handleExport = () => {
    const filteredPurchases = filterByScope(purchases);
    const filteredIncomes = filterByScope(incomes);

    const purchasesSheet = XLSX.utils.json_to_sheet(
      filteredPurchases.map(p => ({
        'Descrição': p.description,
        'Valor (R$)': p.amount,
        'Categoria': categoryLabels[p.category] || p.category,
        'Data': new Date(p.date).toLocaleDateString('pt-BR'),
      }))
    );

    const incomesSheet = XLSX.utils.json_to_sheet(
      filteredIncomes.map(i => ({
        'Descrição': i.description,
        'Valor (R$)': i.amount,
        'Tipo': i.type,
        'Data': new Date(i.date).toLocaleDateString('pt-BR'),
        'Recorrente': i.recurring ? 'Sim' : 'Não',
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, purchasesSheet, 'Compras');
    XLSX.utils.book_append_sheet(wb, incomesSheet, 'Entradas');

    const label = scope === 'month'
      ? `${MONTHS[selectedMonth]}_${selectedYear}`
      : 'Todos';
    XLSX.writeFile(wb, `FinanceAI_${label}.xlsx`);

    toast({ title: 'Exportação concluída!', description: `Arquivo Excel baixado com sucesso (${label}).` });
    setIsOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });

        // Import Compras sheet
        const purchasesSheet = wb.Sheets['Compras'];
        if (purchasesSheet) {
          const rows = XLSX.utils.sheet_to_json<Record<string, string>>(purchasesSheet);
          const imported: Purchase[] = rows.map((row, i) => {
            const dateStr = row['Data'] || '';
            const parts = dateStr.split('/');
            const isoDate = parts.length === 3
              ? `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
              : new Date().toISOString().split('T')[0];
            const catLabel = row['Categoria'] || '';
            const catName = categories.find(c => c.label === catLabel)?.name || catLabel.toLowerCase();
            return {
              id: `imp_p_${Date.now()}_${i}`,
              description: row['Descrição'] || '',
              amount: parseFloat(String(row['Valor (R$)'] || '0').replace(',', '.')),
              category: catName,
              date: isoDate,
            };
          }).filter(p => p.description);
          onImportPurchases(imported);
        }

        // Import Entradas sheet
        const incomesSheet = wb.Sheets['Entradas'];
        if (incomesSheet) {
          const rows = XLSX.utils.sheet_to_json<Record<string, string>>(incomesSheet);
          const imported: Income[] = rows.map((row, i) => {
            const dateStr = row['Data'] || '';
            const parts = dateStr.split('/');
            const isoDate = parts.length === 3
              ? `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
              : new Date().toISOString().split('T')[0];
            return {
              id: `imp_i_${Date.now()}_${i}`,
              description: row['Descrição'] || '',
              amount: parseFloat(String(row['Valor (R$)'] || '0').replace(',', '.')),
              type: row['Tipo'] || 'other',
              date: isoDate,
              recurring: row['Recorrente'] === 'Sim',
            };
          }).filter(i => i.description);
          onImportIncomes(imported);
        }

        toast({ title: 'Importação concluída!', description: 'Registros importados com sucesso.' });
        setIsOpen(false);
      } catch {
        toast({ title: 'Erro na importação', description: 'Arquivo inválido ou formato incompatível.', variant: 'destructive' });
      }
    };
    reader.readAsArrayBuffer(file);
    if (importRef.current) importRef.current.value = '';
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span>Excel</span>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Gerenciar Excel</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scope selector */}
            <div className="mb-5">
              <p className="text-xs font-medium text-muted-foreground mb-2">Escopo dos dados</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setScope('month')}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    scope === 'month'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{MONTHS[selectedMonth].slice(0, 3)} {selectedYear}</span>
                </button>
                <button
                  onClick={() => setScope('all')}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    scope === 'all'
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 flex-shrink-0" />
                  <span>Todos</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border mb-5" />

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-sm transition-all"
              >
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Exportar registros</div>
                  <div className="text-xs opacity-70">Baixar planilha Excel com compras e entradas</div>
                </div>
              </button>

              <button
                onClick={() => importRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium text-sm transition-all"
              >
                <Upload className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Importar registros</div>
                  <div className="text-xs opacity-70">Carregar planilha Excel exportada anteriormente</div>
                </div>
              </button>

              <input
                ref={importRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExcelModal;
