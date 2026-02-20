
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isBaseCurrency: boolean;
  status: "active" | "inactive";
  decimalPlaces: number;
  country?: string;
}

export interface ExchangeRate {
  id: string;
  currencyId: string;
  rate: number;
  effectiveDate: string;
  source: string;
}

export interface ConversionRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  date?: string;
}

export interface ConversionResult {
  amount: number;
  rate: number;
}

// Export the factory function
export const createCurrencyApi = (
  getAuthHeaders: () => Promise<HeadersInit>
) => ({
  // Get all active currencies (with optional branchId)
  getActiveCurrencies: async (branchId?: string): Promise<Currency[]> => {
    const url = branchId
      ? `/multi-currency/currencies/active?branchId=${branchId}`
      : "/multi-currency/currencies/active";

    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}${url}`,
      {
        headers,
      }
    );
    const data = await response.json();
    return data.data || [];
  },

  // ... rest of your API methods (keep them the same)
  getCurrentRates: async (): Promise<ExchangeRate[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/multi-currency/currencies/rates/current`,
      {
        headers,
      }
    );
    const data = await response.json();
    return data.data || [];
  },

  setBaseCurrency: async (currencyCode: string): Promise<Currency> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/multi-currency/currencies/base`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ currencyCode }),
      }
    );
    const data = await response.json();
    return data.data;
  },

  updateExchangeRate: async (
    currencyCode: string,
    rate: number,
    effectiveDate?: string,
    source?: string
  ): Promise<ExchangeRate> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/multi-currency/currencies/rates`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          currencyCode,
          rate,
          effectiveDate,
          source,
        }),
      }
    );
    const data = await response.json();
    return data.data;
  },

  bulkUpdateRates: async (
    rates: Array<{ currencyCode: string; rate: number }>
  ): Promise<any> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/multi-currency/currencies/rates/bulk`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ rates }),
      }
    );
    const data = await response.json();
    return data.data;
  },

  convertAmount: async (
    request: ConversionRequest
  ): Promise<ConversionResult> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/multi-currency/currencies/convert`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      }
    );
    const data = await response.json();
    return data.data;
  },

  addCurrency: async (currencyData: Partial<Currency>): Promise<Currency> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/multi-currency/currencies`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(currencyData),
      }
    );
    const data = await response.json();
    return data.data;
  },

  getExchangeRateHistory: async (
    currencyCode: string,
    startDate: string,
    endDate: string
  ): Promise<ExchangeRate[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/multi-currency/currencies/rates/history/${currencyCode}?startDate=${startDate}&endDate=${endDate}`,
      { headers }
    );
    const data = await response.json();
    return data.data || [];
  },

  calculateExchangeGainLoss: async (
    branchId: string,
    startDate: string,
    endDate: string
  ): Promise<{ gain: number; loss: number }> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/multi-currency/currencies/gain-loss/${branchId}?startDate=${startDate}&endDate=${endDate}`,
      { headers }
    );
    const data = await response.json();
    return data.data;
  },
});
