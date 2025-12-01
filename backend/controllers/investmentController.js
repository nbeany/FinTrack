const { Investment, Log } = require("../models");
const ApiError = require("../utils/apiError");
const investmentService = require("../services/investmentService");
const calculatePortfolio = require("../utils/calculatePortfolio");
const logger = require("../config/logger");

exports.addInvestment = async (req, res, next) => {
  try {
    // Create investment first
    const inv = await Investment.create({
      user_id: req.user.id,
      ...req.body,
    });

    // Automatically fetch current price when investment is added
    try {
      const currentPrice = await investmentService.fetchPrice(
        inv.symbol,
        inv.asset_type
      );
      if (currentPrice > 0) {
        await inv.update({ current_price: currentPrice });
        await inv.reload(); // Reload to get updated price
        logger.info("Successfully fetched price for investment", { 
          symbol: inv.symbol, 
          price: currentPrice 
        });
      } else {
        logger.warn("Fetched price is 0 or invalid", { 
          symbol: inv.symbol, 
          asset_type: inv.asset_type 
        });
      }
    } catch (priceError) {
      // Log but don't fail - investment is created, price can be updated later
      logger.warn("Failed to fetch initial price for investment", { 
        symbol: inv.symbol, 
        asset_type: inv.asset_type,
        error: priceError.message 
      });
      // Try to fetch price again after a short delay (in case of rate limiting)
      setTimeout(async () => {
        try {
          const retryPrice = await investmentService.fetchPrice(inv.symbol, inv.asset_type);
          if (retryPrice > 0) {
            await inv.update({ current_price: retryPrice });
            logger.info("Successfully fetched price on retry", { symbol: inv.symbol, price: retryPrice });
          }
        } catch (retryError) {
          logger.error("Retry price fetch also failed", { symbol: inv.symbol, error: retryError.message });
        }
      }, 2000); // Retry after 2 seconds
    }

    await Log.create({
      user_id: req.user.id,
      action: "ADD_INVESTMENT",
      details: JSON.stringify(req.body),
    });

    res.status(201).json(inv);
  } catch (error) {
    next(error);
  }
};

exports.getInvestments = async (req, res, next) => {
  try {
    // Automatically update prices before returning investments
    try {
      await investmentService.updateUserPortfolio(req.user.id);
    } catch (updateError) {
      // Log but don't fail - return investments even if price update fails
      console.warn("Failed to update prices:", updateError.message);
    }

    const inv = await Investment.findAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
    });

    res.json(inv);
  } catch (error) {
    next(error);
  }
};

// Get portfolio summary with calculated values
exports.getPortfolio = async (req, res, next) => {
  try {
    const investments = await Investment.findAll({
      where: { user_id: req.user.id },
    });

    const portfolio = calculatePortfolio(investments);
    res.json(portfolio);
  } catch (error) {
    next(error);
  }
};

// Update portfolio prices (fetches current prices from APIs)
exports.updatePortfolioPrices = async (req, res, next) => {
  try {
    const portfolio = await investmentService.updateUserPortfolio(req.user.id);
    
    await Log.create({
      user_id: req.user.id,
      action: "UPDATE_PORTFOLIO_PRICES",
      details: `Portfolio updated: Total Value ${portfolio.totalValue}, Profit/Loss ${portfolio.profitLoss}`,
    });

    res.json({
      message: "Portfolio prices updated successfully",
      portfolio
    });
  } catch (error) {
    next(error);
  }
};

exports.updateInvestment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inv = await Investment.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!inv) throw new ApiError(404, "Investment not found");

    await inv.update(req.body);

    await Log.create({
      user_id: req.user.id,
      action: "UPDATE_INVESTMENT",
      details: JSON.stringify(req.body),
    });

    res.json({ message: "Investment updated" });
  } catch (error) {
    next(error);
  }
};

exports.deleteInvestment = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Investment.destroy({
      where: { id, user_id: req.user.id },
    });

    await Log.create({
      user_id: req.user.id,
      action: "DELETE_INVESTMENT",
      details: `Investment ID ${id}`,
    });

    res.json({ message: "Investment deleted" });
  } catch (error) {
    next(error);
  }
};
