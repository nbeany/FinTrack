// services/investmentService.js
// Fetches prices for investments and updates Investment rows.
// Supports:
//  - crypto via CoinGecko (no API key needed)
//  - stocks via Alpha Vantage (requires API key in ALPHA_VANTAGE_KEY)
//  - fallback: configurable priceProvider function
//
// The service updates Investment.current_price and (optionally) persists snapshots.

const axios = require("axios");
const NodeCache = require("node-cache");
const logger = require("../config/logger");
const { Investment, User, Log } = require("../models");
const calculatePortfolio = require("../utils/calculatePortfolio");

// short in-memory cache to avoid hitting price APIs too often
const cache = new NodeCache({ stdTTL: 30, checkperiod: 60 }); // cache prices for 30s

/**
 * fetchCryptoPrice - uses CoinGecko to get current price for a crypto symbol (e.g. 'bitcoin' or 'ethereum')
 * We accept symbol either as common symbol (BTC) or full id (bitcoin)
 */
async function fetchCryptoPrice(symbol) {
  try {
    const s = symbol.toLowerCase();

    // If symbol looks like a ticker (BTC), try mapping common tickers.
    // NOTE: You may want a more robust symbol->id mapping in prod.
    const mapper = {
      btc: "bitcoin",
      eth: "ethereum",
      ltc: "litecoin",
    };

    const id = mapper[s] || s;

    const cacheKey = `crypto:${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const url = `https://api.coingecko.com/api/v3/simple/price`;
    const resp = await axios.get(url, {
      params: { ids: id, vs_currencies: "usd" },
      timeout: 5000,
    });

    const price = resp.data?.[id]?.usd;
    if (price == null) throw new Error("Price not found for " + symbol);

    cache.set(cacheKey, price);
    return price;
  } catch (err) {
    logger.error("fetchCryptoPrice error", { symbol, err: err.message });
    throw err;
  }
}

/**
 * fetchStockPriceYahoo - fallback using Yahoo Finance (no API key needed)
 */
async function fetchStockPriceYahoo(symbol) {
  try {
    // Using yahoo-finance2 npm package approach or direct API
    // Alternative: use yfinance API endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}`;
    const resp = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const result = resp.data?.chart?.result?.[0];
    if (!result) {
      throw new Error("No data from Yahoo Finance");
    }

    const meta = result.meta;
    const price = meta?.regularMarketPrice || meta?.previousClose;

    if (price == null || Number.isNaN(price)) {
      throw new Error("Price not available from Yahoo Finance");
    }

    return price;
  } catch (err) {
    logger.error("fetchStockPriceYahoo error", { symbol, err: err.message });
    throw err;
  }
}

/**
 * fetchStockPrice - uses Alpha Vantage (requires API key) with Yahoo Finance fallback
 */
async function fetchStockPrice(symbol) {
  try {
    const cacheKey = `stock:${symbol.toUpperCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const key = process.env.ALPHA_VANTAGE_KEY;
    
    // Try Alpha Vantage first if key is available
    if (key) {
      try {
        const url = `https://www.alphavantage.co/query`;
        const resp = await axios.get(url, {
          params: {
            function: "GLOBAL_QUOTE",
            symbol: symbol,
            apikey: key,
          },
          timeout: 7000,
        });

        const quote = resp.data?.["Global Quote"];
        const price = quote ? parseFloat(quote["05. price"]) : null;

        if (price != null && !Number.isNaN(price) && price > 0) {
          cache.set(cacheKey, price);
          return price;
        }
      } catch (avError) {
        logger.warn("Alpha Vantage failed, trying Yahoo Finance fallback", { symbol, error: avError.message });
      }
    }

    // Fallback to Yahoo Finance (no API key needed)
    logger.info("Using Yahoo Finance for stock price", { symbol });
    const price = await fetchStockPriceYahoo(symbol);
    cache.set(cacheKey, price);
    return price;
  } catch (err) {
    logger.error("fetchStockPrice error", { symbol, err: err.message });
    throw err;
  }
}

