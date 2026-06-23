/* 
=============================================================================
Startup Founder Tool Suite — Document Data & Generators (NeuronEdge Labs Edition)
Rick Jefferson | RJ Business Solutions
📍 1342 NM 333, Tijeras, New Mexico 87059
=============================================================================
*/

const FOUNDER_TOOLS = [
  {
    id: "founder_agreement",
    name: "1. Founder Agreement",
    description: "Establish ownership percentages, vesting, and decision-making rules between NeuronEdge Labs co-founders.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "agreementDate", label: "Agreement Date", type: "date", default: "2026-06-23" },
      { id: "founder1Name", label: "Founder 1 Name", type: "text", default: "Ricky Jefferson" },
      { id: "founder1Role", label: "Founder 1 Role", type: "text", default: "CEO & President" },
      { id: "founder1Equity", label: "Founder 1 Equity (%)", type: "number", default: 35 },
      { id: "founder2Name", label: "Founder 2 Name", type: "text", default: "Dr. Jessica Edwards" },
      { id: "founder2Role", label: "Founder 2 Role", type: "text", default: "CSO (Chief Scientific Officer)" },
      { id: "founder2Equity", label: "Founder 2 Equity (%)", type: "number", default: 30 },
      { id: "founder3Name", label: "Founder 3 Name", type: "text", default: "Dr. McKnight" },
      { id: "founder3Role", label: "Founder 3 Role", type: "text", default: "Chief AI Architect" },
      { id: "founder3Equity", label: "Founder 3 Equity (%)", type: "number", default: 20 },
      { id: "founder4Name", label: "Founder 4 Name", type: "text", default: "Kurmesha C." },
      { id: "founder4Role", label: "Founder 4 Role", type: "text", default: "COO" },
      { id: "founder4Equity", label: "Founder 4 Equity (%)", type: "number", default: 15 },
      { id: "vestingYears", label: "Vesting Period (Years)", type: "number", default: 4 },
      { id: "cliffYears", label: "Cliff Period (Years)", type: "number", default: 1 }
    ],
    generator: (data) => `
# FOUNDER COLLABORATION & SHAREHOLDERS AGREEMENT

This Founder Agreement (the "Agreement") is entered into as of **${data.agreementDate}** by and between the co-founders listed below, for the purpose of establishing ownership, responsibilities, and operating principles of **${data.companyName}**, a Delaware/Wyoming C-Corporation (the "Company").

---

## 1. FOUNDER DETAILS & EQUITY OWNERSHIP

The co-founders agree to the initial equity division set forth below, representing founders' common stock allocation subject to the vesting terms outlined in Section 3 of this Agreement:

| Founder Name | Role | Equity Ownership | Initial Shares |
| :--- | :--- | :--- | :--- |
| **${data.founder1Name}** | ${data.founder1Role} | ${data.founder1Equity}% | 3,500,000 |
| **${data.founder2Name}** | ${data.founder2Role} | ${data.founder2Equity}% | 3,000,000 |
| **${data.founder3Name}** | ${data.founder3Role} | ${data.founder3Equity}% | 2,000,000 |
| **${data.founder4Name}** | ${data.founder4Role} | ${data.founder4Equity}% | 1,500,000 |
| **Total** | - | **100%** | **10,000,000** |

---

## 2. ROLES, REPRESENTATION & EXECUTIVE STRUCTURE

*   **${data.founder1Name}** shall serve as **${data.founder1Role}** and oversee general business administration, corporate fundraising, strategy, investor relations, and commercial operations.
*   **${data.founder2Name}** shall serve as **${data.founder2Role}** and oversee clinical research, scientific validation, laboratory projects, and peer-review submissions.
*   **${data.founder3Name}** shall serve as **${data.founder3Role}** and oversee deep learning research, agent swarm coordination engineering, and database systems.
*   **${data.founder4Name}** shall serve as **${data.founder4Role}** and oversee operations, corporate compliance, marketing outreach, and scaling schedules.

---

## 3. VESTING & REVERSE REPURCHASE RIGHTS

All shares issued to the founders under Section 1 shall vest over a **${data.vestingYears}-year vesting period** with a **${data.cliffYears}-year cliff**, computed monthly from the date of incorporation:
- No shares shall vest until the completion of **${data.cliffYears} year(s)** of service.
- If a founder terminates their relationship before the cliff, the Company shall exercise its right to repurchase 100% of their shares at par value ($0.0001 per share).
- Following the cliff, shares shall vest in equal monthly installments over the remaining months.

---

## 4. BOARD OF DIRECTORS & VOTING
*   The Board of Directors shall initially consist of 4 members: **${data.founder1Name}**, **${data.founder2Name}**, **${data.founder3Name}**, and **${data.founder4Name}**.
*   Any material transaction, amendment of corporate charter, or executive hiring requires a majority board vote.

---

## 5. SIGNATURES

By signing below, the representatives of **${data.companyName}** agree to all covenants:

**Founder 1:** 
___________________________   Date: ______________
**${data.founder1Name}**

**Founder 2:** 
___________________________   Date: ______________
**${data.founder2Name}**

**Founder 3:** 
___________________________   Date: ______________
**${data.founder3Name}**

**Founder 4:** 
___________________________   Date: ______________
**${data.founder4Name}**
`
  },
  {
    id: "incorporation_docs",
    name: "2. Incorporation Documents",
    description: "Certificate of Incorporation for a Wyoming C-Corporation (NeuronEdge Labs Inc.).",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "incorporationDate", label: "Date of Filing", type: "date", default: "2026-06-23" },
      { id: "filingId", label: "Wyoming Filing ID", type: "text", default: "2026-001234567" },
      { id: "ein", label: "Employer Identification Number (EIN)", type: "text", default: "12-3456789" },
      { id: "authShares", label: "Authorized Shares", type: "number", default: 10000000 },
      { id: "parValue", label: "Par Value per Share ($)", type: "text", default: "0.0001" },
      { id: "regAgent", label: "Registered Agent Name", type: "text", default: "Wyoming Corporate Services Inc." },
      { id: "regOffice", label: "Registered Office Address", type: "text", default: "1712 Pioneer Ave, Cheyenne, WY 82001" }
    ],
    generator: (data) => `
=============================================================================
                      STATE OF WYOMING
                     SECRETARY OF STATE
                  Herschler Building East
                    Cheyenne, WY 82002
=============================================================================

                 CERTIFICATE OF INCORPORATION
                 OF A DOMESTIC C-CORPORATION

Filing ID: ${data.filingId}                                Filing Date: ${data.incorporationDate}
IRS EIN: ${data.ein}

The undersigned, acting as the incorporator under the Wyoming Business Corporations Act, hereby adopts the following Articles of Incorporation:

*   **ARTICLE I (NAME)**: The name of the corporation is **${data.companyName}**
*   **ARTICLE II (REGISTERED OFFICE & AGENT)**: The name of the registered agent and address of the registered office is:
    **${data.regAgent}**
    *${data.regOffice}*
*   **ARTICLE III (AUTHORIZED SHARES)**: The total number of shares of stock which the corporation is authorized to issue is **${Number(data.authShares).toLocaleString()} shares** of Common Stock, with a par value of **$${data.parValue}** per share.
*   **ARTICLE IV (INCORPORATORS)**: The name and mailing address of the incorporator is:
    **Ricky Jefferson**, *1342 NM 333, Tijeras, NM 87059*

I hereby declare under penalty of perjury that this instrument is the incorporator's act and deed.

                                                Wyoming Secretary of State
                                              By: Corporate Filing Division
=============================================================================
`
  },
  {
    id: "exit_clause",
    name: "3. Co-founder Exit Clause",
    description: "Define share repurchases, IP retention, and non-compete covenants under Wyoming legal code.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "agreementDate", label: "Founder Agreement Date", type: "date", default: "2026-06-23" },
      { id: "founderName", label: "Exiting Founder Name", type: "text", default: "Kurmesha C." },
      { id: "nonCompeteMonths", label: "Non-Compete Period (Months)", type: "number", default: 12 },
      { id: "resolutionJurisdiction", label: "Arbitration Jurisdiction", type: "text", default: "Laramie County, Wyoming, USA" }
    ],
    generator: (data) => `
# CO-FOUNDER EXIT CLAUSE & BUYBACK AGREEMENT
*(An Addendum to the NeuronEdge Labs Founder Agreement)*

This Co-founder Exit Clause ("Clause") is part of the Founder Agreement dated **${data.agreementDate}** entered into by and between the co-founders of **${data.companyName}** ("Company").

---

## 1. EXIT CLASSIFICATIONS & EQUITY FORFEITURE
Upon termination of services of **${data.founderName}** (the "Exiting Founder"):
1.  **Repurchase of Unvested Shares**: The Company retains an options buyback right to repurchase all unvested shares from the Exiting Founder at a par value of $0.0001 per share.
2.  **Right of First Refusal (ROFR)**: If the Exiting Founder wishes to sell their vested shares, the Company and remaining founders shall have first priority to acquire them at Fair Market Value (FMV) as determined by an independent valuation expert.

---

## 2. INTELLECTUAL PROPERTY COVENANTS
*   **Irrevocable Assignment**: Any IP, software code, neural net models, or data assets developed by the Exiting Founder for **${data.companyName}** remains the sole and exclusive property of the Company. 
*   **IP License**: The Exiting Founder forfeits any claims, patent filings, or copyrights associated with neural network swarms developed during their engagement.

---

## 3. NON-COMPETE & NON-SOLICITATION
1.  **Non-Compete**: The Exiting Founder shall not operate or advise any competing neural network or AI agent platforms in the United States for a period of **${data.nonCompeteMonths} months** post-exit.
2.  **Non-Solicitation**: The Exiting Founder shall not hire or contract current employees or key advisors of the Company for a period of **${data.nonCompeteMonths} months**.

---

## 4. GOVERNING LAW & JURISDICTION
This Agreement shall be governed by the laws of the **State of Wyoming**. Any legal disputes shall be settled in state or federal courts located in **${data.resolutionJurisdiction}**.
`
  },
  {
    id: "shareholders_agreement",
    name: "4. Shareholders Agreement",
    description: "Define shareholder rights, information rights, pre-emptive rights, and reserved matters.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "agreementDate", label: "Agreement Date", type: "date", default: "2026-06-23" },
      { id: "boardDirectors", label: "Nominated Board Directors", type: "text", default: "Ricky Jefferson, Dr. Jessica Edwards, Dr. McKnight, Kurmesha C." },
      { id: "consentPct", label: "Affirmative Consent for Reserved Matters (%)", type: "number", default: 75 }
    ],
    generator: (data) => `
# SHAREHOLDERS' AGREEMENT

This Shareholders' Agreement (the "Agreement") is made and entered into on **${data.agreementDate}** by and among **${data.companyName}** and its subscribing shareholders.

---

## 1. CORPORATE GOVERNANCE & BOARD NOMINATIONS
*   The Board of Directors shall initially comprise the following representatives: **${data.boardDirectors}**.
*   Major shareholders holding at least 15% of the Common Stock shall retain the right to appoint one board member.

---

## 2. SHARE TRANSFER RESTRICTIONS & PROTECTIONS
*   **Right of First Refusal (ROFR)**: No shareholder may sell or transfer shares to a third party without first offering the shares to the Company and other shareholders.
*   **Pre-emptive Rights**: Shareholders have the right to purchase pro-rata shares in any future funding rounds to prevent involuntary dilution.
*   **Co-Sale / Tag-Along Rights**: If major shareholders propose a sale of their stock, minor shareholders retain the right to join the sale under identical pricing terms.

---

## 3. RESERVED MATTERS
The Company shall not perform the following actions without the affirmative consent of at least **${data.consentPct}%** of the outstanding shares:
1.  Amendment of Articles of Incorporation or Bylaws.
2.  Creation of any new class of shares or issuance of stock options beyond the ESOP pool.
3.  Merger, acquisition, or sale of substantial intellectual property.
4.  Liquidating or dissolving the Corporation.
`
  },
  {
    id: "cap_table",
    name: "5. Cap Table Calculator",
    description: "Calculate equity holdings, dilution percentages, and unallocated ESOP pools in USD ($).",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "authCapital", label: "Authorized Common Shares", type: "number", default: 10000000 },
      { id: "founder1Shares", label: "Ricky Jefferson (CEO) Shares", type: "number", default: 3500000 },
      { id: "founder2Shares", label: "Dr. Jessica Edwards (CSO) Shares", type: "number", default: 3000000 },
      { id: "founder3Shares", label: "Dr. McKnight (CSO) Shares", type: "number", default: 2000000 },
      { id: "founder4Shares", label: "Kurmesha C. (COO) Shares", type: "number", default: 1500000 },
      { id: "investorShares", label: "Venture Capital Investor Shares", type: "number", default: 2000000 },
      { id: "esopPoolShares", label: "ESOP Option Pool", type: "number", default: 1000000 }
    ],
    generator: (data) => {
      const list = [
        { name: "Ricky Jefferson (CEO)", sharesHeld: Number(data.founder1Shares) },
        { name: "Dr. Jessica Edwards (CSO)", sharesHeld: Number(data.founder2Shares) },
        { name: "Dr. McKnight (Chief AI Architect)", sharesHeld: Number(data.founder3Shares) },
        { name: "Kurmesha C. (COO)", sharesHeld: Number(data.founder4Shares) },
        { name: "Investor (RJ Ventures)", sharesHeld: Number(data.investorShares) },
        { name: "ESOP Option Pool", sharesHeld: Number(data.esopPoolShares) }
      ];
      const res = window.calculateCapTable(Number(data.authCapital), list);
      
      let rows = "";
      res.sharesList.forEach(sh => {
        rows += `| ${sh.name} | ${sh.sharesHeld.toLocaleString()} | ${sh.dilutionPercentage.toFixed(2)}% |\n`;
      });

      return `
# CAPITALIZATION TABLE (CAP TABLE)
**Company**: ${data.companyName}
**Reporting Currency**: USD ($)
**Date Generated**: 2026-06-23

---

## 1. SHARE STRUCTURE SUMMARY

*   **Authorized Shares**: ${res.authorizedShares.toLocaleString()}
*   **Total Issued & Subscribed Shares**: ${res.totalSharesIssued.toLocaleString()}
*   **Remaining Unissued Treasury Shares**: ${res.remainingUnissued.toLocaleString()}

---

## 2. DETAILED SHAREHOLDING SPREAD

| Shareholder Name / Pool | Common Shares Held | Dilution % |
| :--- | :--- | :--- |
${rows}
| **Total** | **${res.totalSharesIssued.toLocaleString()}** | **100.00%** |
`;
    }
  },
  {
    id: "esop_agreement",
    name: "6. ESOP Agreement",
    description: "Employee stock option plan grant agreement in USD ($) under US tax guidelines.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "employeeName", label: "Employee Name", type: "text", default: "Alice Adams" },
      { id: "designation", label: "Designation", type: "text", default: "Lead AI Swarm Engineer" },
      { id: "grantDate", label: "Date of Grant", type: "date", default: "2026-06-23" },
      { id: "optionsCount", label: "Number of Options Granted", type: "number", default: 100000 },
      { id: "exercisePrice", label: "Exercise Price per Share ($)", type: "text", default: "0.05" },
      { id: "vestingYears", label: "Vesting Period (Years)", type: "number", default: 4 },
      { id: "cliffYears", label: "Cliff Period (Years)", type: "number", default: 1 }
    ],
    generator: (data) => `
# EMPLOYEE STOCK OPTION PLAN (ESOP) AGREEMENT

This ESOP Agreement (the "Agreement") is made effective as of the Date of Grant by and between **${data.companyName}** and **${data.employeeName}** ("Employee").

---

## 1. OPTION DETAILS

*   **Employee Name**: ${data.employeeName}
*   **Designation**: ${data.designation}
*   **Date of Grant**: ${data.grantDate}
*   **Number of Options Granted**: ${Number(data.optionsCount).toLocaleString()} Options
*   **Exercise Price per Share**: $${data.exercisePrice} USD
*   **Tax Status**: Intended to qualify as an Incentive Stock Option (ISO) under Section 422 of the Internal Revenue Code.

---

## 2. VESTING & CLIFF
*   The options shall vest over a **${data.vestingYears}-year vesting schedule** subject to continuous employment.
*   **Cliff Period**: A **${data.cliffYears}-year cliff** applies. 25% of the total options shall vest exactly 12 months after the grant date, and the remaining 75% shall vest in equal monthly installments over the following 36 months.

---

## 3. EXERCISE OF OPTIONS
*   Upon vesting, options may be exercised to purchase common stock of the Company by paying the Exercise Price of $${data.exercisePrice} per share.
`
  },
  {
    id: "nda",
    name: "7. NDA (Non-Disclosure Agreement)",
    description: "Standard bilateral Non-Disclosure Agreement for confidential US discussions.",
    fields: [
      { id: "disclosingParty", label: "Disclosing Party", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "receivingParty", label: "Receiving Party", type: "text", default: "Venture Fund LP" },
      { id: "purpose", label: "Purpose of Disclosure", type: "text", default: "Reviewing a prospective Series Seed investment in NeuronEdge Labs Inc." },
      { id: "termYears", label: "NDA Term (Years)", type: "number", default: 3 },
      { id: "governingLaw", label: "Governing Law Jurisdiction", type: "text", default: "State of Wyoming, USA" }
    ],
    generator: (data) => `
# MUTUAL NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement (the "Agreement") is entered into as of **2026-06-23** by and between:
*   **DISCLOSING PARTY**: ${data.disclosingParty}
*   **RECEIVING PARTY**: ${data.receivingParty}

---

## 1. PURPOSE
The Disclosing Party desires to disclose certain confidential technical and commercial information to the Receiving Party for the purpose of: **${data.purpose}**.

---

## 2. CONFIDENTIAL INFORMATION
"Confidential Information" means any proprietary information disclosed by the Disclosing Party, including but not limited to business plans, software codes, agent swarm model blueprints, database mockups, financial projections, and customer metrics.

---

## 3. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to:
1.  Hold the Confidential Information in strict confidence.
2.  Not disclose any Confidential Information to any third party without prior written consent.
3.  Use the Confidential Information solely for the evaluated Purpose.

---

## 4. TERM & GOVERNING JURISDICTION
*   This Agreement shall remain in effect for a period of **${data.termYears} years** from the date of execution.
*   This Agreement shall be governed by and construed in accordance with the laws of the **${data.governingLaw}**.
`
  },
  {
    id: "ip_assignment",
    name: "8. IP Assignment Agreement",
    description: "Assign all software, neural models, and agent architectures from representatives to the company.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "assignorName", label: "Representative / Assignor Name", type: "text", default: "Ricky Jefferson, Dr. Jessica Edwards, Dr. McKnight, Kurmesha C." },
      { id: "ipDescription", label: "Description of Assigned IP", type: "text", default: "All algorithms, source code, agent swarm coordination architectures, and model designs relating to the NeuronEdge AI agent platform" },
      { id: "executionDate", label: "Execution Date", type: "date", default: "2026-06-23" }
    ],
    generator: (data) => `
# INTELLECTUAL PROPERTY ASSIGNMENT & TRANSFER AGREEMENT

This IP Assignment Agreement (the "Agreement") is entered into on **${data.executionDate}** by and between the co-founders **${data.assignorName}** (collectively, the "Assignors") and **${data.companyName}** (the "Company").

---

## 1. ASSIGNMENT OF INTELLECTUAL PROPERTY
The Assignors hereby irrevocably and perpetually assign, transfer, and convey to the Company all right, title, and interest in and to the following Intellectual Property:
> **${data.ipDescription}**

This assignment includes all worldwide copyright, patents, database rights, trade secrets, and designs.

---

## 2. REPRESENTATIONS & WARRANTIES
The Assignors warrant that they are the sole creators of the assigned IP, that the IP is free of any encumbrances, and that they have full legal authority to transfer the assets to the Company.

---

## 3. WORK MADE FOR HIRE
The Assignors agree that all IP created by them during their engagement with the Company shall be deemed "work made for hire" for the Company to the fullest extent permitted by applicable US law.
`
  },
  {
    id: "trademark_docs",
    name: "9. Trademark/IP Documents",
    description: "US Patent and Trademark Office (USPTO) Registration mock layout.",
    fields: [
      { id: "trademarkNo", label: "Registration No.", type: "text", default: "8,927,134" },
      { id: "applicationNo", label: "Application No.", type: "text", default: "90/123,456" },
      { id: "proprietorName", label: "Proprietor Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "brandName", label: "Brand/Trademark Name", type: "text", default: "NEURONEDGE LABS" },
      { id: "classNo", label: "USPTO Class of Goods/Services", type: "number", default: 42 },
      { id: "registrationDate", label: "Date of Registration", type: "date", default: "2026-06-23" }
    ],
    generator: (data) => `
=============================================================================
                UNITED STATES PATENT AND TRADEMARK OFFICE
=============================================================================

                     CERTIFICATE OF REGISTRATION
                      OF PRINCIPAL REGISTER

Registration No: ${data.trademarkNo}                              Date of Registration: ${data.registrationDate}
Application No: ${data.applicationNo}

This is to certify that the Trademark shown below has been registered in the Principal Register in Class **${data.classNo}** in the name of:
**${data.proprietorName}**
*${data.proprietorName}, Cheyenne, WY 82001, USA*

### Trademark:
## **${data.brandName}**

### Class of Services:
**Class 42**: Software as a service (SaaS) featuring distributed neural network agent swarm coordination algorithms, cloud-based data analytic APIs, and machine learning models.

Given under my hand at Alexandria, Virginia this Twenty-Third day of June, Two Thousand Twenty-Six.

                                               Director of the United States
                                            Patent and Trademark Office
=============================================================================
`
  },
  {
    id: "employee_contracts",
    name: "10. Employee Contracts",
    description: "US employment contract with base salary, FICA, health insurance, and 401(k) match in USD ($).",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "employeeName", label: "Employee Name", type: "text", default: "Alice Adams" },
      { id: "designation", label: "Designation", type: "text", default: "Lead AI Architect" },
      { id: "monthlyBasic", label: "Monthly Base Salary ($)", type: "number", default: 12000 },
      { id: "bonusRate", label: "Performance Bonus Rate (%)", type: "number", default: 10 }
    ],
    generator: (data) => {
      const res = window.calculateCTCComponents(Number(data.monthlyBasic), Number(data.bonusRate)/100);
      return `
# EMPLOYMENT AGREEMENT

This Employment Agreement is entered into as of **2026-06-23** by and between **${data.companyName}** and **${data.employeeName}** ("Employee").

---

## 1. APPOINTMENT & DESIGNATION
*   **Designation**: ${data.designation}
*   The Employee shall report directly to the CEO, Ricky Jefferson, or such other supervisor designated by the Board.

---

## 2. US COMPENSATION & BENEFITS (CTC Breakdown)

The Employee's compensation package details are set forth below in USD ($):

| Component | Monthly Amount ($) | Annual Amount ($) |
| :--- | :--- | :--- |
| **Base Salary** | $${res.monthly.basic.toLocaleString()} | $${res.annual.basic.toLocaleString()} |
| **Employer FICA Tax** | $${res.monthly.fica.toLocaleString()} | $${res.annual.fica.toLocaleString()} |
| **Employer Health Insurance Contribution** | $${res.monthly.health.toLocaleString()} | $${res.annual.health.toLocaleString()} |
| **401(k) Employer Matching (4%)** | $${res.monthly.match401k.toLocaleString()} | $${res.annual.match401k.toLocaleString()} |
| **Overhead & Workers Comp Estimate** | $${res.monthly.overhead.toLocaleString()} | $${res.annual.overhead.toLocaleString()} |
| **Performance Bonus (Variable)** | - | $${res.annual.performanceBonus.toLocaleString()} |
| **Total CTC (Cost to Company)** | - | **$${res.annual.ctcTotal.toLocaleString()}** |

---

## 3. CONFIDENTIALITY & PROPRIETARY RIGHTS
The Employee shall maintain strict confidentiality regarding all proprietary neural algorithms and agent codes and assigns all IP rights created during service to the Company.
`;
    }
  },
  {
    id: "offer_letters",
    name: "11. Offer Letters",
    description: "Standard US corporate recruitment offer letter with USD compensation tables.",
    fields: [
      { id: "candidateName", label: "Candidate Name", type: "text", default: "Alice Adams" },
      { id: "jobTitle", label: "Job Title", type: "text", default: "Lead AI Architect" },
      { id: "joiningDate", label: "Joining Date", type: "date", default: "2026-07-01" },
      { id: "monthlyBasic", label: "Monthly Base Salary ($)", type: "number", default: 12000 }
    ],
    generator: (data) => {
      const res = window.calculateCTCComponents(Number(data.monthlyBasic), 0.1);
      return `
# OFFER OF EMPLOYMENT

Date: 2026-06-23

Dear **${data.candidateName}**,

We are pleased to offer you the position of **${data.jobTitle}** with **NeuronEdge Labs Inc.**

### Key Offer Parameters (USD):
*   **Designation**: ${data.jobTitle}
*   **Date of Joining**: ${data.joiningDate}
*   **Monthly Base Salary**: $${res.monthly.basic.toLocaleString()}/month
*   **Total Annual CTC**: $${res.annual.ctcTotal.toLocaleString()}/year

### Salary Structure:
*   Base Salary: $${res.monthly.basic.toLocaleString()}/month
*   Employer Health contribution: $550/month
*   Employer 401(k) Match (4%): $${res.monthly.match401k.toLocaleString()}/month

Please sign and return a copy of this offer letter within 3 days as acceptance.

Sincerely,
**Ricky Jefferson**
CEO & President, NeuronEdge Labs Inc.
`;
    }
  },
  {
    id: "hr_policies",
    name: "12. HR Policies",
    description: "US-compliant Employee Handbooks outlining codes of conduct, leaves, and 401(k) policies.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "leaveDays", label: "Paid Time Off (PTO) (Days)", type: "number", default: 20 },
      { id: "probationMonths", label: "Probation Period (Months)", type: "number", default: 3 }
    ],
    generator: (data) => `
# COMPANY HUMAN RESOURCE (HR) POLICIES

Welcome to **${data.companyName}**. These policies define our high-performance workplace standards.

---

## 1. EQUAL OPPORTUNITY EMPLOYMENT (EEOC)
We do not discriminate on the basis of race, color, religion, gender, sexual orientation, age, or disability.

---

## 2. PROBATION & PERFORMANCE
*   All new recruits serve a **${data.probationMonths}-month probation period**.
*   A performance review will be conducted at the end of the probation period to confirm employment.

---

## 3. PTO POLICY
*   Employees are eligible for **${data.leaveDays} days of annual paid leaves**, credited monthly.
*   Prior approval from the manager is required for any leave exceeding 2 consecutive days.

---

## 4. DATA PRIVACY & IP
All computers, emails, and networks are company property. No proprietary source code may be extracted or shared outside corporate accounts.
`
  },
  {
    id: "terms_of_service",
    name: "13. Terms of Service",
    description: "Generate standard US Terms of Service (TOS) for NeuronEdge Labs SaaS products.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "websiteUrl", label: "Website URL", type: "text", default: "https://neuronedge.io" },
      { id: "governingJurisdiction", label: "Governing Jurisdiction", type: "text", default: "State of Wyoming, USA" }
    ],
    generator: (data) => `
# TERMS OF SERVICE

Welcome to **${data.companyName}** ("Company"). These Terms of Service ("Terms") govern your access to and use of our website at **${data.websiteUrl}** and related services.

---

## 1. ACCEPTANCE OF TERMS
By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use our services.

---

## 2. SERVICES & ACCOUNTS
*   You must be at least 18 years old to register an account.
*   You are responsible for safeguarding your account credentials.

---

## 3. INTELLECTUAL PROPERTY
All materials, designs, database interfaces, software codes, and trademarks displayed on this site are the exclusive property of the Company.

---

## 4. GOVERNING LAW
These Terms shall be governed by and construed in accordance with the laws of the **${data.governingJurisdiction}**.
`
  },
  {
    id: "privacy_policy",
    name: "14. Privacy Policy",
    description: "GDPR/CCPA/Wyoming-compliant Privacy Policy for SaaS platforms.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "websiteUrl", label: "Website URL", type: "text", default: "https://neuronedge.io" },
      { id: "contactEmail", label: "Contact Email", type: "text", default: "privacy@neuronedge.io" }
    ],
    generator: (data) => `
# PRIVACY POLICY

At **${data.companyName}**, accessible from **${data.websiteUrl}**, one of our main priorities is the privacy of our visitors.

---

## 1. INFORMATION WE COLLECT
We collect personal information that you provide to us directly:
*   Name, email, and phone number when registering.
*   IP address and browser cookies collected automatically.

---

## 2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
*   Provide, operate, and maintain our platform.
*   Improve and customize user experiences.
*   Send transaction notifications and updates.

---

## 3. CONTACT US
If you have any questions or require modifications to your data records, contact us at: **${data.contactEmail}**.
`
  },
  {
    id: "compliance_docs",
    name: "15. Legal Compliance Docs",
    description: "US C-Corporation compliance requirements and filing checklist tracker.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "einStatus", label: "IRS EIN Status", type: "text", default: "Completed" },
      { id: "wyFiling", label: "Wyoming Filing Status", type: "text", default: "Completed" },
      { id: "agentStatus", label: "Registered Agent Status", type: "text", default: "Completed" },
      { id: "secNotice", label: "SEC Form D Filing", type: "text", default: "Pending" }
    ],
    generator: (data) => `
# US CORPORATE COMPLIANCE CHECKLIST
**Company**: ${data.companyName}

Below is the active status dashboard of critical US federal and Wyoming state corporate filings:

| Registration / License | Status | Compliance Standard |
| :--- | :--- | :--- |
| **Wyoming Articles of Incorporation** | ${data.wyFiling} | Wyoming Secretary of State |
| **IRS EIN (Federal Employer ID)** | ${data.einStatus} | Internal Revenue Service (IRS) |
| **Registered Agent Service** | ${data.agentStatus} | Wyoming State Statute |
| **SEC Form D Filing** | ${data.secNotice} | Securities and Exchange Commission |

---

## Action Recommendation:
Ensure all "Pending" registrations are resolved with local compliance agents to avoid business disruptions.
`
  },
  {
    id: "pitch_deck",
    name: "16. Pitch Deck Slide Builder",
    description: "Draft structural text scripts and slide summaries for presentation builders.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs" },
      { id: "problem", label: "Slide 2: Problem Statement", type: "text", default: "Large AI models are expensive and run slow at the edge." },
      { id: "solution", label: "Slide 3: Our Solution", type: "text", default: "A distributed agent swarm network operating natively at the Edge." },
      { id: "askAmount", label: "Slide 4: Funding Ask ($)", type: "text", default: "Raise $5M Seed Round at $25M valuation" }
    ],
    generator: (data) => `
# PITCH DECK OUTLINE
**Company**: ${data.companyName}

---

### Slide 1: Cover
**${data.companyName}**
*Building Edge Agent Swarms. Delivering Impact.*

---

### Slide 2: The Problem
*   **Statement**: ${data.problem}
*   Standard cloud-based AI networks suffer from severe latency bottlenecks.

---

### Slide 3: The Solution
*   **Statement**: ${data.solution}
*   Local code harness and WebSocket coordinate tunnels executed serverless at the Edge.

---

### Slide 4: The Ask
*   **Target**: **${data.askAmount}**
*   Use of Funds: 50% Engineering, 30% Marketing, 20% Operations.
`
  },
  {
    id: "financial_model",
    name: "17. Financial Model Projections",
    description: "Interactive 5-year financial calculations based on revenue growth models in USD ($).",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "initialRev", label: "Year 1 Annual Revenue ($)", type: "number", default: 250000 },
      { id: "growthRate", label: "Yearly Revenue Growth (%)", type: "number", default: 40 },
      { id: "cogsRate", label: "COGS Ratio (%)", type: "number", default: 15 },
      { id: "opexRate", label: "OpEx Ratio (%)", type: "number", default: 45 }
    ],
    generator: (data) => {
      const res = window.calculateFinancialModel(
        Number(data.initialRev),
        Number(data.growthRate)/100,
        Number(data.cogsRate)/100,
        Number(data.opexRate)/100
      );

      let rows = "";
      res.forEach(item => {
        rows += `| Year ${item.year} | $${item.revenue.toLocaleString()} | $${item.cogs.toLocaleString()} | $${item.grossProfit.toLocaleString()} | $${item.totalOpEx.toLocaleString()} | $${item.ebitda.toLocaleString()} | $${item.netProfit.toLocaleString()} |\n`;
      });

      return `
# 5-YEAR FINANCIAL PROJECTIONS

Modeling forecast for **${data.companyName}** under ${data.growthRate}% annual growth rate assumptions.

| Period | Revenue ($) | COGS ($) | Gross Profit ($) | Operating Expenses ($) | EBITDA ($) | Net Income ($) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

*Projections are rounded to the nearest integer for presentation purposes.*
`;
    }
  },
  {
    id: "term_sheet",
    name: "18. Term Sheet",
    description: "Venture capital term sheet generator in USD ($) under US corporate laws.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "NeuronEdge Labs Inc." },
      { id: "investorName", label: "Investor Name", type: "text", default: "RJ Ventures" },
      { id: "investmentAmount", label: "Investment Amount ($)", type: "number", default: 2000000 },
      { id: "preMoneyVal", label: "Pre-Money Valuation ($)", type: "number", default: 10000000 }
    ],
    generator: (data) => {
      const postMoney = Number(data.investmentAmount) + Number(data.preMoneyVal);
      const equityPct = (Number(data.investmentAmount) / postMoney) * 100;
      return `
# VENTURE CAPITAL TERM SHEET
*(Non-Binding)*

This Term Sheet summarizes the principal terms and conditions under which **${data.investorName}** proposes to invest in **${data.companyName}**.

---

## 1. TRANSACTION STRUCTURE

*   **Investment Amount**: $${Number(data.investmentAmount).toLocaleString()} USD
*   **Pre-Money Valuation**: $${Number(data.preMoneyVal).toLocaleString()} USD
*   **Post-Money Valuation**: $${postMoney.toLocaleString()} USD
*   **Investor Equity Share**: **${equityPct.toFixed(2)}%** on a fully diluted basis.
*   **Instrument**: Series Seed Compulsorily Convertible Preference Shares (CCPS).

---

## 2. SHAREHOLDER RIGHTS
*   **Board Representation**: The Investor shall have the right to nominate one (1) director to the Board.
*   **Liquidation Preference**: 1x Non-Participating Liquidation Preference.
*   **Exclusivity**: The Company agrees to a 30-day exclusivity period during due diligence.
`;
    }
  }
];

if (typeof window !== 'undefined') {
  window.FOUNDER_TOOLS = FOUNDER_TOOLS;
}
