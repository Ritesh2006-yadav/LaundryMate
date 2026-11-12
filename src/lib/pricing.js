export const CLOTHING_CATALOG = [
  { id: 'shirt', name: 'Shirt', defaultPrice: 15, premiumPrice: 50, icon: 'Shirt' },
  { id: 'tshirt', name: 'T-Shirt', defaultPrice: 15, premiumPrice: 45, icon: 'Shirt' },
  { id: 'jeans', name: 'Jeans / Trousers', defaultPrice: 20, premiumPrice: 60, icon: 'Scissors' },
  { id: 'kurta', name: 'Kurta / Ethnic Wear', defaultPrice: 20, premiumPrice: 65, icon: 'Sparkles' },
  { id: 'bedsheet', name: 'Bedsheet / Linen', defaultPrice: 30, premiumPrice: 80, icon: 'Layers' },
  { id: 'towel', name: 'Towel', defaultPrice: 15, premiumPrice: 40, icon: 'Layers' },
  { id: 'jacket', name: 'Jacket / Hoodie / Blazer', defaultPrice: 35, premiumPrice: 90, icon: 'Shield' },
  { id: 'delicate', name: 'Delicate / Woolen / Silk', defaultPrice: 25, premiumPrice: 75, icon: 'Sparkles' },
  { id: 'others', name: 'Other Garments', defaultPrice: 15, premiumPrice: 50, icon: 'Package' },
];

export const PRICING_RULES = {
  regularBaseUnitPrice: 15,
  premiumBaseUnitPrice: 60,
};

export function calculateOrderPrice(items = [], isPremium = false) {
  let totalAmount = 0;
  let totalItemsCount = 0;

  const itemDetails = items.map((item) => {
    const catalogItem = CLOTHING_CATALOG.find(
      (c) => c.name.toLowerCase() === item.clothingType.toLowerCase()
    );

    const unitPrice =
      item.unitPrice ||
      (isPremium || item.isPremium
        ? catalogItem?.premiumPrice || PRICING_RULES.premiumBaseUnitPrice
        : catalogItem?.defaultPrice || PRICING_RULES.regularBaseUnitPrice);

    const count = Number(item.requestedCount || item.quantity || 1);
    const subtotal = count * unitPrice;

    totalAmount += subtotal;
    totalItemsCount += count;

    return {
      ...item,
      unitPrice,
      subtotal,
      requestedCount: count,
      isPremium: Boolean(isPremium || item.isPremium),
    };
  });

  return {
    totalAmount,
    totalItemsCount,
    items: itemDetails,
  };
}
