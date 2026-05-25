window.EcoCalculator = {
  calculate(horses, price) {
    return {
      horses,
      priceWithFee: Math.floor(price * 1.1),
      total: price * horses
    };
  }
};