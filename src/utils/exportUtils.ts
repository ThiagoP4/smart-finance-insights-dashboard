
import * as XLSX from 'xlsx';

interface Purchase {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface Category {
  id: string;
  name: string;
  label: string;
}

export const exportToExcel = (purchases: Purchase[], categories: Category[], filename: string = 'cadastros') => {
  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.label;
    return acc;
  }, {} as Record<string, string>);

  const data = purchases.map(purchase => ({
    'Descrição': purchase.description,
    'Valor (R$)': purchase.amount,
    'Categoria': categoryLabels[purchase.category] || purchase.category,
    'Data': new Date(purchase.date).toLocaleDateString('pt-BR')
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cadastros');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCSV = (purchases: Purchase[], categories: Category[], filename: string = 'cadastros') => {
  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.label;
    return acc;
  }, {} as Record<string, string>);

  const headers = ['Descrição', 'Valor (R$)', 'Categoria', 'Data'];
  const csvContent = [
    headers.join(','),
    ...purchases.map(purchase => [
      `"${purchase.description}"`,
      purchase.amount.toString().replace('.', ','),
      `"${categoryLabels[purchase.category] || purchase.category}"`,
      new Date(purchase.date).toLocaleDateString('pt-BR')
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const exportToPowerBI = (purchases: Purchase[], categories: Category[]) => {
  const categoryLabels = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.label;
    return acc;
  }, {} as Record<string, string>);

  const data = purchases.map(purchase => ({
    Descricao: purchase.description,
    Valor: purchase.amount,
    Categoria: categoryLabels[purchase.category] || purchase.category,
    Data: purchase.date,
    Mes: new Date(purchase.date).getMonth() + 1,
    Ano: new Date(purchase.date).getFullYear()
  }));

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'dados_powerbi.json';
  link.click();
};
