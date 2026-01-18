import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// Test data
const contactFormData = {
  firstName: 'John',
  lastName: 'TestUser',
  email: 'john.testuser@example.com',
  phone: '6305551234',
  message: 'This is an automated test message from Playwright. Please ignore this submission.',
};

const quoteFormData = {
  // Step 1
  coverageType: 'term',
  coverageAmount: '250000',
  // Step 2
  firstName: 'Jane',
  lastName: 'TestQuote',
  email: 'jane.testquote@example.com',
  phone: '6305559876',
  // Step 3
  streetAddress: '123 Test Street',
  addressLine2: 'Suite 100',
  city: 'Naperville',
  state: 'Illinois',
  zipCode: '60563',
  // Step 4
  heightFeet: '5',
  heightInches: '8',
  weight: '165',
  birthDate: '1985-06-15',
  medicalBackground: 'No major medical conditions. This is an automated test submission from Playwright.',
};

// Helper function to select from a scrollable dropdown
async function selectFromDropdown(page: any, triggerSelector: string, optionText: string) {
  await page.click(triggerSelector);
  await page.waitForTimeout(300); // Wait for dropdown animation

  // Find and click the option, scrolling if necessary
  const option = page.locator(`[role="option"]`).filter({ hasText: optionText }).first();
  await option.scrollIntoViewIfNeeded();
  await option.click();
}

test.describe('Contact Form', () => {
  test('should successfully submit the contact form', async ({ page }) => {
    // Navigate to contact page
    await page.goto(`${BASE_URL}/contact`);

    // Wait for the form to be visible
    await expect(page.locator('text=Send us a Message')).toBeVisible();

    // Fill out the form
    await page.fill('input[name="firstName"]', contactFormData.firstName);
    await page.fill('input[name="lastName"]', contactFormData.lastName);
    await page.fill('input[name="email"]', contactFormData.email);
    await page.fill('input[name="phone"]', contactFormData.phone);
    await page.fill('textarea[name="message"]', contactFormData.message);

    // Submit the form
    await page.click('button[type="submit"]:has-text("Send Message")');

    // Wait for success message
    await expect(page.locator('text=Thank You!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Your message has been sent')).toBeVisible();

    console.log('✅ Contact form submitted successfully!');
  });
});

test.describe('Quote Form', () => {
  test('should successfully complete all steps and submit quote request', async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(60000);

    // Navigate to quote page
    await page.goto(`${BASE_URL}/get-quote`);

    // Wait for the form to load
    await expect(page.locator('text=Get Your Free Quote')).toBeVisible();

    // ============ STEP 1: Coverage Type & Amount ============
    console.log('📝 Step 1: Selecting coverage type and amount...');

    // Select coverage type (click the label containing "Mortgage Protection")
    await page.click('label:has-text("Mortgage Protection")');
    await page.waitForTimeout(200);

    // Select coverage amount
    await selectFromDropdown(page, '[data-testid="select-coverage-amount"]', '$250,000');

    // Continue to step 2
    await page.click('[data-testid="button-continue-step1"]');
    await page.waitForTimeout(500);

    // ============ STEP 2: Contact Information ============
    console.log('📝 Step 2: Filling contact information...');

    await expect(page.locator('text=Your Contact Information')).toBeVisible();

    await page.fill('[data-testid="input-first-name"]', quoteFormData.firstName);
    await page.fill('[data-testid="input-last-name"]', quoteFormData.lastName);
    await page.fill('[data-testid="input-email"]', quoteFormData.email);
    await page.fill('[data-testid="input-phone"]', quoteFormData.phone);

    // Continue to step 3
    await page.click('[data-testid="button-continue-step2"]');
    await page.waitForTimeout(500);

    // ============ STEP 3: Address ============
    console.log('📝 Step 3: Filling address information...');

    await expect(page.locator('text=Your Address')).toBeVisible();

    await page.fill('[data-testid="input-street-address"]', quoteFormData.streetAddress);
    await page.fill('[data-testid="input-address-line2"]', quoteFormData.addressLine2);
    await page.fill('[data-testid="input-city"]', quoteFormData.city);

    // Select state using keyboard to scroll and select
    await page.click('[data-testid="select-state"]');
    await page.waitForTimeout(300);
    // Type to filter/search for Illinois
    await page.keyboard.type('Ill');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.fill('[data-testid="input-zip-code"]', quoteFormData.zipCode);

    // Continue to step 4
    await page.click('[data-testid="button-continue-step3"]');
    await page.waitForTimeout(500);

    // ============ STEP 4: Health Information ============
    console.log('📝 Step 4: Filling health information...');

    await expect(page.locator('text=Health Information')).toBeVisible();

    // Select height feet
    await selectFromDropdown(page, '[data-testid="select-height-feet"]', '5 ft');

    // Select height inches
    await selectFromDropdown(page, '[data-testid="select-height-inches"]', '8 in');

    await page.fill('[data-testid="input-weight"]', quoteFormData.weight);
    await page.fill('[data-testid="input-birth-date"]', quoteFormData.birthDate);
    await page.fill('[data-testid="textarea-medical-background"]', quoteFormData.medicalBackground);

    // Submit the form
    await page.click('[data-testid="button-submit-quote"]');

    // Wait for success message
    await expect(page.locator('text=Thank You!')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Your quote request has been received')).toBeVisible();

    console.log('✅ Quote form submitted successfully!');
  });
});

