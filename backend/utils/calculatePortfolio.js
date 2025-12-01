module.exports = function calculatePortfolio(investments) {
  let totalInvested = 0;
  let totalValue = 0;

  const breakdown = investments.map(inv => {
    const invested = parseFloat(inv.quantity) * parseFloat(inv.buy_price);
    const value = parseFloat(inv.quantity) * parseFloat(inv.current_price || 0);
    const profitLoss = value - invested;

    totalInvested += invested;
    totalValue += value;

    return {
      id: inv.id,
      symbol: inv.symbol,
      asset_type: inv.asset_type,
      quantity: inv.quantity,
      buy_price: inv.buy_price,
      current_price: inv.current_price || 0,
      invested,
      value,
      profitLoss
    };
  });

  return {
    totalInvested,
    totalValue,
    profitLoss: totalValue - totalInvested,
    breakdown
  };
};
