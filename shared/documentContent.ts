export interface DocumentSection { heading: string; body: string; }
export interface DocumentDefinition { title: string; sections: DocumentSection[]; }

export const DOCUMENT_CONTENT: Record<string, DocumentDefinition> = {
  nda: {
    title: "NON-DISCLOSURE, NON-USE, NON-SOLICITATION, AND LEAD PROTECTION AGREEMENT",
    sections: [
      { heading: "PARTIES", body: 'This Agreement is entered into by and between Heritage Life Solutions, a subsidiary of Gold Coast Financial Partners, LLC ("Company"), and the undersigned individual ("Agent").' },
      { heading: "1. PURPOSE", body: "The Company may disclose certain confidential and proprietary information to the Agent solely for the purpose of evaluating, entering into, or performing a business relationship." },
      { heading: "2. CONFIDENTIAL INFORMATION", body: "Includes but is not limited to: leads, client data, CRM systems, sales processes, commission structures, carrier relationships, and business strategies. All leads are the sole property of the Company." },
      { heading: "3. NON-DISCLOSURE", body: "Agent shall not disclose any Confidential Information to any third party without prior written consent. This obligation survives termination of the business relationship." },
      { heading: "4. NON-SOLICITATION", body: "For 24 months following termination, Agent shall not solicit any client, lead, or employee of the Company." },
      { heading: "5. LEAD PROTECTION", body: "All leads generated through Company systems, marketing, or referrals remain Company property regardless of who services them." },
      { heading: "6. REMEDIES", body: "Agent acknowledges that breach would cause irreparable harm and agrees that Company shall be entitled to injunctive relief in addition to any other remedies." },
      { heading: "7. GOVERNING LAW", body: "This Agreement shall be governed by the laws of the State of Illinois." },
    ],
  },
  debt_rollup: {
    title: "DEBT ROLL-UP PROTECTION AND AUTHORIZATION AGREEMENT",
    sections: [
      { heading: "PARTIES", body: 'This Agreement is between Heritage Life Solutions / Gold Coast Financial Partners, LLC ("Company") and the undersigned Agent.' },
      { heading: "1. PURPOSE", body: "This Agreement authorizes the Company to apply outstanding debts against future commission earnings in accordance with the terms herein." },
      { heading: "2. DEBT CATEGORIES", body: "Includes advance repayment, training costs, marketing expenses, technology fees, and any other agreed-upon charges." },
      { heading: "3. AUTHORIZATION", body: "Agent authorizes Company to deduct applicable amounts from commission payments until all outstanding balances are satisfied." },
      { heading: "4. STATEMENTS", body: "Company shall provide monthly statements detailing all charges and deductions applied under this Agreement." },
      { heading: "5. DISPUTE RESOLUTION", body: "Any disputes regarding charges must be submitted in writing within 30 days of the statement date." },
      { heading: "6. GOVERNING LAW", body: "This Agreement shall be governed by the laws of the State of Illinois." },
    ],
  },
  compliance: {
    title: "COMPLIANCE AND ETHICAL CONDUCT AGREEMENT",
    sections: [
      { heading: "PARTIES", body: 'This Agreement is between Heritage Life Solutions / Gold Coast Financial Partners, LLC ("Company") and the undersigned Agent.' },
      { heading: "1. COMPLIANCE COMMITMENT", body: "Agent agrees to comply with all applicable federal, state, and local laws, regulations, and industry standards governing insurance sales and marketing." },
      { heading: "2. LICENSING", body: "Agent shall maintain all required state licenses and appointments in good standing throughout the business relationship." },
      { heading: "3. E&O INSURANCE", body: "Agent shall maintain Errors and Omissions insurance with minimum coverage of $1,000,000 at all times." },
      { heading: "4. ETHICAL CONDUCT", body: "Agent shall conduct all business activities with honesty, integrity, and in the best interest of clients." },
      { heading: "5. ANTI-MONEY LAUNDERING", body: "Agent shall comply with all AML regulations and report any suspicious activity immediately." },
      { heading: "6. RECORD KEEPING", body: "Agent shall maintain accurate records of all client interactions, applications, and transactions." },
      { heading: "7. REPORTING OBLIGATIONS", body: "Agent shall promptly report any regulatory actions, complaints, or legal proceedings to the Company." },
      { heading: "8. CONSEQUENCES", body: "Violation of this Agreement may result in immediate termination, commission forfeiture, and legal action." },
      { heading: "9. GOVERNING LAW", body: "This Agreement shall be governed by the laws of the State of Illinois." },
    ],
  },
};
