const API_URL = 'https://open.er-api.com/v6/latest'; // Exchangerate-api.com free endpoint

export async function fetchExchangeRates(baseCurrency: string) {
  try {
    const response = await fetch(`${API_URL}/${baseCurrency}`);
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return null;
  }
}

export function convertCurrency(amount: number, fromRate: number, toRate: number) {
  // If we have rates relative to a common base (like USD), we can convert
  // But usually the API gives us rates relative to the base we requested.
  // So if we requested CHF, and we want EUR, we just do amount * rates['EUR']
  return amount * toRate;
}
