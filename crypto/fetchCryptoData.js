const axios = require('axios');
const Crypto = require('./Crypto');

const fetchCryptoData = async () => {
  try {
    const coins = ['bitcoin', 'matic-network', 'ethereum'];
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: coins.join(','),
          vs_currencies: 'usd',
          include_market_cap: 'true',
          include_24hr_change: 'true'
        }
      }
    );

    
    coins.forEach(async (coin) => {
      const coinData = {
        coin,
        price: data[coin].usd,
        marketCap: data[coin].usd_market_cap,
        change24h: data[coin].usd_24h_change,
      };

      
      await Crypto.create(coinData);
    });

    console.log('Crypto data updated (new records added)');
  } catch (error) {
    console.error('Error fetching crypto data:', error);
  }
};

module.exports = fetchCryptoData;
