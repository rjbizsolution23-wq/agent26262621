/* 
=============================================================================
Startup Founder Tool Suite — Calculations Core Engine
Rick Jefferson | RJ Business Solutions
📍 1342 NM 333, Tijeras, New Mexico 87059
=============================================================================
*/

/**
 * Calculates share allocation and dilution percentages in the Cap Table.
 * @param {number} authorizedShares - Total authorized shares
 * @param {Array} shareholders - List of shareholders { name, type, sharesHeld }
 * @returns {Object} Cap Table summary and detailed shares list
 */
function calculateCapTable(authorizedShares, shareholders) {
  const totalSharesIssued = shareholders.reduce((acc, sh) => acc + (sh.sharesHeld || 0), 0);
  const remainingUnissued = Math.max(0, authorizedShares - totalSharesIssued);
  
  const sharesList = shareholders.map(sh => {
    const percentage = totalSharesIssued > 0 ? ((sh.sharesHeld || 0) / totalSharesIssued) * 100 : 0;
    return {
      ...sh,
      dilutionPercentage: percentage
    };
  });

  return {
    authorizedShares,
    totalSharesIssued,
    remainingUnissued,
    sharesList
  };
}

/**
 * Calculates ESOP Vesting schedule values.
 * @param {number} grantAmount - Total options granted
 * @param {string} startDateStr - Grant/Start Date (YYYY-MM-DD)
 * @param {string} cliffDateStr - Cliff Date (YYYY-MM-DD)
 * @param {number} totalMonths - Total vesting duration (usually 48)
 * @param {string} currentDateStr - Evaluation date
 * @returns {Object} Vesting status (vested, unvested, cliffMet)
 */
function calculateESOPVesting(grantAmount, startDateStr, cliffDateStr, totalMonths = 48, currentDateStr = new Date().toISOString().split('T')[0]) {
  const start = new Date(startDateStr);
  const cliff = new Date(cliffDateStr);
  const current = new Date(currentDateStr);

  if (isNaN(start.getTime()) || isNaN(cliff.getTime()) || isNaN(current.getTime())) {
    return { vested: 0, unvested: grantAmount, cliffMet: false, message: "Invalid date format" };
  }

  if (current < start) {
    return { vested: 0, unvested: grantAmount, cliffMet: false, message: "Vesting has not started yet." };
  }

  const cliffMet = current >= cliff;
  if (!cliffMet) {
    return { vested: 0, unvested: grantAmount, cliffMet: false, message: "Cliff period is not met yet." };
  }

  // Calculate elapsed months since start date
  let monthsElapsed = (current.getFullYear() - start.getFullYear()) * 12 + (current.getMonth() - start.getMonth());
  if (current.getDate() < start.getDate()) {
    monthsElapsed--;
  }

  monthsElapsed = Math.max(0, Math.min(totalMonths, monthsElapsed));
  const vestedFraction = monthsElapsed / totalMonths;
  const vested = Math.round(grantAmount * vestedFraction);
  const unvested = Math.max(0, grantAmount - vested);

  return {
    vested,
    unvested,
    cliffMet,
    monthsElapsed,
    percentageVested: (vested / grantAmount) * 100,
    message: `Vesting active: ${monthsElapsed}/${totalMonths} months completed.`
  };
}

/**
 * Computes US Corporate CTC (Cost to Company) components from a monthly basic salary input.
 * @param {number} monthlyBasic - Monthly Basic Salary (USD)
 * @param {number} annualBonusRate - Annual performance bonus multiplier (e.g. 0.1 for 10%)
 * @returns {Object} Monthly and Annual compensation breakdowns
 */
