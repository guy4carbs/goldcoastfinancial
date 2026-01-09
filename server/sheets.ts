import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

export async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

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
    const sheets = await getUncachableGoogleSheetClient();
    
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
    const sheets = await getUncachableGoogleSheetClient();
    
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
