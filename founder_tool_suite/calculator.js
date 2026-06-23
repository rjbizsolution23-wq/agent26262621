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
 * Computes Indian CTC components from a monthly basic salary input.
 * @param {number} monthlyBasic - Monthly Basic Salary
 * @param {number} annualBonusRate - Annual performance bonus multiplier (e.g. 0.1 for 10%)
 * @returns {Object} Monthly and Annual compensation breakdowns
 */
function calculateCTCComponents(monthlyBasic, annualBonusRate = 0.1) {
  const basicAnnual = monthlyBasic * 12;
  
  // HRA (House Rent Allowance): Typically 40% of Basic for non-metros, 50% for metros. Default to 45%.
  const monthlyHRA = Math.round(monthlyBasic * 0.45);
  const hraAnnual = monthlyHRA * 12;
  
  // Special Allowance: Balances out base payouts
  const monthlySpecial = Math.round(monthlyBasic * 0.3);
  const specialAnnual = monthlySpecial * 12;
  
  // PF (Provident Fund): Employer contribution is usually 12% of Basic
  const monthlyPF = Math.round(monthlyBasic * 0.12);
  const pfAnnual = monthlyPF * 12;

  // Gratuity: Calculated at 4.81% of Basic (roughly 15 days salary divided by 26 days of work per year)
  const monthlyGratuity = Math.round(monthlyBasic * 0.0481);
  const gratuityAnnual = monthlyGratuity * 12;

  const monthlyFixed = monthlyBasic + monthlyHRA + monthlySpecial;
  const annualFixed = monthlyFixed * 12;

  const annualPerformanceBonus = Math.round(annualFixed * annualBonusRate);
  
  const annualCTC = annualFixed + pfAnnual + gratuityAnnual + annualPerformanceBonus;
  
  return {
    monthly: {
      basic: monthlyBasic,
      hra: monthlyHRA,
      specialAllowance: monthlySpecial,
      fixedTotal: monthlyFixed,
      pf: monthlyPF,
      gratuity: monthlyGratuity
    },
    annual: {
      basic: basicAnnual,
      hra: hraAnnual,
      specialAllowance: specialAnnual,
      fixedTotal: annualFixed,
      pf: pfAnnual,
      gratuity: gratuityAnnual,
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
