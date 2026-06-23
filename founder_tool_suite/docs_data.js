/* 
=============================================================================
Startup Founder Tool Suite — Document Data & Generators
Rick Jefferson | RJ Business Solutions
📍 1342 NM 333, Tijeras, New Mexico 87059
=============================================================================
*/

const FOUNDER_TOOLS = [
  {
    id: "founder_agreement",
    name: "1. Founder Agreement",
    description: "Establish ownership percentages, vesting, and decision-making rules between co-founders.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "agreementDate", label: "Agreement Date", type: "date", default: "2026-06-23" },
      { id: "founder1Name", label: "Founder 1 Name", type: "text", default: "Rick Jefferson" },
      { id: "founder1Role", label: "Founder 1 Role", type: "text", default: "CEO" },
      { id: "founder1Equity", label: "Founder 1 Equity (%)", type: "number", default: 40 },
      { id: "founder2Name", label: "Founder 2 Name", type: "text", default: "Jane Doe" },
      { id: "founder2Role", label: "Founder 2 Role", type: "text", default: "CTO" },
      { id: "founder2Equity", label: "Founder 2 Equity (%)", type: "number", default: 40 },
      { id: "founder3Name", label: "Founder 3 Name", type: "text", default: "John Smith" },
      { id: "founder3Role", label: "Founder 3 Role", type: "text", default: "COO" },
      { id: "founder3Equity", label: "Founder 3 Equity (%)", type: "number", default: 20 },
      { id: "vestingYears", label: "Vesting Period (Years)", type: "number", default: 4 },
      { id: "cliffYears", label: "Cliff Period (Years)", type: "number", default: 1 }
    ],
    generator: (data) => `
# FOUNDER AGREEMENT

This Founder Agreement (the "Agreement") is entered into as of **${data.agreementDate}** by and between the co-founders listed below, for the purpose of establishing ownership, responsibilities, and operating principles of **${data.companyName}** (the "Company").

---

## 1. FOUNDER DETAILS & EQUITY OWNERSHIP

The co-founders agree to the initial equity division set forth below, subject to the vesting terms outlined in Section 3 of this Agreement:

| Founder Name | Role | Equity Ownership |
| :--- | :--- | :--- |
| **${data.founder1Name}** | ${data.founder1Role} | ${data.founder1Equity}% |
| **${data.founder2Name}** | ${data.founder2Role} | ${data.founder2Equity}% |
| **${data.founder3Name}** | ${data.founder3Role} | ${data.founder3Equity}% |
| **Total** | - | **100%** |

---

## 2. ROLES, RESPONSIBILITIES & DECISION MAKING

- **${data.founder1Name}** shall serve as **${data.founder1Role}** and oversee general business administration, financial strategies, operations, and compliance.
- **${data.founder2Name}** shall serve as **${data.founder2Role}** and oversee product research, software engineering, architecture, and technology releases.
- **${data.founder3Name}** shall serve as **${data.founder3Role}** and oversee business development, customer support operations, and marketing campaigns.

### Decision Making
Major business decisions (including altering capital structures, borrowing, selling assets, or hiring executives) require:
- **Simple Majority (2 out of 3 votes)** of the co-founders.

---

## 3. VESTING SCHEDULE

All founder equity listed in Section 1 shall vest over a **${data.vestingYears}-year period** with a **${data.cliffYears}-year cliff**, computed monthly. 
- No shares shall vest until the completion of **${data.cliffYears} year(s)** of service.
- Following the cliff, shares shall vest in equal monthly installments over the remaining months.

---

## 4. SIGNATURES

By signing below, the founders agree to all covenants:

**Founder 1:** 
___________________________   Date: ______________
**${data.founder1Name}**

**Founder 2:** 
___________________________   Date: ______________
**${data.founder2Name}**

**Founder 3:** 
___________________________   Date: ______________
**${data.founder3Name}**
`
  },
  {
    id: "incorporation_docs",
    name: "2. Incorporation Documents",
    description: "Simulated Ministry of Corporate Affairs (MCA) Certificate of Incorporation (India).",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC INNOVATIONS PRIVATE LIMITED" },
      { id: "incorporationDate", label: "Date of Incorporation", type: "date", default: "2026-06-23" },
      { id: "cin", label: "Corporate Identity Number (CIN)", type: "text", default: "U72900KA2026PTC123456" },
      { id: "srn", label: "System Reference Number (SRN)", type: "text", default: "T12345678" },
      { id: "pan", label: "Company PAN", type: "text", default: "AABCA1234D" },
      { id: "tan", label: "Company TAN", type: "text", default: "BLRA12345E" },
      { id: "regOffice", label: "Registered Office Address", type: "text", default: "B-123, 2nd Floor, Okhla Industrial Area, Phase II, New Delhi - 110020, India" }
    ],
    generator: (data) => `
=============================================================================
                      GOVERNMENT OF INDIA
                 MINISTRY OF CORPORATE AFFAIRS
                  Central Registration Centre
=============================================================================

                 CERTIFICATE OF INCORPORATION
        [Pursuant to sub-section (2) of section 7 of the Companies Act, 2013]

SRN: ${data.srn}                                   Date of Incorporation: ${data.incorporationDate}

I hereby certify that **${data.companyName}** is incorporated on this **${data.incorporationDate}** under the Companies Act, 2013 and that the company is limited by shares.

The Corporate Identity Number (CIN) of the company is: **${data.cin}**
The Permanent Account Number (PAN) of the company is: **${data.pan}**
The Tax Deduction and Collection Account Number (TAN) of the company is: **${data.tan}**

Given under my hand at Manesar this Twenty-Third day of June, Two Thousand Twenty-Six.

                                                Registrar of Companies
                                             For and on behalf of the
                                            Central Registration Centre

Registered Office Address:
${data.regOffice}

-----------------------------------------------------------------------------
*Note: This is a digitally signed certificate and does not require any physical signature.*
=============================================================================
`
  },
  {
    id: "exit_clause",
    name: "3. Co-founder Exit Clause",
    description: "Define equity forfeitures, non-competes, and transfer rights if a co-founder leaves the company.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "agreementDate", label: "Founder Agreement Date", type: "date", default: "2026-06-23" },
      { id: "founderName", label: "Exiting Founder Name", type: "text", default: "John Smith" },
      { id: "nonCompeteMonths", label: "Non-Compete Period (Months)", type: "number", default: 12 },
      { id: "resolutionJurisdiction", label: "Arbitration Jurisdiction", type: "text", default: "New Delhi, India" }
    ],
    generator: (data) => `
# CO-FOUNDER EXIT CLAUSE
*(An Addendum to the Founder Agreement)*

This Co-founder Exit Clause ("Clause") is part of the Founder Agreement dated **${data.agreementDate}** entered into by and between the co-founders of **${data.companyName}** ("Company").

---

## 1. DEFINITIONS
*   **"Exiting Founder"** means any co-founder who ceases to be actively involved in the Company for any reason (voluntary resignation, termination, death, or disability).
*   **"Active Involvement"** means the founder is working on the business full-time and contributing to the Company's operations.

---

## 2. EXIT EVENTS & EQUITY REALLOCATION
Upon the exit of **${data.founderName}** from the Company:
1.  **Forfeiture of Unvested Equity**: All unvested shares belonging to the Exiting Founder as of the exit date shall be forfeited and return to the Company's treasury pool.
2.  **Right of First Refusal (ROFR)**: The remaining co-founders or the Company shall have the first right to purchase the vested shares of the Exiting Founder at fair market value before transferring to external parties.

---

## 3. RESTRICTIVE COVENANTS
1.  **Non-Compete**: The Exiting Founder shall not, directly or indirectly, engage in or support any business competing with the Company for a period of **${data.nonCompeteMonths} months** from the exit date.
2.  **Non-Solicitation**: The Exiting Founder shall not solicit employees, clients, or investors of the Company for a period of **${data.nonCompeteMonths} months**.

---

## 4. GOVERNING LAW & RESOLUTION
Any dispute arising under this Clause shall be resolved through arbitration in **${data.resolutionJurisdiction}** in accordance with local arbitration laws.
`
  },
  {
    id: "shareholders_agreement",
    name: "4. Shareholders Agreement",
    description: "Define shareholder rights, transfer restrictions, board representation, and reserved matters.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "agreementDate", label: "Agreement Date", type: "date", default: "2026-06-23" },
      { id: "boardMembersCount", label: "Number of Board Directors", type: "number", default: 3 },
      { id: "reservedMattersConsent", label: "Reserved Matters Consent (%)", type: "number", default: 75 }
    ],
    generator: (data) => `
# SHAREHOLDERS' AGREEMENT

This Shareholders' Agreement (the "Agreement") is made and entered into on **${data.agreementDate}** by and among **${data.companyName}** and its subscribing shareholders.

---

## 1. BOARD REPRESENTATION & GOVERNANCE
*   The Board of Directors of the Company shall consist of **${data.boardMembersCount} directors**.
*   Each major shareholder holding more than 15% of the outstanding equity shares shall have the right to nominate one (1) director to the Board.

---

## 2. SHARE TRANSFER RESTRICTIONS
*   **Right of First Refusal (ROFR)**: No shareholder shall transfer any shares to any third party without first offering the same shares to the remaining shareholders.
*   **Tag-Along Right**: If a majority shareholder sells their shares, minority shareholders have the right to join the transaction and sell their shares proportionally.
*   **Drag-Along Right**: If shareholders holding more than 75% of the shares approve a sale, they can force the remaining minority shareholders to sell their shares on identical terms.

---

## 3. RESERVED MATTERS
The following matters require the affirmative vote of shareholders holding at least **${data.reservedMattersConsent}%** of the paid-up share capital:
1.  Amendment of Articles or Memorandum of Association.
2.  Any alteration of the capital structure (issuing new shares, buybacks).
3.  Merger, amalgamation, or liquidation of the Company.
4.  Entering into any contract exceeding INR 10,00,000.
`
  },
  {
    id: "cap_table",
    name: "5. Cap Table Calculator",
    description: "Interactive Cap Table tracking share classes, holdings, and dilution values.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "authCapital", label: "Authorized Share Capital (INR)", type: "number", default: 10000000 },
      { id: "founder1Shares", label: "Founder 1 Shares", type: "number", default: 1600000 },
      { id: "founder2Shares", label: "Founder 2 Shares", type: "number", default: 1200000 },
      { id: "founder3Shares", label: "Founder 3 Shares", type: "number", default: 800000 },
      { id: "investorShares", label: "Angel Investor Shares", type: "number", default: 200000 },
      { id: "esopPoolShares", label: "ESOP Pool Shares", type: "number", default: 200000 }
    ],
    generator: (data) => {
      const list = [
        { name: "Founder 1", sharesHeld: Number(data.founder1Shares) },
        { name: "Founder 2", sharesHeld: Number(data.founder2Shares) },
        { name: "Founder 3", sharesHeld: Number(data.founder3Shares) },
        { name: "Angel Investor", sharesHeld: Number(data.investorShares) },
        { name: "ESOP Pool", sharesHeld: Number(data.esopPoolShares) }
      ];
      const res = window.calculateCapTable(Number(data.authCapital), list);
      
      let rows = "";
      res.sharesList.forEach(sh => {
        rows += `| ${sh.name} | ${sh.sharesHeld.toLocaleString()} | ${sh.dilutionPercentage.toFixed(2)}% |\n`;
      });

      return `
# CAPITALIZATION TABLE (CAP TABLE)
**Company**: ${data.companyName}
**Date Generated**: 2026-06-23

---

## 1. CAPITAL STRUCTURE SUMMARY

*   **Authorized Share Capital**: INR ${res.authorizedShares.toLocaleString()}
*   **Total Issued & Subscribed Shares**: ${res.totalSharesIssued.toLocaleString()}
*   **Remaining Unissued Shares**: ${res.remainingUnissued.toLocaleString()}

---

## 2. SHAREHOLDING DETAIL

| Shareholder Name | Shares Held | Dilution (%) |
| :--- | :--- | :--- |
${rows}
| **Total** | **${res.totalSharesIssued.toLocaleString()}** | **100.00%** |
`;
    }
  },
  {
    id: "esop_agreement",
    name: "6. ESOP Agreement",
    description: "Employee Stock Option Plan agreement defining grants, exercise prices, and schedules.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "employeeName", label: "Employee Name", type: "text", default: "Alice Adams" },
      { id: "designation", label: "Designation", type: "text", default: "Lead Software Architect" },
      { id: "grantDate", label: "Date of Grant", type: "date", default: "2026-06-23" },
      { id: "optionsCount", label: "Number of Options Granted", type: "number", default: 50000 },
      { id: "exercisePrice", label: "Exercise Price per Share (INR)", type: "number", default: 10 },
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
*   **Exercise Price per Share**: INR ${data.exercisePrice}/-

---

## 2. VESTING & CLINICAL CLIFF
*   The Options shall vest over a **${data.vestingYears}-year vesting schedule** subject to continuous service.
*   **Cliff Period**: A **${data.cliffYears}-year cliff** applies, meaning 25% of the total options shall vest exactly 12 months after the grant date, and the remaining 75% shall vest in equal monthly installments over the following 36 months.
*   Unvested Options shall immediately lapse on the date of resignation or termination of engagement.

---

## 3. EXERCISE OF OPTIONS
*   Vested options may be exercised by the Employee after a liquidity event (IPO, acquisition) or during specified exercise windows by paying the Exercise Price of INR ${data.exercisePrice}/- per share to the Company.
`
  },
  {
    id: "nda",
    name: "7. NDA (Non-Disclosure Agreement)",
    description: "Standard mutual Non-Disclosure Agreement for sharing confidential IP.",
    fields: [
      { id: "disclosingParty", label: "Disclosing Party", type: "text", default: "ABC Innovations Private Limited" },
      { id: "receivingParty", label: "Receiving Party", type: "text", default: "Vendor Tech LLC" },
      { id: "purpose", label: "Purpose of Disclosure", type: "text", default: "Exploring a strategic backend API database integration partnership" },
      { id: "termYears", label: "NDA Term (Years)", type: "number", default: 3 },
      { id: "governingLaw", label: "Governing Law Jurisdiction", type: "text", default: "New Delhi, India" }
    ],
    generator: (data) => `
# NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement (the "Agreement") is made and entered into on **2026-06-23** by and between:
*   **DISCLOSING PARTY**: ${data.disclosingParty}
*   **RECEIVING PARTY**: ${data.receivingParty}

---

## 1. PURPOSE
The Disclosing Party desires to disclose certain confidential technical and commercial information to the Receiving Party for the purpose of: **${data.purpose}**.

---

## 2. CONFIDENTIAL INFORMATION
"Confidential Information" means any proprietary information disclosed by the Disclosing Party, including but not limited to business plans, software architecture codes, product design blueprints, database mockups, and customer metrics.

---

## 3. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to:
1.  Hold the Confidential Information in strict confidence.
2.  Not disclose any Confidential Information to any third party without prior written consent.
3.  Use the Confidential Information solely for the evaluated Purpose.

---

## 4. TERM & GOVERNING JURISDICTION
*   This Agreement shall remain in effect for a period of **${data.termYears} years** from the date of execution.
*   This Agreement shall be governed by and construed in accordance with the laws of **${data.governingLaw}**.
`
  },
  {
    id: "ip_assignment",
    name: "8. IP Assignment Agreement",
    description: "Assign all software codes, designs, and innovations from creators directly to the company.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "assignorName", label: "Assignor/Founder Name", type: "text", default: "Rick Jefferson" },
      { id: "ipDescription", label: "Description of Assigned IP", type: "text", default: "All source code, database architectures, and UI designs relating to the Supreme AI Swarm Orchestrator" },
      { id: "executionDate", label: "Execution Date", type: "date", default: "2026-06-23" }
    ],
    generator: (data) => `
# INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT

This IP Assignment Agreement (the "Agreement") is entered into on **${data.executionDate}** by and between **${data.assignorName}** (the "Assignor") and **${data.companyName}** (the "Company").

---

## 1. ASSIGNMENT OF INTELLECTUAL PROPERTY
The Assignor hereby irrevocably and perpetually assigns, transfers, and conveys to the Company all right, title, and interest in and to the following Intellectual Property:
> **${data.ipDescription}**

This assignment includes all worldwide copyright, patents, database rights, trade secrets, and designs.

---

## 2. CONSIDERATION
The Company has paid fair and adequate consideration to the Assignor for this assignment, the receipt of which is hereby acknowledged.

---

## 3. WORK MADE FOR HIRE
The Assignor acknowledges that all IP created by the Assignor during their engagement with the Company shall be deemed "work made for hire" for the Company to the fullest extent permitted by applicable law.
`
  },
  {
    id: "trademark_docs",
    name: "9. Trademark/IP Documents",
    description: "Certificate of Registration of Trade Mark (India official mock layout).",
    fields: [
      { id: "trademarkNo", label: "Trade Mark No.", type: "text", default: "5678901" },
      { id: "applicationNo", label: "Application No.", type: "text", default: "3456789" },
      { id: "proprietorName", label: "Proprietor Name", type: "text", default: "ABC INNOVATIONS PRIVATE LIMITED" },
      { id: "brandName", label: "Brand/Trademark Name", type: "text", default: "ABC INNOVATIONS" },
      { id: "classNo", label: "Class of Goods/Services", type: "number", default: 42 },
      { id: "registrationDate", label: "Date of Registration", type: "date", default: "2026-06-23" }
    ],
    generator: (data) => `
=============================================================================
                      GOVERNMENT OF INDIA
                  TRADE MARKS REGISTRY, MUMBAI
=============================================================================

            CERTIFICATE OF REGISTRATION OF TRADE MARK
            [Trade Marks Act, 1999 and Trade Marks Rules, 2017]

Trade Mark No: ${data.trademarkNo}                              Date of Registration: ${data.registrationDate}
Application No: ${data.applicationNo}

This is to certify that the Trade Mark shown below has been registered in Class **${data.classNo}** in the name of:
**${data.proprietorName}**
*${data.proprietorName}, B-123, 2nd Floor, New Delhi - 110020, India*

### Representation of Trademark:
## **${data.brandName}**

### STATEMENT OF USE:
*It is a condition of registration that the Trade Mark shall be used in relation to the goods/services for which it is registered, as per Section 47 of the Trade Marks Act, 1999.*

Sealed at my direction, this Twenty-Third day of June, Two Thousand Twenty-Six.

                                                Registrar of Trade Marks
                                                  Government of India
=============================================================================
`
  },
  {
    id: "employee_contracts",
    name: "10. Employee Contracts",
    description: "Comprehensive employment agreement with Indian salary structure and PF allocations.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "employeeName", label: "Employee Name", type: "text", default: "Alice Adams" },
      { id: "designation", label: "Designation", type: "text", default: "Senior Software Engineer" },
      { id: "monthlyBasic", label: "Monthly Basic Salary (INR)", type: "number", default: 50000 },
      { id: "bonusRate", label: "Performance Bonus Rate (%)", type: "number", default: 10 }
    ],
    generator: (data) => {
      const res = window.calculateCTCComponents(Number(data.monthlyBasic), Number(data.bonusRate)/100);
      return `
# EMPLOYMENT AGREEMENT

This Employment Agreement is entered into on **2026-06-23** by and between **${data.companyName}** and **${data.employeeName}** ("Employee").

---

## 1. APPOINTMENT & TERM
*   **Designation**: ${data.designation}
*   The Employee shall report to the CTO or such other supervisor designated by the Company.

---

## 2. COMPENSATION & BENEFITS (CTC Breakdown)

The Employee's compensation package details are set forth below:

| Component | Monthly Amount (INR) | Annual Amount (INR) |
| :--- | :--- | :--- |
| **Basic Salary** | ${res.monthly.basic.toLocaleString()} | ${res.annual.basic.toLocaleString()} |
| **House Rent Allowance (HRA)** | ${res.monthly.hra.toLocaleString()} | ${res.annual.hra.toLocaleString()} |
| **Special Allowance** | ${res.monthly.specialAllowance.toLocaleString()} | ${res.annual.specialAllowance.toLocaleString()} |
| **Provident Fund (Employer)** | ${res.monthly.pf.toLocaleString()} | ${res.annual.pf.toLocaleString()} |
| **Gratuity Allocation** | ${res.monthly.gratuity.toLocaleString()} | ${res.annual.gratuity.toLocaleString()} |
| **Performance Bonus (Variable)** | - | ${res.annual.performanceBonus.toLocaleString()} |
| **Total CTC (Cost to Company)** | - | **${res.annual.ctcTotal.toLocaleString()}** |

---

## 3. CONFIDENTIALITY & PROPRIETARY RIGHTS
The Employee shall maintain strict confidentiality regarding all proprietary source code, algorithms, and designs of the Company and assigns all IP rights created during service to the Company.
`;
    }
  },
  {
    id: "offer_letters",
    name: "11. Offer Letters",
    description: "Standard corporate recruitment offer letter with compensation tables.",
    fields: [
      { id: "candidateName", label: "Candidate Name", type: "text", default: "Alice Adams" },
      { id: "jobTitle", label: "Job Title", type: "text", default: "Lead Software Architect" },
      { id: "joiningDate", label: "Joining Date", type: "date", default: "2026-07-01" },
      { id: "monthlyBasic", label: "Monthly Basic Salary (INR)", type: "number", default: 60000 }
    ],
    generator: (data) => {
      const res = window.calculateCTCComponents(Number(data.monthlyBasic), 0.1);
      return `
# OFFER OF EMPLOYMENT

Date: 2026-06-23

Dear **${data.candidateName}**,

We are pleased to offer you the position of **${data.jobTitle}** with **ABC Innovations Private Limited**. We were highly impressed by your technical interview rounds.

### Key Offer Parameters:
*   **Designation**: ${data.jobTitle}
*   **Date of Joining**: ${data.joiningDate}
*   **Monthly Basic Salary**: INR ${res.monthly.basic.toLocaleString()}/-
*   **Total Annual CTC**: INR ${res.annual.ctcTotal.toLocaleString()}/-

### Salary Structure:
*   Basic Salary: INR ${res.monthly.basic.toLocaleString()}/month
*   House Rent Allowance (HRA): INR ${res.monthly.hra.toLocaleString()}/month
*   Employer PF contribution: INR ${res.monthly.pf.toLocaleString()}/month

Please sign and return a copy of this offer letter within 3 days as acceptance.

Sincerely,
**Rick Jefferson**
Founder & CEO, ABC Innovations
`;
    }
  },
  {
    id: "hr_policies",
    name: "12. HR Policies",
    description: "Employee Handbooks customizer outlining codes of conduct, privacy, and leaves.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "leaveDays", label: "Annual Paid Leaves (Days)", type: "number", default: 24 },
      { id: "probationMonths", label: "Probation Period (Months)", type: "number", default: 6 }
    ],
    generator: (data) => `
# COMPANY HUMAN RESOURCE (HR) POLICIES

Welcome to **${data.companyName}**. These policies define our high-performance workplace standards.

---

## 1. EQUAL OPPORTUNITY
We do not discriminate on the basis of race, color, religion, gender, sexual orientation, age, or disability.

---

## 2. PROBATION & PERFORMANCE
*   All new recruits serve a **${data.probationMonths}-month probation period**.
*   A performance review will be conducted at the end of the probation period to confirm employment.

---

## 3. LEAVE POLICY
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
    description: "Generate standard Terms of Service (TOS) for a SaaS product or website.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "websiteUrl", label: "Website URL", type: "text", default: "https://abcinnovations.com" },
      { id: "governingJurisdiction", label: "Governing Jurisdiction", type: "text", default: "New Delhi, India" }
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
These Terms shall be governed by and construed in accordance with the laws of **${data.governingJurisdiction}**.
`
  },
  {
    id: "privacy_policy",
    name: "14. Privacy Policy",
    description: "Generate standard GDPR/DPDP compliant Privacy Policy for SaaS platforms.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "websiteUrl", label: "Website URL", type: "text", default: "https://abcinnovations.com" },
      { id: "contactEmail", label: "Contact Email", type: "text", default: "privacy@abcinnovations.com" }
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
    description: "Checklist tracker of essential corporate filings and registrations.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "gstStatus", label: "GST Registration Status", type: "text", default: "Completed" },
      { id: "panStatus", label: "Company PAN Card Status", type: "text", default: "Completed" },
      { id: "tanStatus", label: "Company TAN Allocation Status", type: "text", default: "Completed" },
      { id: "tradeLicense", label: "Trade License Status", type: "text", default: "Pending" }
    ],
    generator: (data) => `
# LEGAL COMPLIANCE CHECKLIST
**Company**: ${data.companyName}

Below is the active status dashboard of critical government corporate filings and registrations:

| Registration / License | Status | Compliance Standard |
| :--- | :--- | :--- |
| **Corporate PAN** | ${data.panStatus} | Income Tax Act, 1961 |
| **Company TAN** | ${data.tanStatus} | Income Tax Act, 1961 |
| **GST Registration** | ${data.gstStatus} | CGST Act, 2017 |
| **Trade License** | ${data.tradeLicense} | Municipal Corporation Rules |

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
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations" },
      { id: "problem", label: "Slide 1: Problem Statement", type: "text", default: "Businesses waste hours drafting compliance agreements manually." },
      { id: "solution", label: "Slide 2: Our Solution", type: "text", default: "A automated, premium legal compiler that builds templates in seconds." },
      { id: "askAmount", label: "Slide 3: Funding Ask (INR/USD)", type: "text", default: "Raise $5M Seed Round" }
    ],
    generator: (data) => `
# PITCH DECK OUTLINE
**Company**: ${data.companyName}

---

### Slide 1: Cover
**${data.companyName}**
*Building Innovation. Delivering Impact.*

---

### Slide 2: The Problem
*   **Statement**: ${data.problem}
*   Manual errors cost companies legal liabilities.

---

### Slide 3: The Solution
*   **Statement**: ${data.solution}
*   High-fidelity documents on-demand.

---

### Slide 4: The Ask
*   **Target**: **${data.askAmount}**
*   Use of Funds: 50% Engineering, 30% Marketing, 20% Operations.
`
  },
  {
    id: "financial_model",
    name: "17. Financial Model Projections",
    description: "Interactive 5-year financial calculations based on revenue growth models.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "initialRev", label: "Year 1 Annual Revenue (INR)", type: "number", default: 4000000 },
      { id: "growthRate", label: "Yearly Revenue Growth (%)", type: "number", default: 25 },
      { id: "cogsRate", label: "COGS Ratio (%)", type: "number", default: 18 },
      { id: "opexRate", label: "OpEx Ratio (%)", type: "number", default: 35 }
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
        rows += `| Year ${item.year} | ${item.revenue.toLocaleString()} | ${item.cogs.toLocaleString()} | ${item.grossProfit.toLocaleString()} | ${item.totalOpEx.toLocaleString()} | ${item.ebitda.toLocaleString()} | ${item.netProfit.toLocaleString()} |\n`;
      });

      return `
# 5-YEAR FINANCIAL PROJECTIONS

Modeling forecast for **${data.companyName}** under ${data.growthRate}% annual growth rate assumptions.

| Period | Revenue (INR) | COGS (INR) | Gross Profit (INR) | Operating Expenses (INR) | EBITDA (INR) | Net Income (INR) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

*Projections are rounded to the nearest integer for presentation purposes.*
`;
    }
  },
  {
    id: "term_sheet",
    name: "18. Term Sheet",
    description: "General non-binding venture capital term sheet generator.",
    fields: [
      { id: "companyName", label: "Company Name", type: "text", default: "ABC Innovations Private Limited" },
      { id: "investorName", label: "Investor Name", type: "text", default: "RJ Ventures" },
      { id: "investmentAmount", label: "Investment Amount (INR)", type: "number", default: 50000000 },
      { id: "preMoneyVal", label: "Pre-Money Valuation (INR)", type: "number", default: 200000000 }
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

*   **Investment Amount**: INR ${Number(data.investmentAmount).toLocaleString()}
*   **Pre-Money Valuation**: INR ${Number(data.preMoneyVal).toLocaleString()}
*   **Post-Money Valuation**: INR ${postMoney.toLocaleString()}
*   **Investor Equity Share**: **${equityPct.toFixed(2)}%** on a fully diluted basis.
*   **Instrument**: Series A Compulsorily Convertible Preference Shares (CCPS).

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
