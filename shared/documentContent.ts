/**
 * Shared document content for Heritage Life Solutions onboarding documents.
 * Single source of truth — used by both the frontend DocumentViewer and
 * the backend PDF generation service to ensure identical legal text.
 *
 * Merged from Gold Coast Financial Partners LLC originals + enhanced
 * professional legal language. Enforceable under Illinois law.
 */

export interface DocumentSection {
  heading: string;
  body: string;
}

export interface DocumentDefinition {
  title: string;
  sections: DocumentSection[];
}

export const DOCUMENT_CONTENT: Record<string, DocumentDefinition> = {
  // ===========================================================================
  // NDA — NON-DISCLOSURE, NON-USE, NON-SOLICITATION, AND LEAD PROTECTION
  // ===========================================================================
  nda: {
    title: 'NON-DISCLOSURE, NON-USE, NON-SOLICITATION, AND LEAD PROTECTION AGREEMENT',
    sections: [
      {
        heading: 'PARTIES',
        body: 'This Non-Disclosure, Non-Use, Non-Solicitation, and Lead Protection Agreement ("Agreement") is entered into as of the date of electronic signature below, by and between Heritage Life Solutions, a subsidiary of Gold Coast Financial Group, LLC, an Illinois limited liability company, located at 1240 Iroquois Avenue, Naperville, Illinois ("Company"), and the undersigned individual ("Recipient" or "Agent"). The Company and the Agent are collectively referred to as the "Parties."',
      },
      {
        heading: '1. PURPOSE',
        body: 'The Company may disclose certain confidential and proprietary information to the Recipient solely for the purpose of evaluating, entering into, or performing a business relationship with the Company (the "Permitted Purpose"). This Agreement establishes the terms and conditions under which such information may be disclosed and used.',
      },
      {
        heading: '2. DEFINITION OF CONFIDENTIAL INFORMATION',
        body: '"Confidential Information" includes, but is not limited to: (a) leads, client data, prospect information, and personally identifiable information (PII) of clients and prospects; (b) CRM systems, databases, contact records, and dialer data; (c) proprietary sales processes, scripts, rebuttal systems, training materials, and methodologies; (d) marketing strategies, campaigns, data, and advertising materials; (e) commission structures, compensation plans, override schedules, and financial arrangements; (f) automations, workflows, proprietary technology, and software systems; (g) carrier relationships, product pricing, underwriting guidelines, and carrier-specific agreements; (h) business strategies, operational procedures, product development plans, and internal communications; and (i) any non-public, proprietary, or trade secret information disclosed in any form. All leads are expressly defined as the sole and exclusive property of the Company.',
      },
      {
        heading: '3. NON-USE AND NON-DISCLOSURE',
        body: 'The Recipient agrees that they shall: (a) not disclose, share, sell, transfer, or distribute Confidential Information to any third party without the prior written consent of the Company; (b) not copy, replicate, or store Confidential Information outside of authorized Company systems; (c) not use Confidential Information for any purpose other than the Permitted Purpose; (d) not allow access to Confidential Information by any third party without prior written consent; (e) immediately notify the Company in writing of any unauthorized use, disclosure, or suspected breach of this Agreement; and (f) comply with all applicable data protection laws, including but not limited to the Illinois Personal Information Protection Act (PIPA), the Health Insurance Portability and Accountability Act (HIPAA) where applicable, and any state-specific insurance privacy regulations.',
      },
      {
        heading: '4. LEAD OWNERSHIP AND PROTECTION',
        body: 'All leads provided to, accessed by, or generated through the Company remain the exclusive property of Gold Coast Financial Group, LLC, regardless of the source, method of generation, or the Agent\'s involvement in cultivating such leads. The Agent shall not contact, solicit, service, or transfer any Company lead outside of authorized Company channels. Any unauthorized use, transfer, disclosure, or exploitation of leads shall result in: (a) liquidated damages of one thousand dollars ($1,000) per lead, per violation; and (b) full reimbursement of all legal fees, investigative costs, and enforcement expenses incurred by the Company in connection with such violation.',
      },
      {
        heading: '5. STANDARD OF CARE',
        body: 'The Recipient agrees to protect Confidential Information using the highest commercially reasonable standard of care, no less than the standard used to protect the Recipient\'s own most sensitive confidential and proprietary information.',
      },
      {
        heading: '6. EXCLUSIONS',
        body: 'This Agreement does not apply to information that: (a) was already known to the Recipient prior to disclosure by the Company, as demonstrated by written records predating the disclosure; (b) becomes publicly available through no fault or action of the Recipient; (c) is independently developed by the Recipient without use of or reference to Confidential Information; or (d) is required to be disclosed by law, regulation, or court order, provided that the Recipient gives the Company prompt written notice of such requirement and cooperates with the Company in seeking a protective order or other appropriate remedy.',
      },
      {
        heading: '7. RETURN AND DESTRUCTION OF INFORMATION',
        body: 'Upon termination of the Recipient\'s relationship with the Company, or upon the Company\'s written request: (a) all Confidential Information must be immediately returned or permanently destroyed, including all copies, notes, summaries, extracts, and derivative works, whether in physical or electronic form; (b) the Recipient must provide written certification of such return or destruction within five (5) business days of the request; and (c) this obligation includes, but is not limited to, deleting all electronic files, removing access to Company systems, and returning all physical documents, devices, and equipment.',
      },
      {
        heading: '8. NON-SOLICITATION',
        body: 'The Recipient agrees that during the term of this Agreement and for a period of two (2) years following termination, they shall not, directly or indirectly: (a) solicit, contact, or attempt to solicit any client, prospect, or lead of the Company for the purpose of selling competing insurance products or financial services; (b) solicit, recruit, or attempt to recruit any agent, employee, or contractor of the Company; or (c) interfere with or disrupt any existing business relationship between the Company and its clients, carriers, agents, or business partners.',
      },
      {
        heading: '9. SOCIAL MEDIA, TEACHING, AND DISCLOSURE RESTRICTIONS',
        body: 'The Recipient shall not: (a) post, publish, or share any Company systems, strategies, processes, scripts, training materials, or proprietary information on any social media platform, website, forum, or any other public or private medium; (b) teach, train, coach, or assist any third party in replicating or implementing Company processes, methodologies, or systems; or (c) reference, describe, or disclose Company proprietary methods, tools, or business practices in any public or private setting, whether for compensation or otherwise.',
      },
      {
        heading: '10. ANTI-CIRCUMVENTION',
        body: 'The Recipient agrees not to circumvent the Company by: (a) using third parties, intermediaries, or any business entity to access, exploit, or benefit from Confidential Information; (b) indirectly benefiting from Company data, leads, or proprietary information outside of authorized Company channels; or (c) assisting or enabling any third party in accessing or using Confidential Information in violation of this Agreement.',
      },
      {
        heading: '11. AUDIT RIGHTS',
        body: 'The Company reserves the right to audit, upon reasonable notice, the following systems and records for the purpose of verifying compliance with this Agreement: (a) CRM systems and databases; (b) dialers, call logs, and communication records; (c) financial records and commission statements; (d) email accounts and electronic communications used in connection with Company business; and (e) any other records reasonably related to the Recipient\'s obligations under this Agreement.',
      },
      {
        heading: '12. PERSONAL LIABILITY',
        body: 'The Recipient agrees to be personally liable for all obligations, breaches, and damages under this Agreement, regardless of any business entity, limited liability company, corporate structure, or partnership through which the Recipient may conduct business. This Agreement constitutes a personal obligation of the Recipient and may be enforced against the Recipient individually.',
      },
      {
        heading: '13. LIQUIDATED DAMAGES',
        body: 'The Parties acknowledge that a breach of this Agreement would cause substantial and irreparable harm to the Company, the exact amount of which would be difficult to ascertain. Accordingly, in addition to specific damages outlined in Section 4 (Lead Ownership and Protection): (a) any breach of this Agreement shall result in liquidated damages of twenty-five thousand dollars ($25,000) per violation; and (b) the Recipient shall be liable for all legal fees, enforcement costs, investigative expenses, and actual damages incurred by the Company.',
      },
      {
        heading: '14. REMEDIES',
        body: 'The Company shall be entitled to: (a) immediate injunctive relief, without the necessity of proving actual damages or posting a bond; (b) specific performance and other equitable remedies; (c) monetary damages, including compensatory, consequential, and punitive damages where applicable; (d) recovery of all reasonable attorneys\' fees, court costs, and enforcement expenses; and (e) audit and enforcement rights as described herein. These remedies are cumulative and not exclusive of any other remedies available at law or in equity.',
      },
      {
        heading: '15. EQUITABLE TOLLING',
        body: 'Any time limitations, restrictive periods, or statutes of limitation applicable under this Agreement shall be tolled during any period in which a breach is concealed, undiscovered, or ongoing. The tolling period shall continue until the breach is actually discovered by the Company.',
      },
      {
        heading: '16. SURVIVAL',
        body: 'All obligations relating to Confidential Information, non-disclosure, non-use, non-solicitation, lead protection, and damages shall survive termination of this Agreement and the Recipient\'s engagement with the Company indefinitely. The obligations set forth herein are not limited by any termination, expiration, or release of the Recipient from the Company\'s organization.',
      },
      {
        heading: '17. GOVERNING LAW AND VENUE',
        body: 'This Agreement shall be governed by and construed in accordance with the laws of the State of Illinois, without regard to its conflict of laws provisions. Any legal action arising under or in connection with this Agreement shall be brought exclusively in the state or federal courts located in DuPage County, Illinois, and the Parties hereby consent to the personal jurisdiction of such courts.',
      },
      {
        heading: '18. ENTIRE AGREEMENT',
        body: 'This Agreement constitutes the entire understanding between the Parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, understandings, negotiations, and discussions, whether oral or written. This Agreement may not be modified or amended except by a written instrument signed by both Parties. If any provision of this Agreement is found to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain fully valid and enforceable.',
      },
    ],
  },

  // ===========================================================================
  // DEBT ROLL-UP — PROTECTION AND AUTHORIZATION AGREEMENT
  // ===========================================================================
  debt_rollup: {
    title: 'DEBT ROLL-UP PROTECTION AND AUTHORIZATION AGREEMENT',
    sections: [
      {
        heading: 'PARTIES',
        body: 'This Debt Roll-Up Protection and Authorization Agreement ("Agreement") is entered into as of the date of electronic signature below, by and between Heritage Life Solutions, a subsidiary of Gold Coast Financial Group, LLC ("Company" or "Creditor"), and the undersigned independent contractor agent ("Agent" or "Debtor").',
      },
      {
        heading: '1. PURPOSE',
        body: 'The purpose of this Agreement is to protect the Company from any roll-up debt, chargebacks, commission reversals, or financial liability resulting from policies written, submitted, serviced, or otherwise produced by the Agent while operating under the Company\'s hierarchy, organization, agency, or contracting structure. The Agent acknowledges that the Company may be held financially responsible by insurance carriers for commissions advanced on policies written by the Agent.',
      },
      {
        heading: '2. DEFINITION OF ROLL-UP DEBT',
        body: 'For purposes of this Agreement, "Roll-Up Debt" shall include, but is not limited to: (a) commission chargebacks resulting from policy lapse, cancellation, refund, or rescission; (b) advanced commission reversals; (c) policy replacement chargebacks; (d) carrier-imposed debit balances; (e) negative commission balances; and (f) any debt transferred, assigned, or "rolled up" to the Company as a result of the Agent\'s production. This definition applies regardless of the time the chargeback occurs, including after the Agent\'s termination, transfer, or release from the Company\'s organization.',
      },
      {
        heading: '3. ACKNOWLEDGMENT OF LIABILITY',
        body: 'The Agent expressly agrees and acknowledges that: (a) all roll-up debt resulting from the Agent\'s production is the sole responsibility of the Agent; (b) the Company shall not be financially responsible for any such debt; (c) the Agent agrees to fully reimburse the Company for all roll-up debt incurred as a result of the Agent\'s production; and (d) this obligation applies whether the Agent is active, inactive, terminated, transferred, or released from the Company\'s organization.',
      },
      {
        heading: '4. COMMISSION ADVANCE STRUCTURE',
        body: 'The Company may, at its sole discretion, provide commission advances to the Agent based on submitted and approved insurance applications. Advance rates shall be determined by the Agent\'s contract level, production history, and the carrier\'s advance schedule. Advances are not guaranteed income and are subject to repayment as outlined in this Agreement. The Agent understands that advance commission is an estimate of future earnings and that the actual commission earned may differ from the advance amount.',
      },
      {
        heading: '5. CHARGEBACK POLICY',
        body: 'In the event that a policy placed by the Agent is cancelled, lapsed, or otherwise terminated within the chargeback period specified by the issuing carrier, the Company shall debit the Agent\'s account for the full amount of the commission advance previously paid on such policy. Chargeback periods vary by carrier and product type but typically range from six (6) to twelve (12) months from the policy effective date. The Agent acknowledges and agrees that: (a) chargebacks are a standard industry practice; (b) the Agent is solely responsible for policy persistency and client retention; (c) the Company may offset chargebacks against future commission earnings; (d) outstanding chargeback balances must be repaid in full; and (e) the Agent remains liable for chargebacks that occur after termination on policies placed during the Agent\'s tenure.',
      },
      {
        heading: '6. DEBT ROLL-UP MECHANISM',
        body: 'When an Agent accumulates a negative commission balance due to chargebacks, advances, or other authorized deductions, the Company may implement a "debt roll-up" process whereby: (a) the negative balance is consolidated into a single debt account; (b) future commission earnings are applied first to reduce the outstanding debt before any payment is made to the Agent; (c) the Company may withhold up to seventy-five percent (75%) of gross commission earnings until the debt is fully satisfied; (d) the debt balance is reviewed monthly and a statement is provided to the Agent; and (e) the Agent may request a payment plan for balances exceeding five thousand dollars ($5,000), subject to Company approval.',
      },
      {
        heading: '7. AUTHORIZED DEDUCTIONS',
        body: 'The Agent authorizes the Company to deduct the following from commission earnings, bonuses, overrides, or any other compensation: (a) chargebacks for cancelled or lapsed policies; (b) overpayment of commissions due to calculation errors; (c) costs of training materials, licensing fees, or E&O insurance premiums if previously advanced by the Company; (d) technology and platform fees as outlined in the Agent\'s independent contractor agreement; (e) any amounts owed to the Company under any other agreement between the Parties; and (f) amounts required to be withheld by law or regulation.',
      },
      {
        heading: '8. INDEMNIFICATION',
        body: 'The Agent agrees to indemnify, defend, and hold harmless the Company and any affiliated entities, officers, partners, managers, contractors, or organizations from any financial loss, debt, liability, claim, or expense (including reasonable attorneys\' fees) arising from: (a) the Agent\'s policy production; (b) the Agent\'s conduct with clients or prospective clients; (c) carrier chargebacks related to the Agent\'s production; or (d) any breach of this Agreement by the Agent.',
      },
      {
        heading: '9. NOTICE OF DEBT',
        body: 'If roll-up debt occurs: (a) the Company shall provide written notice to the Agent outlining the amount owed; (b) notice may be delivered by email, certified mail, or written communication to the contact information listed in the Agent\'s onboarding profile; and (c) the Agent shall have fourteen (14) calendar days from the date of notice to repay the balance in full.',
      },
      {
        heading: '10. REPAYMENT TERMS',
        body: 'The Agent agrees that: (a) the full amount owed shall be paid within fourteen (14) calendar days of written notice; or (b) the Parties may agree in writing to a structured repayment plan. Failure to make payment within the required time period or to comply with the terms of any agreed repayment plan shall constitute default under this Agreement.',
      },
      {
        heading: '11. ACCELERATION OF DEBT',
        body: 'Upon default by the Agent, the entire outstanding balance of all roll-up debt, chargebacks, and amounts owed under this Agreement shall become immediately due and payable in full without further notice or demand.',
      },
      {
        heading: '12. INTEREST, COLLECTION COSTS, AND ATTORNEY FEES',
        body: 'Any unpaid balance shall accrue interest at a rate of eight percent (8%) per annum beginning fourteen (14) days after the date of the Company\'s written notice of debt. The Agent agrees to pay all reasonable costs incurred by the Company in enforcing this Agreement, including but not limited to: (a) attorneys\' fees; (b) court costs and filing fees; (c) collection agency fees; and (d) administrative costs associated with debt recovery.',
      },
      {
        heading: '13. RIGHT OF OFFSET',
        body: 'The Company shall have the right to withhold, offset, or deduct any commissions, bonuses, overrides, renewal commissions, or any other compensation owed to the Agent against any roll-up debt balance, chargeback, or amount owed under this Agreement. This right of offset may be exercised without prior notice to the Agent.',
      },
      {
        heading: '14. PERSONAL GUARANTEE',
        body: 'The Agent agrees that all obligations under this Agreement constitute a personal financial obligation of the Agent. The Agent waives any claim that the debt is solely a business obligation and agrees that the Company may pursue personal collection, legal remedies, and enforcement actions against the Agent individually, regardless of any business entity, LLC, or corporate structure through which the Agent may operate.',
      },
      {
        heading: '15. DISPUTE RESOLUTION',
        body: 'The Agent may dispute any chargeback or deduction by submitting a written dispute to the Company within thirty (30) days of the deduction appearing on the Agent\'s commission statement. The Company shall review the dispute and provide a written response within fifteen (15) business days. If the dispute cannot be resolved informally, either Party may seek resolution through binding arbitration in accordance with the rules of the American Arbitration Association, with the arbitration to take place in DuPage County, Illinois.',
      },
      {
        heading: '16. SURVIVAL AFTER TERMINATION',
        body: 'This Agreement shall survive termination, release, transfer, or resignation of the Agent from the Company\'s organization. The Agent\'s obligations under this Agreement shall remain in full force and effect until all potential chargeback periods have expired and all debts have been fully satisfied.',
      },
      {
        heading: '17. GOVERNING LAW AND VENUE',
        body: 'This Agreement shall be governed by the laws of the State of Illinois. Any legal action arising from this Agreement shall be brought exclusively in the state or federal courts located in DuPage County, Illinois, and the Parties hereby consent to the personal jurisdiction of such courts.',
      },
      {
        heading: '18. ENTIRE AGREEMENT',
        body: 'This Agreement constitutes the entire understanding between the Parties regarding roll-up debt liability and supersedes any prior verbal or written agreements on the same subject matter. This Agreement may not be modified except by a written instrument signed by both Parties. If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall remain fully valid and enforceable. The Parties agree that electronic signatures, including signatures executed through the Company\'s onboarding platform, shall be considered legally binding and enforceable.',
      },
    ],
  },

  // ===========================================================================
  // COMPLIANCE — COMPLIANCE AND ETHICAL CONDUCT AGREEMENT
  // ===========================================================================
  compliance: {
    title: 'COMPLIANCE AND ETHICAL CONDUCT AGREEMENT',
    sections: [
      {
        heading: 'PARTIES',
        body: 'This Compliance and Ethical Conduct Agreement ("Agreement") is entered into as of the date of electronic signature below by the undersigned agent ("Agent") in connection with the Agent\'s engagement with Heritage Life Solutions, a subsidiary of Gold Coast Financial Group, LLC ("Company" or "Agency"). The Company requires strict adherence to all applicable laws, carrier guidelines, and ethical standards in order to protect clients, insurance carriers, and the Company.',
      },
      {
        heading: '1. PURPOSE',
        body: 'The purpose of this Agreement is to establish compliance standards, ethical business practices, and regulatory obligations required of the Agent while conducting insurance business through or in association with the Company. The Agent acknowledges that violations of compliance standards may result in harm to consumers, regulatory action against the Company, carrier termination, and personal liability for the Agent.',
      },
      {
        heading: '2. COMPLIANCE WITH LAWS AND REGULATIONS',
        body: 'The Agent agrees to comply with all applicable federal, state, and local laws governing insurance solicitation, sales, and servicing, including but not limited to: (a) state insurance codes and producer regulations in each state in which the Agent is licensed; (b) the rules and regulations of the Illinois Department of Insurance; (c) the National Association of Insurance Commissioners (NAIC) model regulations; (d) carrier underwriting guidelines and compliance requirements; (e) the USA PATRIOT Act and related anti-money laundering (AML) requirements; (f) the Bank Secrecy Act (BSA) and Financial Crimes Enforcement Network (FinCEN) regulations; (g) the Gramm-Leach-Bliley Act (GLBA) privacy provisions; (h) consumer protection laws; (i) replacement regulations; and (j) the Health Insurance Portability and Accountability Act (HIPAA) where applicable. Failure to comply with applicable laws may result in immediate termination and legal action.',
      },
      {
        heading: '3. LICENSING REQUIREMENTS',
        body: 'The Agent represents and warrants that: (a) the Agent holds a valid and current insurance license in each state where the Agent conducts or intends to conduct business; (b) the Agent will maintain all required licenses in good standing throughout the duration of their engagement; (c) the Agent will promptly notify the Company of any license suspension, revocation, restriction, or disciplinary action by any regulatory authority; (d) the Agent will complete all continuing education requirements within the timeframes prescribed by each licensing jurisdiction; (e) the Agent will not sell or solicit any insurance product in any state where the Agent is not properly licensed; and (f) the Agent will promptly report any changes to their licensing status to the Company.',
      },
      {
        heading: '4. PROHIBITION OF FRAUD, MISREPRESENTATION, AND UNETHICAL CONDUCT',
        body: 'The Agent agrees that the following actions are strictly prohibited and shall be considered serious misconduct: (a) forging or falsifying client signatures; (b) submitting applications without the client\'s knowledge or explicit consent; (c) altering application information after client authorization; (d) misrepresenting policy terms, coverage, benefits, or premiums; (e) providing false health, financial, or underwriting information; (f) submitting fraudulent applications; (g) engaging in misleading or deceptive sales practices; (h) engaging in rebating or any other prohibited inducement to purchase insurance; (i) sharing commissions with any unlicensed person; (j) misappropriating client funds or premiums; and (k) using high-pressure sales tactics or taking advantage of vulnerable populations, including the elderly or those with diminished capacity. Any violation of this section may result in immediate termination, regulatory reporting, and personal legal liability.',
      },
      {
        heading: '5. CLIENT CONSENT REQUIREMENT',
        body: 'The Agent must obtain clear and verifiable authorization from the applicant before submitting any insurance application. Acceptable verification methods include: (a) a signed physical application; (b) a verified electronic signature; (c) a recorded phone authorization; or (d) documented written consent. Submitting an application without proper client authorization shall be considered fraudulent conduct and grounds for immediate termination.',
      },
      {
        heading: '6. APPLICATION ACCURACY',
        body: 'The Agent agrees that all applications must be submitted with complete and accurate information. The Agent shall not: (a) guess or fabricate client information; (b) submit incomplete applications knowingly; or (c) hide or omit relevant underwriting information. The Agent is responsible for verifying all information with the client prior to submission and shall document the verification process.',
      },
      {
        heading: '7. CARRIER UNDERWRITING COMPLIANCE',
        body: 'The Agent agrees to comply with all insurance carrier underwriting rules and guidelines. The Agent shall not attempt to: (a) circumvent underwriting guidelines; (b) manipulate application answers to secure approval; or (c) submit policies for clients who do not qualify under carrier rules. Violation of carrier compliance requirements may result in contract termination, carrier reporting, and liability for damages.',
      },
      {
        heading: '8. SUITABILITY AND BEST INTEREST STANDARDS',
        body: 'The Agent acknowledges the obligation to act in the best interest of clients and agrees to: (a) conduct a thorough needs analysis for each client before recommending any insurance product; (b) recommend only products that are suitable for the client\'s financial situation, insurance needs, risk tolerance, and investment objectives; (c) disclose all material information about recommended products, including costs, risks, limitations, and alternatives; (d) document the basis for each recommendation in writing; (e) never engage in churning, twisting, or any other practice designed to generate commissions at the expense of the client\'s interests; (f) comply with all annuity suitability regulations, including the NAIC Suitability in Annuity Transactions Model Regulation; and (g) prioritize the client\'s interests above the Agent\'s own financial interests or the interests of the Company.',
      },
      {
        heading: '9. ANTI-MONEY LAUNDERING (AML) COMPLIANCE',
        body: 'The Agent agrees to: (a) complete the Company\'s AML training program within thirty (30) days of onboarding and annually thereafter; (b) follow all Company procedures for identifying and reporting suspicious activities; (c) verify the identity of all clients and beneficiaries in accordance with the Company\'s Customer Identification Program (CIP); (d) report any suspicious transactions or activities to the Company\'s designated AML Compliance Officer immediately; (e) maintain records of all client identification documents and transaction information as required by law; (f) cooperate fully with any AML audits, examinations, or investigations conducted by the Company or regulatory authorities; (g) avoid accepting suspicious funds or transactions; and (h) never knowingly assist or facilitate money laundering, terrorist financing, or any other financial crime. Failure to comply with AML laws may result in regulatory penalties and criminal prosecution.',
      },
      {
        heading: '10. DATA PROTECTION AND PRIVACY',
        body: 'The Agent agrees to: (a) protect all client personal information and PII in accordance with applicable privacy laws and Company policies; (b) access client information only on a need-to-know basis and only for legitimate business purposes; (c) not store client PII on personal devices unless encrypted and approved by the Company; (d) immediately report any data breach or suspected breach to the Company\'s Privacy Officer; (e) dispose of documents containing PII through secure shredding or electronic deletion; (f) not share login credentials or access to Company systems with any unauthorized person; and (g) comply with all Company information security policies and procedures.',
      },
      {
        heading: '11. DOCUMENTATION AND RECORDKEEPING',
        body: 'The Agent agrees to maintain proper documentation of all client interactions and sales activity. Records shall include, as applicable: (a) client notes and needs analysis documentation; (b) application copies; (c) recorded calls; (d) signed disclosures; (e) replacement forms; and (f) any other documentation required by the Company or applicable regulations. Such documentation may be required for internal audits, carrier reviews, or regulatory investigations and shall be retained for the period required by applicable law.',
      },
      {
        heading: '12. REPORTING OBLIGATIONS',
        body: 'The Agent agrees to promptly report to the Company: (a) any customer complaints, whether written or verbal; (b) any regulatory inquiry, examination, investigation, or enforcement action; (c) any criminal charges, indictments, or convictions; (d) any civil lawsuits related to insurance activities; (e) any errors or omissions in client applications or policy documents; (f) any known or suspected violations of this Agreement by any person; and (g) any changes in personal circumstances that could affect the Agent\'s ability to comply with this Agreement, including bankruptcy, tax liens, or judgments.',
      },
      {
        heading: '13. COOPERATION WITH INVESTIGATIONS',
        body: 'The Agent agrees to fully cooperate with any: (a) internal Company compliance review or audit; (b) insurance carrier audit or inquiry; (c) regulatory investigation or examination; or (d) government inquiry or law enforcement investigation. Failure to cooperate with such investigations may result in immediate termination and further legal action.',
      },
      {
        heading: '14. FINANCIAL LIABILITY FOR NON-COMPLIANT BUSINESS',
        body: 'The Agent agrees to assume full financial responsibility for any losses resulting from the Agent\'s misconduct or non-compliant business practices. Such losses may include but are not limited to: (a) chargebacks; (b) carrier penalties; (c) client refunds; (d) regulatory fines; (e) legal damages; and (f) administrative costs incurred by the Company in addressing the Agent\'s non-compliance.',
      },
      {
        heading: '15. CHARGEBACK LIABILITY FOR MISCONDUCT',
        body: 'The Agent agrees that any chargebacks resulting from: (a) fraudulent activity; (b) policy misrepresentation; (c) unauthorized applications; or (d) unethical sales practices shall be the sole financial responsibility of the Agent. The Company may offset such chargebacks against any compensation owed to the Agent.',
      },
      {
        heading: '16. REPUTATION AND PROFESSIONAL CONDUCT',
        body: 'The Agent agrees to conduct business in a manner that upholds the reputation and integrity of the Company and its carrier partners. The Agent shall not engage in any conduct that may damage the reputation of the Company, affiliated organizations, insurance carriers, or the insurance profession as a whole.',
      },
      {
        heading: '17. IMMEDIATE TERMINATION',
        body: 'The Company reserves the right to immediately terminate the Agent\'s association, without prior notice, for violations including but not limited to: (a) fraud or forgery; (b) misrepresentation to clients, carriers, or regulators; (c) policy manipulation; (d) non-compliant business practices; (e) regulatory violations; (f) failure to cooperate with investigations; or (g) any conduct that poses a material risk to clients, the Company, or its carrier partners.',
      },
      {
        heading: '18. PERSONAL LIABILITY AND INDEMNIFICATION',
        body: 'The Agent acknowledges that violations of this Agreement may result in personal financial liability. The Agent agrees to indemnify, defend, and hold harmless the Company from any damages, losses, fines, penalties, or expenses (including reasonable attorneys\' fees) caused by the Agent\'s misconduct, non-compliance, or breach of this Agreement. Additionally, violations may result in: (a) forfeiture of unpaid commissions and renewal rights; (b) reporting to applicable regulatory authorities and carrier partners; (c) criminal prosecution where applicable; and (d) permanent disqualification from future engagement with the Company and its affiliated entities.',
      },
      {
        heading: '19. ONGOING OBLIGATIONS',
        body: 'The Agent acknowledges that compliance is an ongoing obligation and agrees to: (a) attend all required compliance training sessions; (b) stay current on all regulatory changes affecting their licensed jurisdictions; (c) cooperate fully with Company compliance audits and reviews; (d) maintain accurate and complete records of all sales activities; and (e) review and acknowledge updates to this Agreement as they are issued by the Company.',
      },
      {
        heading: '20. GOVERNING LAW AND VENUE',
        body: 'This Agreement shall be governed by the laws of the State of Illinois. Any legal action arising under this Agreement shall be brought exclusively in the state or federal courts located in DuPage County, Illinois, and the Parties hereby consent to the personal jurisdiction of such courts.',
      },
      {
        heading: '21. ENTIRE AGREEMENT AND ELECTRONIC SIGNATURES',
        body: 'This Agreement constitutes the entire understanding between the Parties regarding compliance and ethical conduct and supersedes any prior verbal or written agreements on the same subject matter. If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall remain fully enforceable. The Parties agree that electronic signatures, including signatures executed through the Company\'s onboarding platform, shall be considered legally binding and enforceable. By signing below, the Agent certifies that they have read, understood, and agree to comply with all provisions of this Agreement, and further acknowledges that this Agreement supplements and does not replace any other agreements, policies, or obligations applicable to the Agent\'s engagement with Heritage Life Solutions.',
      },
    ],
  },
};