test.describe('Both Forms - Full Test Suite', () => {
  test('should submit both forms in sequence', async ({ page }) => {
    test.setTimeout(90000);

    // Test Contact Form
    console.log('\n🔵 Testing Contact Form...\n');

    await page.goto(`${BASE_URL}/contact`);
    await expect(page.locator('text=Send us a Message')).toBeVisible();

    await page.fill('input[name="firstName"]', contactFormData.firstName);
    await page.fill('input[name="lastName"]', contactFormData.lastName);
    await page.fill('input[name="email"]', contactFormData.email);
    await page.fill('input[name="phone"]', contactFormData.phone);
    await page.fill('textarea[name="message"]', contactFormData.message);

    await page.click('button[type="submit"]:has-text("Send Message")');
    await expect(page.locator('text=Thank You!')).toBeVisible({ timeout: 10000 });

    console.log('✅ Contact form: PASSED\n');

    // Test Quote Form
    console.log('🔵 Testing Quote Form...\n');

    await page.goto(`${BASE_URL}/get-quote`);
    await expect(page.locator('text=Get Your Free Quote')).toBeVisible();

    // Step 1
    await page.click('label:has-text("Mortgage Protection")');
    await page.waitForTimeout(200);
    await selectFromDropdown(page, '[data-testid="select-coverage-amount"]', '$250,000');
    await page.click('[data-testid="button-continue-step1"]');
    await page.waitForTimeout(500);

    // Step 2
    await page.fill('[data-testid="input-first-name"]', quoteFormData.firstName);
    await page.fill('[data-testid="input-last-name"]', quoteFormData.lastName);
    await page.fill('[data-testid="input-email"]', quoteFormData.email);
    await page.fill('[data-testid="input-phone"]', quoteFormData.phone);
    await page.click('[data-testid="button-continue-step2"]');
    await page.waitForTimeout(500);

    // Step 3
    await page.fill('[data-testid="input-street-address"]', quoteFormData.streetAddress);
    await page.fill('[data-testid="input-address-line2"]', quoteFormData.addressLine2);
    await page.fill('[data-testid="input-city"]', quoteFormData.city);

    // Select state using keyboard
    await page.click('[data-testid="select-state"]');
    await page.waitForTimeout(300);
    await page.keyboard.type('Ill');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.fill('[data-testid="input-zip-code"]', quoteFormData.zipCode);
    await page.click('[data-testid="button-continue-step3"]');
    await page.waitForTimeout(500);

    // Step 4
    await selectFromDropdown(page, '[data-testid="select-height-feet"]', '5 ft');
    await selectFromDropdown(page, '[data-testid="select-height-inches"]', '8 in');
    await page.fill('[data-testid="input-weight"]', quoteFormData.weight);
    await page.fill('[data-testid="input-birth-date"]', quoteFormData.birthDate);
    await page.fill('[data-testid="textarea-medical-background"]', quoteFormData.medicalBackground);
    await page.click('[data-testid="button-submit-quote"]');

    await expect(page.locator('text=Thank You!')).toBeVisible({ timeout: 15000 });

    console.log('✅ Quote form: PASSED\n');
    console.log('🎉 All tests completed successfully!\n');
  });
});
