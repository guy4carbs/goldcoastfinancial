import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback'
);

// Set credentials if refresh token is available
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

async function getSheetsClient() {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('Google Sheets not configured: GOOGLE_REFRESH_TOKEN is not set. Run the auth script first.');
  }

  // Refresh access token if needed
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

const SPREADSHEET_ID = process.env.LEADS_SPREADSHEET_ID;
const SHEET_NAME = 'Sheet1';

export async function addLeadToSheet(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  coverageType: string;
  coverageAmount: string;
  height: string;
  weight: string;
  birthDate: string;
  medicalBackground: string;
}) {
  if (!SPREADSHEET_ID) {
    console.log('LEADS_SPREADSHEET_ID not set, skipping Google Sheets integration');
    return;
  }

  try {
    const sheets = await getSheetsClient();

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const row = [
      timestamp,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.streetAddress,
      data.addressLine2 || '',
      data.city,
      data.state,
      data.zipCode,
      data.coverageType,
      data.coverageAmount,
      data.height,
      data.weight,
      data.birthDate,
      data.medicalBackground,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:P`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    console.log('Lead added to Google Sheet successfully');
  } catch (error) {
    console.error('Failed to add lead to Google Sheet:', error);
  }
}

export async function initializeSheetHeaders() {
  if (!SPREADSHEET_ID) {
    console.log('LEADS_SPREADSHEET_ID not set, skipping sheet initialization');
    return;
  }

  try {
    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:P1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        'Submission Date',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Street Address',
        'Suite/Apt/PO Box',
        'City',
        'State',
        'Zip Code',
        'Coverage Type',
        'Coverage Amount',
        'Height',
        'Weight',
        'Date of Birth',
        'Medical Background',
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:P1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      });

      console.log('Sheet headers initialized');
    }
  } catch (error) {
    console.error('Failed to initialize sheet headers:', error);
  }
}
