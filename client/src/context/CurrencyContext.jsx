import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

// Exchange rates (static for demo - in production, fetch from API)
const exchangeRates = {
  USD: { symbol: '$', rate: 1, name: 'US Dollar' },
  INR: { symbol: '₹', rate: 83.12, name: 'Indian Rupee' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
  JPY: { symbol: '¥', rate: 149.50, name: 'Japanese Yen' },
  AED: { symbol: 'د.إ', rate: 3.67, name: 'UAE Dirham' },
  SGD: { symbol: 'S$', rate: 1.34, name: 'Singapore Dollar' },
  AUD: { symbol: 'A$', rate: 1.53, name: 'Australian Dollar' }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Try to get saved currency from localStorage
    const saved = localStorage.getItem('currency');
    if (saved && exchangeRates[saved]) {
      return { code: saved, ...exchangeRates[saved] };
    }
    return { code: 'USD', ...exchangeRates.USD };
  });

  const changeCurrency = (code) => {
    if (exchangeRates[code]) {
      const newCurrency = { code, ...exchangeRates[code] };
      setCurrency(newCurrency);
      localStorage.setItem('currency', code);
    }
  };

  const convertPrice = (priceInUSD) => {
    return (priceInUSD * currency.rate).toFixed(0);
  };

  const formatPrice = (priceInUSD) => {
    const converted = convertPrice(priceInUSD);
    return `${currency.symbol}${converted}`;
  };

  const getAvailableCurrencies = () => {
    return Object.entries(exchangeRates).map(([code, data]) => ({
      code,
      ...data
    }));
  };

  return (
    <CurrencyContext.Provider value={{ 
      ...currency, 
      changeCurrency, 
      convertPrice, 
      formatPrice,
      getAvailableCurrencies,
      exchangeRates
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Currency Selector Component
export function CurrencySelector() {
  const { code, changeCurrency, getAvailableCurrencies } = useCurrency();
  const currencies = getAvailableCurrencies();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-900 dark:text-white">
        <span className="text-lg">{exchangeRates[code]?.symbol}</span>
        <span className="text-sm">{code}</span>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {currencies.map((curr) => (
          <button
            key={curr.code}
            onClick={() => changeCurrency(curr.code)}
            className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors first:rounded-t-xl last:rounded-b-xl ${
              curr.code === code ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            <span className="text-lg">{curr.symbol}</span>
            <div className="text-left">
              <p className="text-sm font-medium">{curr.code}</p>
              <p className="text-xs text-gray-500">{curr.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CurrencyContext;
