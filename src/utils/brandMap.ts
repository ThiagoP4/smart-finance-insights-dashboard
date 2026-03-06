export interface Brand {
  name: string;
  domain: string;
  category?: string;
}

// Clearbit Logo API — público, sem chave
export const getBrandLogo = (domain: string) =>
  `https://logo.clearbit.com/${domain}`;

export const BANKS: Brand[] = [
  { name: 'Nubank', domain: 'nubank.com.br' },
  { name: 'Inter', domain: 'inter.co' },
  { name: 'C6 Bank', domain: 'c6bank.com.br' },
  { name: 'Itaú', domain: 'itau.com.br' },
  { name: 'Bradesco', domain: 'bradesco.com.br' },
  { name: 'Santander', domain: 'santander.com.br' },
  { name: 'Caixa', domain: 'caixa.gov.br' },
  { name: 'Banco do Brasil', domain: 'bb.com.br' },
  { name: 'XP', domain: 'xp.com.br' },
  { name: 'BTG', domain: 'btgpactual.com' },
  { name: 'Next', domain: 'next.me' },
  { name: 'Neon', domain: 'neon.com.br' },
  { name: 'PicPay', domain: 'picpay.com' },
  { name: 'Mercado Pago', domain: 'mercadopago.com.br' },
  { name: 'Sicoob', domain: 'sicoob.com.br' },
];

export const SUBSCRIPTIONS: Brand[] = [
  { name: 'Netflix', domain: 'netflix.com', category: 'subscriptions' },
  { name: 'Amazon Prime', domain: 'amazon.com.br', category: 'subscriptions' },
  { name: 'Spotify', domain: 'spotify.com', category: 'subscriptions' },
  { name: 'Disney+', domain: 'disneyplus.com', category: 'subscriptions' },
  { name: 'Max (HBO)', domain: 'max.com', category: 'subscriptions' },
  { name: 'Apple TV+', domain: 'apple.com', category: 'subscriptions' },
  { name: 'Globoplay', domain: 'globo.com', category: 'subscriptions' },
  { name: 'Paramount+', domain: 'paramountplus.com', category: 'subscriptions' },
  { name: 'YouTube Premium', domain: 'youtube.com', category: 'subscriptions' },
  { name: 'Deezer', domain: 'deezer.com', category: 'subscriptions' },
  { name: 'Crunchyroll', domain: 'crunchyroll.com', category: 'subscriptions' },
  { name: 'Apple Music', domain: 'apple.com', category: 'subscriptions' },
  { name: 'Adobe CC', domain: 'adobe.com', category: 'subscriptions' },
  { name: 'Microsoft 365', domain: 'microsoft.com', category: 'subscriptions' },
  { name: 'Google One', domain: 'one.google.com', category: 'subscriptions' },
];

export const ALL_BRANDS: Brand[] = [...BANKS, ...SUBSCRIPTIONS];

/** Retorna a marca mais próxima por nome (case-insensitive, busca parcial) */
export function matchBrand(text: string): Brand | undefined {
  const lower = text.toLowerCase();
  return ALL_BRANDS.find(b => lower.includes(b.name.toLowerCase()) || b.name.toLowerCase().includes(lower));
}
