const express = require('express');
const cron = require('node-cron');
const fetchCryptoData = require('./fetchCryptoData');
const connectDB = require('./db');
const Crypto = require('./Crypto');
const app = express();

connectDB();

fetchCryptoData();

cron.schedule('0 */2 * * *', fetchCryptoData);

app.get('/stats', async (req, res) => {
    const { coin } = req.query;
    if (!coin) {
      return res.status(400).json({ error: 'Coin query parameter is required' });
    }
  
    try {
      const cryptoData = await Crypto.findOne({ coin });
      if (!cryptoData) {
        return res.status(404).json({ error: 'Data for the requested coin not found' });
      }
  
      res.json({
        price: cryptoData.price,
        marketCap: cryptoData.marketCap,
        '24hChange': cryptoData.change24h,
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/deviation', async (req, res) => {
  const { coin } = req.query;
  if (!coin) {
    return res.status(400).json({ error: 'Coin query parameter is required' });
  }

  try {
 
    const prices = await Crypto.find({ coin })
      .sort({ updatedAt: -1 })
      .limit(100)
      .select('price');

    if (prices.length < 2) {
      return res.status(400).json({ error: 'Not enough data to calculate deviation' });
    }

    const priceValues = prices.map((entry) => entry.price);


    const mean = priceValues.reduce((acc, price) => acc + price, 0) / priceValues.length;

    const variance =
      priceValues.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) /
      priceValues.length;
    const stdDeviation = Math.sqrt(variance).toFixed(2);

    res.json({ deviation: parseFloat(stdDeviation) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
