/**
 * Dynamic Pricing Engine for NextGen HMS
 * 
 * Logic: 
 * - Base Price: The room's default rate.
 * - Occupancy Surge: If more than 70% of rooms are booked, price increases by 20%.
 * - Weekend Multiplier: If today is Fri/Sat/Sun, price increases by 15%.
 * - Seasonal Multiplier: Holiday seasons can increase prices.
 */

const calculateDynamicPrice = (basePrice, occupancyRate) => {
  let finalPrice = basePrice;
  const multipliers = [];
  
  // Get current day
  const today = new Date().getDay();
  const isWeekend = [0, 5, 6].includes(today); // Sunday, Friday, Saturday

  // High Occupancy Surge (20% increase)
  if (occupancyRate > 0.7) {
    finalPrice *= 1.2;
    multipliers.push({ name: 'High Demand', factor: 1.2 });
  } else if (occupancyRate > 0.5) {
    // Moderate demand (10% increase)
    finalPrice *= 1.1;
    multipliers.push({ name: 'Moderate Demand', factor: 1.1 });
  }

  // Weekend Surge (15% increase)
  if (isWeekend) {
    finalPrice *= 1.15;
    multipliers.push({ name: 'Weekend', factor: 1.15 });
  }

  // Check for holiday seasons (simplified logic)
  const month = new Date().getMonth();
  const isHolidaySeason = [11, 0, 4, 5].includes(month); // Dec, Jan, May, June
  
  if (isHolidaySeason) {
    finalPrice *= 1.1;
    multipliers.push({ name: 'Holiday Season', factor: 1.1 });
  }

  return Math.round(finalPrice);
};

// Calculate occupancy statistics
const calculateOccupancyStats = (rooms) => {
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.isAvailable).length;
  const bookedRooms = totalRooms - availableRooms;
  const occupancyRate = totalRooms > 0 ? bookedRooms / totalRooms : 0;
  
  return {
    totalRooms,
    availableRooms,
    bookedRooms,
    occupancyRate: Math.round(occupancyRate * 100),
    isHighDemand: occupancyRate > 0.7
  };
};

// Get pricing breakdown for transparency
const getPricingBreakdown = (basePrice, occupancyRate) => {
  const breakdown = {
    basePrice,
    adjustments: [],
    finalPrice: basePrice
  };
  
  const today = new Date().getDay();
  const isWeekend = [0, 5, 6].includes(today);
  const month = new Date().getMonth();
  const isHolidaySeason = [11, 0, 4, 5].includes(month);
  
  let currentPrice = basePrice;

  if (occupancyRate > 0.7) {
    const adjustment = basePrice * 0.2;
    currentPrice += adjustment;
    breakdown.adjustments.push({
      reason: 'High Demand Surge',
      amount: adjustment,
      percentage: '20%'
    });
  } else if (occupancyRate > 0.5) {
    const adjustment = basePrice * 0.1;
    currentPrice += adjustment;
    breakdown.adjustments.push({
      reason: 'Moderate Demand',
      amount: adjustment,
      percentage: '10%'
    });
  }

  if (isWeekend) {
    const adjustment = currentPrice * 0.15;
    currentPrice += adjustment;
    breakdown.adjustments.push({
      reason: 'Weekend Rate',
      amount: adjustment,
      percentage: '15%'
    });
  }

  if (isHolidaySeason) {
    const adjustment = currentPrice * 0.1;
    currentPrice += adjustment;
    breakdown.adjustments.push({
      reason: 'Holiday Season',
      amount: adjustment,
      percentage: '10%'
    });
  }

  breakdown.finalPrice = Math.round(currentPrice);
  return breakdown;
};

export { calculateDynamicPrice, calculateOccupancyStats, getPricingBreakdown };
