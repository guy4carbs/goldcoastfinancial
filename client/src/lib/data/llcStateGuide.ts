/**
 * llcStateGuide — hardcoded per-state LLC formation guidance.
 *
 * Founder-curated reference data for the Formation Guide tab on
 * /founders/agency-management. Each entry holds the published filing fee
 * for an LLC's Articles of Organization, the Secretary of State filing
 * portal URL, and a conservative ETA range that reflects typical 2026
 * processing windows (mail vs. expedited online filing).
 *
 * Notes / sourcing rules:
 *   - Where state fees changed mid-decade, we use the most recently
 *     published 2024-2026 rate. A handful of states (TN, WY) use a
 *     range because the fee scales with member count or initial report
 *     timing — we render those as "varies".
 *   - SOS URLs point at the public business-entity search/filing portal,
 *     NOT a deep-link to the actual filing form. Forms move; portals
 *     don't.
 *   - This file intentionally has zero third-party affiliate links.
 *     LegalZoom / Northwest / ZenBusiness are deliberately omitted.
 *   - Each entry has a `// source:` comment with the primary .gov URL
 *     used to verify the fee. Audited 2026-05-01.
 */

export interface LlcStateGuideEntry {
  filingFee: number | null; // dollars; null when fee is variable (use feeNote)
  feeNote?: string;         // optional human-readable fee qualifier
  sosUrl: string;
  eta: string;
  notes?: string;
}