function calculateCTCComponents(monthlyBasic, annualBonusRate = 0.1) {
  const basicAnnual = monthlyBasic * 12;
  
  // Employer FICA: Social Security (6.2% up to cap, simplified) + Medicare (1.45%)
  const monthlyFICA = Math.round(monthlyBasic * 0.0765);
  const ficaAnnual = monthlyFICA * 12;
  
  // Employer Health Insurance: Assume standard $550/month contribution
  const monthlyHealth = 550;
  const healthAnnual = monthlyHealth * 12;
  
  // 401(k) Match: Assume company matches 4% of Basic Salary
  const monthly401k = Math.round(monthlyBasic * 0.04);
  const annual401k = monthly401k * 12;

  // Other Overhead (FUTA, SUTA, Workers Comp): Estimated at 2% of Basic
  const monthlyOverhead = Math.round(monthlyBasic * 0.02);
  const overheadAnnual = monthlyOverhead * 12;

  const monthlyFixed = monthlyBasic + monthlyFICA + monthlyHealth + monthly401k + monthlyOverhead;
  const annualFixed = monthlyFixed * 12;

  const annualPerformanceBonus = Math.round(basicAnnual * annualBonusRate);
  
  const annualCTC = annualFixed + annualPerformanceBonus;
  
  return {
    monthly: {
      basic: monthlyBasic,
      fica: monthlyFICA,
      health: monthlyHealth,
      match401k: monthly401k,
      overhead: monthlyOverhead,
      fixedTotal: monthlyFixed
    },
    annual: {
      basic: basicAnnual,
      fica: ficaAnnual,
      health: healthAnnual,
      match401k: annual401k,
      overhead: overheadAnnual,
      fixedTotal: annualFixed,
      performanceBonus: annualPerformanceBonus,
      ctcTotal: annualCTC
    }
  };
}

/**
 * Models 5-Year projections from core growth rates.
 * @param {number} initialRevenue - Year 1 Revenue (INR/USD)
 * @param {number} growthRate - Growth Rate multiplier (e.g., 0.3 for 30%)
 * @param {number} cogsPercent - COGS cost ratio (e.g. 0.18 for 18%)
 * @param {number} operatingExpensePercent - OpEx ratio (e.g. 0.35 for 35%)
 * @returns {Array} List of year-by-year projections (Year 1 to Year 5)
 */
function calculateFinancialModel(initialRevenue, growthRate = 0.25, cogsPercent = 0.18, operatingExpensePercent = 0.35) {
  const projections = [];
  let currentRevenue = initialRevenue;

  for (let year = 1; year <= 5; year++) {
    if (year > 1) {
      currentRevenue = Math.round(currentRevenue * (1 + growthRate));
    }

    const cogs = Math.round(currentRevenue * cogsPercent);
    const grossProfit = currentRevenue - cogs;
    const grossMargin = (grossProfit / currentRevenue) * 100;
    
    // OpEx breakdowns
    const rAndD = Math.round(currentRevenue * (operatingExpensePercent * 0.4));
    const sAndM = Math.round(currentRevenue * (operatingExpensePercent * 0.45));
    const gAndA = Math.round(currentRevenue * (operatingExpensePercent * 0.15));
    const totalOpEx = rAndD + sAndM + gAndA;
    
    const ebitda = grossProfit - totalOpEx;
    const ebitdaMargin = (ebitda / currentRevenue) * 100;
    
    const interestAndTax = Math.round(ebitda * 0.25); // Assume 25% tax/interest rate
    const netProfit = ebitda - interestAndTax;
    const netMargin = (netProfit / currentRevenue) * 100;

    projections.push({
      year,
      revenue: currentRevenue,
      cogs,
      grossProfit,
      grossMargin: grossMargin.toFixed(1),
      rAndD,
      sAndM,
      gAndA,
      totalOpEx,
      ebitda,
      ebitdaMargin: ebitdaMargin.toFixed(1),
      netProfit,
      netMargin: netMargin.toFixed(1)
    });
  }

  return projections;
}

// Export functions for browser use
if (typeof window !== 'undefined') {
  window.calculateCapTable = calculateCapTable;
  window.calculateESOPVesting = calculateESOPVesting;
  window.calculateCTCComponents = calculateCTCComponents;
  window.calculateFinancialModel = calculateFinancialModel;
}
