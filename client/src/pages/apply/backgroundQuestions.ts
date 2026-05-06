export const SURELC_QUESTIONS = [
  "Have you ever been charged or convicted of or plead guilty or no contest to any Felony, Misdemeanor, federal/state insurance and/or securities or investments regulations and statutes? Have you ever been on probation?",
  "Have you ever been or are you currently being investigated, have any pending indictments, lawsuits, or have you ever been in a lawsuit with insurance company?",
  "Have you ever been alleged to have engaged in any fraud?",
  "Have you ever been found to have engaged in any fraud?",
  "Has any insurance or financial services company, or broker-dealer terminated your contract or appointment or permitted you to resign for reason other than lack of sales?",
  "Have you ever had an appointment with any insurance company terminated for cause or been denied an appointment?",
  "Does any insurer, insured, or other person claim any commission chargeback or other indebtedness from you as a result of any insurance transactions or business?",
  "Has any lawsuit or claim ever been made against your surety company, or errors and omissions insurer, arising out of your sales or practices, or have you been refused surety bonding or E&O coverage?",
  "Have you ever had an insurance or securities license denied, suspended, cancelled or revoked?",
  "Has any state or federal regulatory body found you to have been a cause of an investment OR insurance-related business having its authorization to do business denied, suspended, revoked, or restricted?",
  "Has any state or federal regulatory agency revoked or suspended your license as an attorney, accountant, or federal contractor?",
  "Has any state or federal regulatory agency found you to have made a false statement or omission or been dishonest, unfair, or unethical?",
  "Have you ever had any interruptions in licensing?",
  "Has any state, federal or self-regulatory agency filed a complaint against you, fined, sanctioned, censured, penalized or otherwise disciplined you for a violation of their regulations or state or federal statutes? Have you ever been the subject of a consumer initiated complaint?",
  "Has personally or any insurance or securities brokerage firm with whom you have been associated filed a bankruptcy petition or declared bankruptcy?",
  "Have you ever had any judgments, garnishments, or liens against you?",
  "Are you connected in any way with a bank, savings & loan association, or other lending or financial institution?",
  "Have you ever used any other names or aliases?",
  "Do you have any unresolved matters pending with the Internal Revenue Service or other taxing authority?",
];

export interface BackgroundAnswer {
  questionIndex: number;
  answer: "Yes" | "No";
  details: string;
}
