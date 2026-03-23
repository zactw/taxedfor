import { NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BudgetItem {
  name: string;
  description: string;
  percent: number;
  category: "Mandatory" | "Defense" | "Non-Defense" | "Debt";
}

export interface BudgetData {
  items: BudgetItem[];
  fiscalYear: number;
  fiscalPeriod: number;
  totalOutlays: number;
  isLive: boolean;
  fetchedAt: string;
  source: string;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

let cache: { data: BudgetData; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Fiscal Year Detection ────────────────────────────────────────────────────

function getCurrentFiscalYear(): { fy: number; period: number } {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  // US fiscal year: Oct 1 - Sep 30
  // FY2025 = Oct 1, 2024 - Sep 30, 2025
  // Period 1 = October, Period 2 = November, etc.
  if (month >= 10) {
    // Oct-Dec: new fiscal year just started
    return { fy: year + 1, period: month - 9 };
  } else {
    // Jan-Sep: mid fiscal year
    return { fy: year, period: month + 3 };
  }
}

function getPreviousFiscalYear(): { fy: number; period: number } {
  const current = getCurrentFiscalYear();
  return { fy: current.fy - 1, period: 12 };
}

// ─── Budget Function → Line Item Mapping ────────────────────────────────────

// Government budget function codes from USASpending API
// These are the categories returned by /api/v2/spending/ with type=budget_function

interface USASpendingResult {
  amount: number;
  id: string | null;
  type: string;
  name: string;
  code: string | null;
}

function mapAPIDataToLineItems(
  results: USASpendingResult[],
  totalOutlays: number
): BudgetItem[] {
  // Build a lookup by code
  const byCode: Record<string, number> = {};
  let totalMapped = 0;
  for (const r of results) {
    if (r.code && r.amount > 0) {
      byCode[r.code] = r.amount;
      totalMapped += r.amount;
    }
  }

  // Helper: get percentage of total outlays
  const pct = (code: string, fraction = 1.0): number => {
    const amt = byCode[code] ?? 0;
    return (amt / totalOutlays) * 100 * fraction;
  };

  // ── Defense (050) ──
  // National Defense $1.36T in FY2024
  // Split into sub-items based on DoD budget structure:
  // Air Force ~24%, Navy ~23%, Army ~20%, R&D ~13%, Agencies ~13%, NNSA ~2.5%, MilCon ~1.5%
  const defTotal = byCode["050"] ?? 0;
  const defPct = defTotal / totalOutlays / 100;

  const defenseItems: BudgetItem[] = [
    {
      name: "Air Force & Space Force",
      description: "Personnel, aircraft, satellites, cyber operations, and ICBM forces.",
      percent: parseFloat(((defTotal * 0.235) / totalOutlays * 100).toFixed(2)),
      category: "Defense",
    },
    {
      name: "Navy & Marine Corps",
      description: "Aircraft carriers, submarines, destroyers, amphibious forces, and naval aviation.",
      percent: parseFloat(((defTotal * 0.225) / totalOutlays * 100).toFixed(2)),
      category: "Defense",
    },
    {
      name: "Army Operations",
      description: "Ground forces, combat units, training, and Army installation operations.",
      percent: parseFloat(((defTotal * 0.200) / totalOutlays * 100).toFixed(2)),
      category: "Defense",
    },
    {
      name: "Defense R&D",
      description: "Advanced weapons R&D, DARPA projects, next-generation military technology.",
      percent: parseFloat(((defTotal * 0.130) / totalOutlays * 100).toFixed(2)),
      category: "Defense",
    },
    {
      name: "Defense Agencies (NSA, DIA)",
      description: "Intelligence agencies, logistics commands, and joint Pentagon-wide programs.",
      percent: parseFloat(((defTotal * 0.130) / totalOutlays * 100).toFixed(2)),
      category: "Defense",
    },
    {
      name: "Nuclear Weapons (NNSA)",
      description: "Design, production, and maintenance of the U.S. nuclear stockpile.",
      percent: parseFloat(((defTotal * 0.025) / totalOutlays * 100).toFixed(2)),
      category: "Defense",
    },
    {
      name: "Military Construction",
      description: "Building and modernizing bases, barracks, and facilities worldwide.",
      percent: parseFloat(((defTotal * 0.015) / totalOutlays * 100).toFixed(2)),
      category: "Defense",
    },
  ];

  // ── Health (550) ── Split: Medicaid/CHIP ~83%, NIH ~6.5%, CDC ~1%, Other ~9.5%
  const healthTotal = byCode["550"] ?? 0;

  // ── Income Security (600) ── Split: SNAP ~14%, SSI ~7%, EITC ~8%, CTC ~4%, Unemployment ~3.5%, TANF ~2.5%, Other ~61%
  const incomeTotal = byCode["600"] ?? 0;

  // ── Education (500) ── Split: K-12/Pell ~44%, Head Start ~7.5%, Other ~48.5%
  const eduTotal = byCode["500"] ?? 0;

  // ── Veterans (700) ── Split: Healthcare ~46%, Comp&Pensions ~57% (they overlap with total)
  const vetTotal = byCode["700"] ?? 0;

  // ── Transportation (400) ──
  const transTotal = byCode["400"] ?? 0;

  // ── Justice (750) ── Split: FBI/LEA ~18.5%, Prisons ~9.3%, Border/ICE ~37%, Other ~35%
  const justiceTotal = byCode["750"] ?? 0;

  // ── International Affairs (150) ── USAID ~39%, State Dept ~20%, Other ~41%
  const intlTotal = byCode["150"] ?? 0;

  // ── General Science (250) ── NASA ~50%, Other R&D ~50%
  const sciTotal = byCode["250"] ?? 0;

  // ── Energy (270) ──
  const energyTotal = byCode["270"] ?? 0;

  // ── General Government (800) ── IRS ~25%, Other ~75%
  const govTotal = byCode["800"] ?? 0;

  // ── Agriculture (350) ──
  const agTotal = byCode["350"] ?? 0;

  // ── Natural Resources & Environment (300) ── FEMA ~20%, EPA ~6%, Other ~74%
  const natResTotal = byCode["300"] ?? 0;

  // ── Commerce & Housing (370) ── ACA subsidies ~54%, Student loans ~25%, Other ~21%
  const commerceTotal = byCode["370"] ?? 0;

  // ── Community Development (450) ── HUD housing ~35%, Other ~65%
  const commDevTotal = byCode["450"] ?? 0;

  const p = (amt: number, fraction = 1.0) =>
    parseFloat(((amt * fraction / totalOutlays) * 100).toFixed(2));

  const items: BudgetItem[] = [
    // ── Mandatory ──
    {
      name: "Social Security (OASDI)",
      description: "Monthly retirement, survivor, and disability payments to ~70 million Americans.",
      percent: p(byCode["650"] ?? 0),
      category: "Mandatory",
    },
    {
      name: "Medicare",
      description: "Federal health insurance for Americans 65+ and certain disabled individuals.",
      percent: p(byCode["570"] ?? 0),
      category: "Mandatory",
    },
    {
      name: "Medicaid & CHIP",
      description: "Health coverage for low-income adults, children, pregnant women, and people with disabilities.",
      percent: p(healthTotal, 0.83),
      category: "Mandatory",
    },
    {
      name: "SNAP (Food Stamps)",
      description: "Nutrition assistance for ~42 million low-income Americans each month.",
      percent: p(incomeTotal, 0.14),
      category: "Mandatory",
    },
    {
      name: "Federal Civilian Retirement",
      description: "Pension and disability payments for retired federal government employees.",
      percent: p(incomeTotal, 0.19),
      category: "Mandatory",
    },
    {
      name: "Veterans Comp & Pensions",
      description: "Disability compensation and pension payments to eligible military veterans.",
      percent: p(vetTotal, 0.57),
      category: "Mandatory",
    },
    {
      name: "ACA Health Subsidies",
      description: "Premium tax credits helping individuals buy coverage on ACA marketplace exchanges.",
      percent: p(commerceTotal, 0.54),
      category: "Mandatory",
    },
    {
      name: "Earned Income Tax Credit",
      description: "Refundable tax credit for low- and moderate-income working families.",
      percent: p(incomeTotal, 0.08),
      category: "Mandatory",
    },
    {
      name: "Supplemental Security Inc.",
      description: "Cash assistance to aged, blind, and disabled people with limited income.",
      percent: p(incomeTotal, 0.07),
      category: "Mandatory",
    },
    {
      name: "Child Tax Credit",
      description: "Refundable portion of the Child Tax Credit for qualifying families.",
      percent: p(incomeTotal, 0.04),
      category: "Mandatory",
    },
    {
      name: "Student Loan Subsidies",
      description: "Interest subsidies and income-driven repayment forgiveness for federal student loans.",
      percent: p(commerceTotal, 0.25),
      category: "Mandatory",
    },
    {
      name: "Unemployment Insurance",
      description: "Temporary income support for workers who lose their jobs through no fault of their own.",
      percent: p(incomeTotal, 0.035),
      category: "Mandatory",
    },
    {
      name: "TANF & Family Support",
      description: "Block grants to states for cash assistance and services for low-income families.",
      percent: p(incomeTotal, 0.025),
      category: "Mandatory",
    },
    {
      name: "Other Mandatory Spending",
      description: "Flood insurance, deposit insurance, Pension Benefit Guaranty, and other entitlement programs.",
      percent: p(incomeTotal, 0.445) + p(commerceTotal, 0.21),
      category: "Mandatory",
    },

    // ── Defense ──
    ...defenseItems,

    // ── Non-Defense ──
    {
      name: "VA Healthcare",
      description: "Medical care, mental health, and rehabilitation for 9+ million enrolled veterans.",
      percent: p(vetTotal, 0.43),
      category: "Non-Defense",
    },
    {
      name: "Transportation (FAA, Amtrak)",
      description: "Federal Highway Administration, airports, air traffic control, and passenger rail.",
      percent: p(transTotal),
      category: "Non-Defense",
    },
    {
      name: "Education (K-12 & Pell)",
      description: "Title I funding for low-income schools, Pell grants, and special education.",
      percent: p(eduTotal, 0.44),
      category: "Non-Defense",
    },
    {
      name: "Housing Assistance (HUD)",
      description: "Section 8 vouchers, public housing, and community development grants.",
      percent: p(commDevTotal, 0.35),
      category: "Non-Defense",
    },
    {
      name: "NIH (Medical Research)",
      description: "National Institutes of Health funding for cancer, Alzheimer's, and disease research.",
      percent: p(healthTotal, 0.065),
      category: "Non-Defense",
    },
    {
      name: "NASA",
      description: "Space exploration, Artemis moon program, ISS, and Earth science missions.",
      percent: p(sciTotal, 0.50),
      category: "Non-Defense",
    },
    {
      name: "Border Patrol & ICE",
      description: "Customs and Border Protection, Immigration and Customs Enforcement operations.",
      percent: p(justiceTotal, 0.37),
      category: "Non-Defense",
    },
    {
      name: "Foreign Aid (USAID)",
      description: "Development assistance, humanitarian aid, and global health programs abroad.",
      percent: p(intlTotal, 0.39),
      category: "Non-Defense",
    },
    {
      name: "Agriculture & Farm Subsidies",
      description: "Crop insurance, conservation programs, rural development, and farm price supports.",
      percent: p(agTotal),
      category: "Non-Defense",
    },
    {
      name: "Energy Dept (Non-Nuclear)",
      description: "Clean energy R&D, grid modernization, and energy efficiency programs.",
      percent: p(energyTotal),
      category: "Non-Defense",
    },
    {
      name: "FEMA & Disaster Relief",
      description: "Federal Emergency Management Agency response, recovery, and mitigation grants.",
      percent: p(natResTotal, 0.20),
      category: "Non-Defense",
    },
    {
      name: "State Dept & Embassies",
      description: "U.S. diplomatic missions, consular services, and international organizations.",
      percent: p(intlTotal, 0.20),
      category: "Non-Defense",
    },
    {
      name: "IRS & Treasury Admin",
      description: "Tax collection, financial crimes enforcement, and fiscal operations.",
      percent: p(govTotal, 0.25),
      category: "Non-Defense",
    },
    {
      name: "Head Start & Early Childhood",
      description: "Preschool and family services for low-income children under age 5.",
      percent: p(eduTotal, 0.075),
      category: "Non-Defense",
    },
    {
      name: "FBI & Federal Law Enforcement",
      description: "FBI, DEA, ATF, U.S. Marshals, and other federal law enforcement agencies.",
      percent: p(justiceTotal, 0.185),
      category: "Non-Defense",
    },
    {
      name: "EPA (Environment)",
      description: "Clean Air Act enforcement, Superfund cleanup, and water quality programs.",
      percent: p(natResTotal, 0.06),
      category: "Non-Defense",
    },
    {
      name: "CDC (Disease Control)",
      description: "Public health surveillance, vaccine programs, and disease prevention.",
      percent: p(healthTotal, 0.01),
      category: "Non-Defense",
    },
    {
      name: "Federal Prisons (BOP)",
      description: "Bureau of Prisons operating ~120 federal facilities housing ~160,000 inmates.",
      percent: p(justiceTotal, 0.093),
      category: "Non-Defense",
    },
    {
      name: "SBA & Small Business",
      description: "Small Business Administration loans, grants, and entrepreneurship programs.",
      percent: p(commDevTotal, 0.05),
      category: "Non-Defense",
    },
    {
      name: "Other Non-Defense Discr.",
      description: "Courts, Congress, White House, and hundreds of smaller federal programs.",
      percent:
        p(govTotal, 0.75) +
        p(sciTotal, 0.50) +
        p(natResTotal, 0.74) +
        p(commDevTotal, 0.60) +
        p(intlTotal, 0.41) +
        p(eduTotal, 0.485) +
        p(justiceTotal, 0.352),
      category: "Non-Defense",
    },

    // ── Debt ──
    {
      name: "Interest on National Debt",
      description: "Net interest payments on $34+ trillion in outstanding federal debt — the fastest growing major expense.",
      percent: p(byCode["900"] ?? 0),
      category: "Debt",
    },
  ];

  // Ensure percentages are valid (non-negative, not NaN)
  return items.map((item) => ({
    ...item,
    percent: isNaN(item.percent) || item.percent < 0 ? 0 : item.percent,
  }));
}

// ─── Fallback Data (FY2024) ──────────────────────────────────────────────────

const FALLBACK_BUDGET_DATA: BudgetData = {
  fiscalYear: 2024,
  fiscalPeriod: 12,
  totalOutlays: 6750000000000,
  isLive: false,
  fetchedAt: new Date(0).toISOString(),
  source: "fallback",
  items: [
    { name: "Social Security (OASDI)", description: "Monthly retirement, survivor, and disability payments to ~70 million Americans.", percent: 20.0, category: "Mandatory" },
    { name: "Medicare", description: "Federal health insurance for Americans 65+ and certain disabled individuals.", percent: 14.8, category: "Mandatory" },
    { name: "Medicaid & CHIP", description: "Health coverage for low-income adults, children, pregnant women, and people with disabilities.", percent: 9.1, category: "Mandatory" },
    { name: "SNAP (Food Stamps)", description: "Nutrition assistance for ~42 million low-income Americans each month.", percent: 1.7, category: "Mandatory" },
    { name: "Federal Civilian Retirement", description: "Pension and disability payments for retired federal government employees.", percent: 2.3, category: "Mandatory" },
    { name: "Veterans Comp & Pensions", description: "Disability compensation and pension payments to eligible military veterans.", percent: 2.1, category: "Mandatory" },
    { name: "ACA Health Subsidies", description: "Premium tax credits helping individuals buy coverage on ACA marketplace exchanges.", percent: 1.3, category: "Mandatory" },
    { name: "Earned Income Tax Credit", description: "Refundable tax credit for low- and moderate-income working families.", percent: 1.0, category: "Mandatory" },
    { name: "Supplemental Security Inc.", description: "Cash assistance to aged, blind, and disabled people with limited income.", percent: 0.9, category: "Mandatory" },
    { name: "Child Tax Credit", description: "Refundable portion of the Child Tax Credit for qualifying families.", percent: 0.5, category: "Mandatory" },
    { name: "Student Loan Subsidies", description: "Interest subsidies and income-driven repayment forgiveness for federal student loans.", percent: 0.4, category: "Mandatory" },
    { name: "Unemployment Insurance", description: "Temporary income support for workers who lose their jobs through no fault of their own.", percent: 0.4, category: "Mandatory" },
    { name: "TANF & Family Support", description: "Block grants to states for cash assistance and services for low-income families.", percent: 0.3, category: "Mandatory" },
    { name: "Other Mandatory Spending", description: "Flood insurance, deposit insurance, Pension Benefit Guaranty, and other entitlement programs.", percent: 4.4, category: "Mandatory" },
    { name: "Air Force & Space Force", description: "Personnel, aircraft, satellites, cyber operations, and ICBM forces.", percent: 3.2, category: "Defense" },
    { name: "Navy & Marine Corps", description: "Aircraft carriers, submarines, destroyers, amphibious forces, and naval aviation.", percent: 3.1, category: "Defense" },
    { name: "Army Operations", description: "Ground forces, combat units, training, and Army installation operations.", percent: 2.7, category: "Defense" },
    { name: "Defense R&D", description: "Advanced weapons R&D, DARPA projects, next-generation military technology.", percent: 1.8, category: "Defense" },
    { name: "Defense Agencies (NSA, DIA)", description: "Intelligence agencies, logistics commands, and joint Pentagon-wide programs.", percent: 1.8, category: "Defense" },
    { name: "Nuclear Weapons (NNSA)", description: "Design, production, and maintenance of the U.S. nuclear stockpile.", percent: 0.3, category: "Defense" },
    { name: "Military Construction", description: "Building and modernizing bases, barracks, and facilities worldwide.", percent: 0.2, category: "Defense" },
    { name: "VA Healthcare", description: "Medical care, mental health, and rehabilitation for 9+ million enrolled veterans.", percent: 1.7, category: "Non-Defense" },
    { name: "Transportation (FAA, Amtrak)", description: "Federal Highway Administration, airports, air traffic control, and passenger rail.", percent: 1.6, category: "Non-Defense" },
    { name: "Education (K-12 & Pell)", description: "Title I funding for low-income schools, Pell grants, and special education.", percent: 1.2, category: "Non-Defense" },
    { name: "Housing Assistance (HUD)", description: "Section 8 vouchers, public housing, and community development grants.", percent: 1.1, category: "Non-Defense" },
    { name: "NIH (Medical Research)", description: "National Institutes of Health funding for cancer, Alzheimer's, and disease research.", percent: 0.7, category: "Non-Defense" },
    { name: "NASA", description: "Space exploration, Artemis moon program, ISS, and Earth science missions.", percent: 0.4, category: "Non-Defense" },
    { name: "Border Patrol & ICE", description: "Customs and Border Protection, Immigration and Customs Enforcement operations.", percent: 0.4, category: "Non-Defense" },
    { name: "Foreign Aid (USAID)", description: "Development assistance, humanitarian aid, and global health programs abroad.", percent: 0.4, category: "Non-Defense" },
    { name: "Agriculture & Farm Subsidies", description: "Crop insurance, conservation programs, rural development, and farm price supports.", percent: 0.3, category: "Non-Defense" },
    { name: "Energy Dept (Non-Nuclear)", description: "Clean energy R&D, grid modernization, and energy efficiency programs.", percent: 0.3, category: "Non-Defense" },
    { name: "FEMA & Disaster Relief", description: "Federal Emergency Management Agency response, recovery, and mitigation grants.", percent: 0.3, category: "Non-Defense" },
    { name: "State Dept & Embassies", description: "U.S. diplomatic missions, consular services, and international organizations.", percent: 0.2, category: "Non-Defense" },
    { name: "IRS & Treasury Admin", description: "Tax collection, financial crimes enforcement, and fiscal operations.", percent: 0.2, category: "Non-Defense" },
    { name: "Head Start & Early Childhood", description: "Preschool and family services for low-income children under age 5.", percent: 0.2, category: "Non-Defense" },
    { name: "FBI & Federal Law Enforcement", description: "FBI, DEA, ATF, U.S. Marshals, and other federal law enforcement agencies.", percent: 0.2, category: "Non-Defense" },
    { name: "EPA (Environment)", description: "Clean Air Act enforcement, Superfund cleanup, and water quality programs.", percent: 0.1, category: "Non-Defense" },
    { name: "CDC (Disease Control)", description: "Public health surveillance, vaccine programs, and disease prevention.", percent: 0.1, category: "Non-Defense" },
    { name: "Federal Prisons (BOP)", description: "Bureau of Prisons operating ~120 federal facilities housing ~160,000 inmates.", percent: 0.1, category: "Non-Defense" },
    { name: "SBA & Small Business", description: "Small Business Administration loans, grants, and entrepreneurship programs.", percent: 0.01, category: "Non-Defense" },
    { name: "Other Non-Defense Discr.", description: "Courts, Congress, White House, and hundreds of smaller federal programs.", percent: 2.7, category: "Non-Defense" },
    { name: "Interest on National Debt", description: "Net interest payments on $34+ trillion in outstanding federal debt — the fastest growing major expense.", percent: 13.2, category: "Debt" },
  ],
};

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET() {
  // Return cached data if still fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    // Determine fiscal year to query — prefer last complete FY, fallback to current YTD
    const { fy: currentFY, period: currentPeriod } = getCurrentFiscalYear();
    const { fy: prevFY } = getPreviousFiscalYear();

    // Try previous (complete) fiscal year first, then current YTD
    let usedFY = prevFY;
    let usedPeriod = 12;
    let responseData: { total: number; results: USASpendingResult[] } | null = null;

    // Attempt previous complete FY (period 12)
    const prevResponse = await fetch(
      "https://api.usaspending.gov/api/v2/spending/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "budget_function",
          filters: { fy: String(prevFY), period: 12 },
        }),
        next: { revalidate: 86400 },
      }
    );

    if (prevResponse.ok) {
      responseData = await prevResponse.json();
      usedFY = prevFY;
      usedPeriod = 12;
    } else {
      // Try current FY YTD
      const currResponse = await fetch(
        "https://api.usaspending.gov/api/v2/spending/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "budget_function",
            filters: { fy: String(currentFY), period: currentPeriod - 1 },
          }),
          next: { revalidate: 86400 },
        }
      );

      if (currResponse.ok) {
        responseData = await currResponse.json();
        usedFY = currentFY;
        usedPeriod = currentPeriod - 1;
      }
    }

    if (!responseData || !responseData.results || responseData.total <= 0) {
      throw new Error("No valid data returned from USASpending API");
    }

    const budgetItems = mapAPIDataToLineItems(responseData.results, responseData.total);

    const data: BudgetData = {
      items: budgetItems,
      fiscalYear: usedFY,
      fiscalPeriod: usedPeriod,
      totalOutlays: responseData.total,
      isLive: true,
      fetchedAt: new Date().toISOString(),
      source: "usaspending.gov",
    };

    // Store in module-level cache
    cache = { data, fetchedAt: Date.now() };

    return NextResponse.json(data);
  } catch (error) {
    console.error("[budget-data] Failed to fetch live data:", error);

    // Return hardcoded fallback
    return NextResponse.json(FALLBACK_BUDGET_DATA);
  }
}
