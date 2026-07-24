import { getExchangeRates } from "../services/currencyService.js";

export const getRates = async (req, res) => {
  try {
    const rates = await getExchangeRates();
    res.status(200).json({
      success: true,
      rates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve currency rates.",
    });
  }
};