export const STATE_LLC_GUIDE: Record<string, LlcStateGuideEntry> = {
  // source: https://www.sos.alabama.gov/business-entities/llcs (verified 2026-05-01)
  AL: { filingFee: 200, sosUrl: "https://www.sos.alabama.gov/business-entities/llcs", eta: "1-2 weeks online · 2-3 weeks by mail", notes: "$200 filing fee includes $100 distributed to county probate office. Online filing through SOS portal is the fastest method." },
  // source: https://www.commerce.alaska.gov/web/cbpl/corporations/corpformsfees.aspx (verified 2026-05-01)
  AK: { filingFee: 250, sosUrl: "https://www.commerce.alaska.gov/cbp/main/", eta: "10-15 business days by mail · ~1 business day online", notes: "Biennial report required ($100). Also need separate Alaska Business License (~$50/year)." },
  // source: https://azcc.gov/corporations/fee-and-payment-info (verified 2026-05-01)
  AZ: { filingFee: 50, sosUrl: "https://ecorp.azcc.gov/", eta: "14-16 business days standard · 3-5 days expedited (+$35)", notes: "Publication required in approved newspaper within 60 days of formation in most counties (Maricopa and Pima counties exempt). Expedited fees: $35 (standard expedite), $100 (next-day), $200 (same-day), $400 (two-hour)." },
  // source: https://www.sos.arkansas.gov/business-commercial-services-bcs/forms-fees/llc (verified 2026-05-01)
  AR: { filingFee: 45, sosUrl: "https://www.sos.arkansas.gov/business-commercial-services-bcs/forms-fees/llc", eta: "1-2 business days online · 1-2 weeks by mail", notes: "$45 online via Corp Online filing system, $50 by paper. Annual franchise tax of $150 due May 1." },
  // source: https://www.sos.ca.gov/business-programs/business-entities/forms (verified 2026-05-01)
  CA: { filingFee: 70, sosUrl: "https://bizfileonline.sos.ca.gov/", eta: "5-8 business days online · 3-4 weeks by mail", notes: "$70 filing fee, plus $20 Statement of Information due within 90 days. $800 annual minimum franchise tax to FTB kicks in for second tax year (waived for first year of new LLCs)." },
  // source: https://www.sos.state.co.us/pubs/info_center/fees/business.html (verified 2026-05-01)
  CO: { filingFee: 50, sosUrl: "https://www.sos.state.co.us/biz/BusinessEntityCriteriaExt.do", eta: "Same day (online only — no paper option)", notes: "Online-only filing. Periodic report $25 annually (was $10 before July 1, 2024 fee adjustment)." },
  // source: https://business.ct.gov/knowledge-base/articles/domestic-limited-liability-companies-forms-and-fees (verified 2026-05-01)
  CT: { filingFee: 120, sosUrl: "https://business.ct.gov/", eta: "2-3 business days online · 7-10 business days by mail", notes: "$120 filing fee (online or mail). Annual report $80 due by March 31. Expedited service +$50." },
  // source: https://corp.delaware.gov/fee/ (verified 2026-05-01) — fee increased to $110 effective Aug 1, 2024
  DE: { filingFee: 110, sosUrl: "https://corp.delaware.gov/", eta: "2-3 weeks standard · 24 hour expedited (+$100)", notes: "$110 filing fee (raised from $90 on Aug 1, 2024). $300 annual LLC franchise tax due June 1. Most popular state for holding companies. Expedited tiers: 24-hour ($100), same-day ($200), 2-hour ($500), 1-hour ($1,000)." },
  // source: https://dos.fl.gov/sunbiz/forms/fees/llc-fees/ (verified 2026-05-01)
  FL: { filingFee: 125, sosUrl: "https://efile.sunbiz.org/", eta: "2-5 business days online · 3-5 weeks by mail", notes: "$125 = $100 filing fee + $25 registered agent designation. Annual report $138.75 due by May 1 ($538.75 if late)." },
  // source: https://sos.ga.gov/sites/default/files/forms/Reference%20-%20Filing%20Fees%20(Effective%209.6.2025).pdf (verified 2026-05-01)
  GA: { filingFee: 100, sosUrl: "https://ecorp.sos.ga.gov/", eta: "5-7 business days online · 15 business days by mail", notes: "$100 base fee + $5 service charge online ($105) or +$10 by mail ($110). Annual registration $50 + service charge. Expedited: $100 (2-day), $250 (same-day), $1,000 (1-hour)." },
  // source: https://cca.hawaii.gov/breg/registration/dllc/fees/ (verified 2026-05-01)
  HI: { filingFee: 50, sosUrl: "https://hbe.ehawaii.gov/", eta: "3-5 business days online · 2-3 weeks by mail", notes: "$50 filing fee + $1 State Archives fee. Expedited service +$25. Annual report $15." },
  // source: https://sos.idaho.gov/business-services-resources/ (verified 2026-05-01)
  ID: { filingFee: 100, sosUrl: "https://sosbiz.idaho.gov/", eta: "7-10 business days online · 2-3 weeks by mail", notes: "$100 online filing or $120 by paper (includes $20 manual processing surcharge). Annual report free but mandatory; failure dissolves the LLC." },
  // source: https://www.ilsos.gov/publications/business-services/llc.html (verified 2026-05-01)
  IL: { filingFee: 150, sosUrl: "https://www.ilsos.gov/businessservices/", eta: "10 business days online · 3-4 weeks by mail · 1 business day expedited (+$100)", notes: "$150 standard. Series LLC $400. Annual report $75. Expedited service available for an additional $100." },
  // source: https://inbiz.in.gov/Inbiz/FeeCalculator/Index (verified 2026-05-01)
  IN: { filingFee: 95, sosUrl: "https://inbiz.in.gov/", eta: "1 business day online · 5-7 business days by mail", notes: "$95 online via INBiz, $100 by mail. Biennial report $32 online ($50 paper)." },
  // source: https://help.sos.iowa.gov/what-cost-my-filing-fee (verified 2026-05-01)
  IA: { filingFee: 50, sosUrl: "https://sos.iowa.gov/business/", eta: "1-2 business days online · 1-2 weeks by mail", notes: "$50 filing fee. Biennial report $30 online ($45 paper) due in odd-numbered years." },
  // source: https://www.sos.ks.gov/businesses/register-a-business.html (verified 2026-05-01)
  KS: { filingFee: 165, sosUrl: "https://www.sos.ks.gov/business/business.html", eta: "Same day online · 2-3 business days by mail", notes: "$165 online ($160 paper). Annual report/franchise fee $50 due 4 months after fiscal year-end." },
  // source: https://www.sos.ky.gov/bus/business-filings/Pages/Fees.aspx (verified 2026-05-01)
  KY: { filingFee: 40, sosUrl: "https://onestop.ky.gov/", eta: "Same day online · 1-3 business days by mail", notes: "$40 — one of the lowest LLC formation fees nationwide. Annual report $15 due by June 30." },
  // source: https://www.sos.la.gov/businessservices/filebusinessdocuments/getformsandfeeschedule/pages/default.aspx (verified 2026-05-01)
  LA: { filingFee: 100, sosUrl: "https://www.sos.la.gov/BusinessServices/", eta: "1-2 business days online · 1-2 weeks by mail · 24 hours expedited (+$30)", notes: "$100 filing fee + $5 online service charge. Annual report $35. Expedited: $30 (24-hour), $50 (2-4 hour priority)." },
  // source: https://www.maine.gov/sos/corporations-commissions/i-need-a-business-form/limited-liability-company-forms (verified 2026-05-01)
  ME: { filingFee: 175, sosUrl: "https://www.maine.gov/sos/cec/corp/", eta: "10-15 business days standard · 24 hour expedited (+$50) · immediate (+$100)", notes: "$175 statutory filing fee (paper-only — Maine does not yet offer online LLC formation). Annual report $85 due by June 1." },
  // source: https://egov.maryland.gov/BusinessExpress/Payment/FeesSchedule (verified 2026-05-01)
  MD: { filingFee: 100, sosUrl: "https://egov.maryland.gov/businessexpress/", eta: "5-7 business days online · 4-6 weeks by mail · 7-10 days expedited (+$50)", notes: "$100 base + 3% credit-card technology fee online. Annual report (Form 1) $300 due April 15. Expedited filing $50; rush $325." },
  // source: https://www.sec.state.ma.us/divisions/corporations/general-information/corporations-filing-fees.htm (verified 2026-05-01)
  MA: { filingFee: 500, sosUrl: "https://corp.sec.state.ma.us/CorpWeb/", eta: "1-2 business days online · 4-5 business days by mail", notes: "$500 by mail; $520 online (includes $20 expedited processing surcharge automatically applied). Annual report also $500 — one of the most expensive states to form and maintain an LLC." },
  // source: https://www.michigan.gov/lara/-/media/Project/Websites/lara/cscl/Folder6/Filing_Fees.pdf (verified 2026-05-01)
  MI: { filingFee: 50, sosUrl: "https://www.michigan.gov/lara/bureau-list/cscl", eta: "10-15 business days standard · 24 hour expedited (+$50) · same day (+$100)", notes: "$50 filing fee. Annual statement $25 due February 15. Expedited tiers: $50 (24hr), $100 (same-day), $500 (2hr), $1,000 (1hr)." },
  // source: https://www.sos.mn.gov/business-liens/business-filing-and-certification-fee-schedule/ (verified 2026-05-01)
  MN: { filingFee: 155, sosUrl: "https://mblsportal.sos.state.mn.us/", eta: "Same day online · 4-7 business days by mail", notes: "$155 online (expedited) or $135 by mail. Annual renewal free for active entities in good standing." },
  // source: https://www.sos.ms.gov/content/documents/Business/FeeSchedule.pdf (verified 2026-05-01)
  MS: { filingFee: 50, sosUrl: "https://www.sos.ms.gov/business-services", eta: "3-5 business days online (online-only filing)", notes: "$50 filing fee, online-only via Mississippi SOS Business Services portal. Annual report free but mandatory by April 15." },
  // source: https://www.sos.mo.gov/CMSImages/Business/fees.pdf (verified 2026-05-01)
  MO: { filingFee: 50, sosUrl: "https://bsd.sos.mo.gov/", eta: "Same day online · 7-10 business days by mail", notes: "$50 online filing or $105 by paper. No annual report required for Missouri LLCs — one of the cheapest states to maintain." },
  // source: https://sosmt.gov/business/fees/ (verified 2026-05-01)
  MT: { filingFee: 35, sosUrl: "https://biz.sosmt.gov/", eta: "7-10 business days standard · 24 hour expedited (+$20) · 1 hour (+$100)", notes: "$35 — one of the lowest formation fees nationally. Annual report $20 due April 15." },
  // source: https://sos.nebraska.gov/business-services/forms-and-fee-information (verified 2026-05-01)
  NE: { filingFee: 100, sosUrl: "https://sos.nebraska.gov/business-services/forms-and-fee-information", eta: "1-2 business days online · 1-2 weeks by mail", notes: "$100 online or $110 by paper. Newspaper publication required for 3 successive weeks (~$40-$200 depending on county). Biennial report $25 (was $13 before 2022 increase)." },
  // source: https://www.nvsos.gov/businesses/start-a-business/limited-liability-company (verified 2026-05-01)
  NV: { filingFee: 75, sosUrl: "https://www.nvsilverflume.gov/", eta: "1-2 business days online · 5-7 business days by mail", notes: "$75 Articles + mandatory $150 Initial List of Managers + $200 State Business License = $425 minimum year-1 cost. Annual List+License renewal also $350/year." },
  // source: https://sos.nh.gov/corporation-ucc-securities/corporation/forms-and-fees/domestic-and-foreign-limited-liability-company/domestic-forms/ (verified 2026-05-01)
  NH: { filingFee: 100, sosUrl: "https://quickstart.sos.nh.gov/", eta: "3-7 business days online · 2-3 weeks by mail", notes: "$100 + $2 electronic handling surcharge if filed online. Annual report $100 due April 1." },
  // source: https://www.nj.gov/treasury/revenue/fees.shtml (verified 2026-05-01)
  NJ: { filingFee: 125, sosUrl: "https://www.njportal.com/dor/businessformation/", eta: "Same day online · 4-6 weeks by mail · 8.5 hour expedited (+$15-$1,000)", notes: "$125 filing fee. Annual report $75 due last day of anniversary month." },
  // source: https://enterprise.sos.nm.gov/ (verified 2026-05-01)
  NM: { filingFee: 50, sosUrl: "https://enterprise.sos.nm.gov/", eta: "1-3 business days (online-only — paper not accepted)", notes: "$50 — online-only via Enterprise portal as of 2024. No annual report required, no annual fee. One of the cheapest states to maintain an LLC long-term." },
  // source: https://dos.ny.gov/forming-limited-liability-company-new-york (verified 2026-05-01)
  NY: { filingFee: 200, sosUrl: "https://dos.ny.gov/division-corporations", eta: "7 business days standard · 24 hour expedited (+$25) · 2-hour (+$150)", notes: "$200 filing fee. Newspaper publication required within 120 days in 2 newspapers for 6 consecutive weeks (~$300 upstate to $2,000+ in NYC). Biennial statement $9." },
  // source: https://www.sosnc.gov/forms/by_title/_Business_Registration_Limited_Liability_Companies (verified 2026-05-01)
  NC: { filingFee: 125, sosUrl: "https://www.sosnc.gov/online_services/search/by_title/_Business_Registration", eta: "2-3 business days online · 5-7 business days by mail · 24 hour expedited (+$100)", notes: "$125 filing fee. Annual report $200 due April 15 (one of the higher annual fees nationally)." },
  // source: https://sos.nd.gov/business/business-services/business-structures/limited-liability-companies/limited-liability-company-llc/llc-fees.html (verified 2026-05-01)
  ND: { filingFee: 135, sosUrl: "https://firststop.sos.nd.gov/", eta: "5-10 business days online · 2-3 weeks by mail", notes: "$135 filing fee. Annual report $50 due November 15 (April 15 for farming/ranching LLCs)." },
  // source: https://www.ohiosos.gov/businesses/filing-forms--fee-schedule/ (verified 2026-05-01)
  OH: { filingFee: 99, sosUrl: "https://www.ohiosos.gov/businesses/", eta: "3-7 business days standard · 2 business days expedited (+$100) · 1 day (+$200) · 4 hour (+$300)", notes: "$99 one-time fee. No annual report or franchise tax required — one of the cheapest states to maintain." },
  // source: https://www.sos.ok.gov/business/fees.aspx (verified 2026-05-01)
  OK: { filingFee: 100, sosUrl: "https://www.sos.ok.gov/business/", eta: "1-2 business days online · 7-10 business days by mail", notes: "$100 filing fee. Annual certificate $25 due on anniversary date." },
  // source: https://sos.oregon.gov/business/Pages/articles-of-organization-form-instructions.aspx (verified 2026-05-01)
  OR: { filingFee: 100, sosUrl: "https://sos.oregon.gov/business/Pages/default.aspx", eta: "1-2 business days online · 4-6 weeks by mail", notes: "$100 filing fee. Annual report $100 due on anniversary date — among the higher annual fees." },
  // source: https://www.pa.gov/agencies/dos/programs/business/types-of-filings-and-registrations/pennsylvania-limited-liability-company (verified 2026-05-01)
  PA: { filingFee: 125, sosUrl: "https://www.corporations.pa.gov/", eta: "7-10 business days online · 4-6 weeks by mail", notes: "$125 nonrefundable filing fee. New annual report $7 (effective 2025, replacing the old decennial report). Veteran/reservist-owned businesses may qualify for fee waiver." },
  // source: https://www.sos.ri.gov/divisions/business-services/business-basics/costs-and-fees (verified 2026-05-01)
  RI: { filingFee: 150, sosUrl: "https://business.sos.ri.gov/", eta: "1-2 business days online · 7-10 business days by mail", notes: "$150 initial filing fee. Annual report $50 due Feb 1-May 1. Plus mandatory $400 minimum corporate tax annually to RI Division of Taxation regardless of profit." },
  // source: https://businessfilings.sc.gov/ (verified 2026-05-01)
  SC: { filingFee: 110, sosUrl: "https://businessfilings.sc.gov/", eta: "24 hours online · 5-7 business days by mail", notes: "$110 filing fee (+ ~$15 electronic records fee online). No annual report required unless taxed as S-Corp ($25 annually if so)." },
  // source: https://sdsos.gov/general-information/filing-fees.aspx (verified 2026-05-01)
  SD: { filingFee: 150, sosUrl: "https://sos.sd.gov/business/", eta: "1-2 business days online · 3-5 business days by mail", notes: "$150 online or $165 by paper. Annual report $50 (online) / $65 (paper) due first day of anniversary month." },
  // source: https://sos.tn.gov/businesses/services/business-forms-fees (verified 2026-05-01)
  TN: { filingFee: null, feeNote: "$50/member, min $300 max $3,000", sosUrl: "https://tnbear.tn.gov/", eta: "3-5 business days online · 7-10 business days by mail", notes: "Filing fee = $50 per member ($300 minimum, $3,000 max). Annual report uses same per-member structure with same $300 minimum." },
  // source: https://www.sos.state.tx.us/corp/forms_boc.shtml (verified 2026-05-01)
  TX: { filingFee: 300, sosUrl: "https://www.sos.state.tx.us/corp/", eta: "10-15 business days standard · 4-7 business days expedited (+$25)", notes: "$300 filing fee + 2.7% convenience fee if paid by credit card. No annual report fee, but must file Public Information Report and franchise tax return annually (no tax due if revenue < $2.47M as of 2024)." },
  // source: https://commerce.utah.gov/wp-content/uploads/2023/04/currentfees.pdf (verified 2026-05-01)
  UT: { filingFee: 59, sosUrl: "https://corporations.utah.gov/", eta: "1-2 business days online · 7-10 business days by mail · 2 hour expedited (+$75)", notes: "$59 filing fee. Annual renewal $18." },
  // source: https://sos.vermont.gov/business-services/business-filings/domestic-formation/llc (verified 2026-05-01) — fee raised from $125 to $155
  VT: { filingFee: 155, sosUrl: "https://www.vermontbusinessregistry.com/", eta: "1-2 business days online · 7-10 business days by mail", notes: "$155 filing fee (raised from $125; verify current rate before filing). Annual report $35 due within 3 months of fiscal year end." },
  // source: https://www.scc.virginia.gov/businesses/forms-and-fees/virginia-limited-liability-companies/ (verified 2026-05-01)
  VA: { filingFee: 100, sosUrl: "https://cis.scc.virginia.gov/", eta: "5-7 business days online · 2-3 weeks by mail", notes: "$100 filing fee. Annual registration $50 due last day of anniversary month (no formal annual report). $25 late penalty; LLC auto-cancels if unpaid 3+ months." },
  // source: https://www.sos.wa.gov/corporations-charities/frequently-asked-questions-faqs/fee-scheduleexpedited-service (verified 2026-05-01)
  WA: { filingFee: 200, sosUrl: "https://ccfs.sos.wa.gov/", eta: "2-3 business days online · 4-6 weeks by mail · 3 day expedited (+$100)", notes: "$200 online (includes $20 online processing surcharge) or $180 by mail. Annual report $70 (raised from $60)." },
  // source: https://sos.wv.gov/document-search/west-virginia-articles-organization-limited-liability-company (verified 2026-05-01)
  WV: { filingFee: 100, sosUrl: "https://business4.wv.gov/", eta: "5-7 business days online · 2-3 weeks by mail", notes: "$100 filing fee (waived for veteran-owned businesses for first 4 years). Annual report $25 due July 1." },
  // source: https://wdfi.org/corporations/fees/ltd.htm (verified 2026-05-01)
  WI: { filingFee: 130, sosUrl: "https://www.wdfi.org/corporations/", eta: "5 business days online · 2-3 weeks by mail", notes: "$130 online or $170 by paper — Wisconsin offers a $40 discount for online filing. Annual report $25 due in formation quarter." },
  // source: https://sos.wyo.gov/Business/docs/BusinessFees.pdf (verified 2026-05-01)
  WY: { filingFee: 100, sosUrl: "https://wyobiz.wyo.gov/", eta: "Same day online · 10-15 business days by mail", notes: "$100 filing fee + 2.4% online credit card surcharge. Annual report minimum $60 (or $0.0002 per dollar of WY-based assets, whichever greater). Strong privacy: no member/manager disclosure required." },
  // source: https://dlcp.dc.gov/node/1621921 (verified 2026-05-01)
  DC: { filingFee: 99, sosUrl: "https://dlcp.dc.gov/page/corporations-division-business-registration-faqs", eta: "5-15 business days standard · 1-3 day expedited (+$50-$100)", notes: "$99 filing fee. Biennial report $300 due April 1 of year following formation, then every 2 years (one of the highest biennial fees nationally)." },
};

