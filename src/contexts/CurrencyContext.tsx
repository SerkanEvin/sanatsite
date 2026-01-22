import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type Currency = 'USD' | 'EUR' | 'TRY' | 'GBP';

interface ExchangeRates {
  USD: number;
  EUR: number;
  TRY: number;
  GBP: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number, baseCurrency?: Currency) => string;
  convertPrice: (price: number, fromCurrency: Currency, toCurrency: Currency) => number;
  exchangeRates: ExchangeRates;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const currencySymbols = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
  GBP: '£'
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency');
    return (saved as Currency) || 'USD';
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    USD: 1,
    EUR: 0.92,
    TRY: 34.50,
    GBP: 0.79
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    loadExchangeRates();
  }, []);

  const loadExchangeRates = async () => {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('currency, rate');

    if (!error && data) {
      const rates: any = {};
      (data as any[]).forEach((item) => {
        rates[item.currency] = item.rate;
      });
      setExchangeRates(rates as ExchangeRates);
    }
  };

  const refreshRates = async () => {
    await loadExchangeRates();
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const convertPrice = (price: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return price;

    const priceInUSD = price / exchangeRates[fromCurrency];
    return priceInUSD * exchangeRates[toCurrency];
  };

  const formatPrice = (price: number, baseCurrency: Currency = 'USD'): string => {
    const convertedPrice = convertPrice(price, baseCurrency, currency);
    const symbol = currencySymbols[currency];
    const formattedNumber = convertedPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // In Turkey, the symbol typically follows the amount (e.g., 100,00 ₺)
    if (currency === 'TRY') {
      return `${formattedNumber} ${symbol}`;
    }

    return `${symbol}${formattedNumber}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice, exchangeRates, refreshRates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
