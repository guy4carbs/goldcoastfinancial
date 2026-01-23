// Google Sheets integration via SheetDB
// Get your API URL from https://sheetdb.io after connecting your Google Sheet

const SHEETDB_API_URL = import.meta.env.VITE_SHEETDB_API_URL || '';

export interface QuoteSubmission {
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number | null;
  gender: string;
  smoker: boolean | null;

  // Address
  street: string;
  city: string;
  state: string;
  zipCode: string;

  // Discovery answers
  primaryGoals: string[];
  familySituation: string;
  financialPriority: string;
  coverageDuration: string;
  healthStatus: string;
  monthlyBudget: string;
  cashValueImportance: string;
  existingCoverage: string;

  // Recommendation
  productType: string;
  productName: string;
  coverageAmount: number;
  termLength: string;
  monthlyRate: number;
  annualRate: number;

  // Beneficiaries (as JSON string)
  beneficiaries: string;

  // Health answers (as JSON string)
  healthAnswers: string;

  // Metadata
  submittedAt: string;
  applicationId: string;
}

export async function submitQuoteToGoogleSheets(data: QuoteSubmission): Promise<{ success: boolean; applicationId: string; error?: string }> {
  // Generate application ID
  const applicationId = `HLS-${Date.now()}`;
  const submittedAt = new Date().toISOString();

  // If no API URL is configured, return success with just the ID (for testing)
  if (!SHEETDB_API_URL) {
    console.warn('SheetDB API URL not configured. Submission simulated.');
    return { success: true, applicationId };
  }

  try {
    // SheetDB expects data in a specific format with column names matching your sheet headers
    // Combined columns for a leaner spreadsheet
    const sheetData = {
      data: [{
        'Application ID': applicationId,
        'Submitted': submittedAt,
        'Name': `${data.firstName} ${data.lastName}`,
        'Contact': `${data.email} | ${data.phone}`,
        'DOB': data.dateOfBirth,
        'Age': data.age?.toString() || '',
        'Location': `${data.city}, ${data.state} ${data.zipCode}`,
        'Profile': `${data.gender}, Smoker: ${data.smoker ? 'Yes' : 'No'}`,
        'Goals': data.primaryGoals.join(', '),
        'Situation': `Family: ${data.familySituation} | Budget: ${data.monthlyBudget} | Existing: ${data.existingCoverage}`,
        'Product': `${data.productName} (${data.termLength})`,
        'Quote': `$${data.coverageAmount.toLocaleString()} coverage | $${data.monthlyRate}/mo`,
        'Beneficiary': data.beneficiaries,
        'Source': 'Website',
      }]
    };

    const response = await fetch(SHEETDB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sheetData),
    });

    if (!response.ok) {
      throw new Error(`SheetDB error: ${response.status}`);
    }

    return { success: true, applicationId };
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return {
      success: false,
      applicationId,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