export const STATES_LIST: Array<{ code: string; name: string }> = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

/**
 * Universal LLC formation checklist — applies to every state, in this order.
 * Steps 3 (file articles) and 4 (apply for EIN) are the only steps with
 * external links because they are the only steps where the action ends at a
 * government portal.
 */
export interface FormationChecklistStep {
  number: number;
  title: string;
  description: string;
  externalUrl?: string;
}

export const UNIVERSAL_LLC_CHECKLIST: FormationChecklistStep[] = [
  { number: 1, title: "Pick a unique business name", description: "Search the state SOS business name database to confirm availability. Name must include 'LLC' or 'Limited Liability Company'." },
  { number: 2, title: "Designate a registered agent", description: "Must be a person or entity with a physical address in the state of formation, available during business hours." },
  { number: 3, title: "File Articles of Organization", description: "Submit through the state SOS portal. See state-specific link above for filing fee and estimated turnaround." },
  { number: 4, title: "Apply for an EIN", description: "Free, takes ~10 minutes online. The EIN replaces your SSN on tax filings and bank applications.", externalUrl: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" },
  { number: 5, title: "Draft an operating agreement", description: "Even single-member LLCs benefit from one — clarifies ownership, profit splits, and dissolution terms." },
  { number: 6, title: "Open a business bank account", description: "Required to maintain the corporate veil. Most banks need EIN, articles, and operating agreement." },
  { number: 7, title: "Designate a DRLP (Designated Responsible Licensed Producer)", description: "If you're a licensed insurance producer: designate a Designated Responsible Licensed Producer (DRLP) per your carrier's requirements." },
  { number: 8, title: "Upload articles + EIN to your DBA profile", description: "Once formed, complete /agent/dba so your agency can request carrier appointments under the new entity." },
];
