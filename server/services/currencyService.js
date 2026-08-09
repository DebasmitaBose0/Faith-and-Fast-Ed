const CURRENCY_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

export const getExchangeRates = async () => {
  // In a real application, this would fetch from an external API and cache results.
  // We return static mock exchange rates relative to INR.
  return CURRENCY_RATES;
};

export const convertPrice = (priceInInr, targetCurrency) => {
  const rate = CURRENCY_RATES[targetCurrency] || 1;
  return priceInInr * rate;
};
