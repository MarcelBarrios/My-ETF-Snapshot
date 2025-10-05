const fetch = require('node-fetch');
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const apiService = {
    fetchQuote: async function (symbol) {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();

            // The API returns an empty object if the symbol is not found
            if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
                return null;
            }

            return {
                symbol: data['Global Quote']['01. symbol'],
                price: parseFloat(data['Global Quote']['05. price']).toFixed(2),
                change: parseFloat(data['Global Quote']['09. change']).toFixed(2),
                changePercent: parseFloat(data['Global Quote']['10. change percent'].replace('%', '')).toFixed(2),
            };
        } catch (error) {
            console.error('API Service Error:', error);
            return null;
        }
    }
};

module.exports = apiService;