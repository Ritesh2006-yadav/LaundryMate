/**
 * MOCK STUB: Pricing & Premium Calculation Helper
 * OWNED BY: Member 3
 * EXPORTS:
 * - calculatePrice(order): Calculates order pricing based on item quantities and premium tags
 */

export const PRICING_CONFIG = {
  REGULAR_UNIT_PRICE: 15, // Standard wash per item (₹)
  PREMIUM_UNIT_PRICE: 60, // Dry clean / delicate per item (₹)
};

/**
 * Calculates total price for an order
 * @param {Object} order - Order object containing items array
 * @returns {Object} { totalAmount, regularCount, premiumCount, breakdown }
 */
export const calculatePrice = (order) => {
  if (!order || !Array.isArray(order.items)) {
    return {
      totalAmount: 0,
      regularCount: 0,
      premiumCount: 0,
      breakdown: [],
    };
  }

  let totalAmount = 0;
  let regularCount = 0;
  let premiumCount = 0;

  const breakdown = order.items.map((item) => {
    // If collectedCount is set and greater than 0, use collectedCount; otherwise use requestedCount
    const count =
      typeof item.collectedCount === 'number' && item.collectedCount > 0
        ? item.collectedCount
        : item.requestedCount || 0;

    const isPremium = Boolean(item.isPremium);
    const unitPrice = isPremium
      ? PRICING_CONFIG.PREMIUM_UNIT_PRICE
      : PRICING_CONFIG.REGULAR_UNIT_PRICE;

    const subtotal = count * unitPrice;
    totalAmount += subtotal;

    if (isPremium) {
      premiumCount += count;
    } else {
      regularCount += count;
    }

    return {
      clothingType: item.clothingType,
      count,
      isPremium,
      unitPrice,
      subtotal,
    };
  });

  return {
    totalAmount,
    regularCount,
    premiumCount,
    breakdown,
  };
};

export default calculatePrice;