/**
 * fetchPrice - top-level fetcher that picks provider by assetType
 * assetType: 'crypto' | 'stock' | 'etf' | 'mutual_fund' | 'bond' | 'other'
 */
async function fetchPrice(symbol, assetType) {
  if (!symbol) throw new Error("Symbol required");
  if (assetType === "crypto") return fetchCryptoPrice(symbol);
  // Stocks, ETFs, and most other securities can use stock price API
  if (assetType === "stock" || assetType === "etf" || assetType === "mutual_fund" || assetType === "bond" || assetType === "other") {
    return fetchStockPrice(symbol);
  }
  // Fallback: try stock price API for unknown types
  logger.warn("fetchPrice: unknown assetType, trying stock API", { assetType, symbol });
  return fetchStockPrice(symbol);
}

/**
 * updateUserPortfolio - fetches current prices for a user's investments and updates model rows.
 * Also returns the portfolio summary from calculatePortfolio util.
 *
 * @param {number} userId
 */
async function updateUserPortfolio(userId) {
  try {
    const investments = await Investment.findAll({
      where: { user_id: userId },
    });

    if (!investments || investments.length === 0) {
      return { totalInvested: 0, totalValue: 0, profitLoss: 0, breakdown: [] };
    }

    // Fetch prices in parallel (with caching)
    const promises = investments.map(async (inv) => {
      try {
        const price = await fetchPrice(inv.symbol, inv.asset_type);
        // update model
        await inv.update({
          current_price: price,
        });
        return inv; // return updated instance
      } catch (err) {
        logger.error("Failed to update price for investment", {
          id: inv.id,
          symbol: inv.symbol,
          err: err.message,
        });
        return inv; // return unchanged instance
      }
    });

    const updatedInvestments = await Promise.all(promises);

    // Convert to plain objects for calculatePortfolio
    const invPlain = updatedInvestments.map((i) => ({
      id: i.id,
      symbol: i.symbol,
      asset_type: i.asset_type,
      quantity: parseFloat(i.quantity),
      buy_price: parseFloat(i.buy_price),
      current_price: i.current_price ? parseFloat(i.current_price) : 0,
    }));

    const summary = calculatePortfolio(invPlain);

    // Optionally log the portfolio snapshot (you could persist snapshots to DB)
    await LogPortfolioSnapshot(userId, summary);

    return summary;
  } catch (err) {
    logger.error("updateUserPortfolio error", { userId, err: err.message });
    throw err;
  }
}

/**
 * Log portfolio snapshot (non-persistent example using Log model)
 * You can replace this with a dedicated snapshots table if desired.
 */
async function LogPortfolioSnapshot(userId, summary) {
  try {
    const { Log } = require("../models"); // require here to avoid circular requires at top
    await Log.create({
      user_id: userId,
      action: "PORTFOLIO_SNAPSHOT",
      details: JSON.stringify({
        totalInvested: summary.totalInvested,
        totalValue: summary.totalValue,
        profitLoss: summary.profitLoss,
        timestamp: new Date(),
      }),
    });
  } catch (err) {
    logger.error("LogPortfolioSnapshot error", { userId, err: err.message });
  }
}

/**
 * updateAllPortfolios - iterate over all users and update their portfolios.
 * Useful for a periodic job (cron). Be careful with API rate limits.
 */
async function updateAllPortfolios() {
  try {
    const users = await User.findAll({ attributes: ["id"] });
    for (const u of users) {
      try {
        await updateUserPortfolio(u.id);
      } catch (e) {
        logger.error("updateAllPortfolios: failed for user", { userId: u.id, err: e.message });
      }
    }
  } catch (err) {
    logger.error("updateAllPortfolios error", { err: err.message });
    throw err;
  }
}

module.exports = {
  fetchPrice,
  updateUserPortfolio,
  updateAllPortfolios,
};
