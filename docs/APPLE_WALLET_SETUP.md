# Apple Wallet Pass Setup Guide

This guide walks you through setting up Apple Wallet passes for Gold Coast Financial member cards.

## Overview

Apple Wallet passes require:
1. **Pass Type ID** - A unique identifier registered with Apple
2. **Signing Certificate** - To cryptographically sign passes
3. **WWDR Certificate** - Apple's intermediate certificate
4. **Pass Assets** - Icon and logo images

## Step 1: Create Pass Type ID

1. Log in to [Apple Developer Portal](https://developer.apple.com)
2. Go to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** in the left sidebar
4. Click the **+** button to add a new identifier
5. Select **Pass Type IDs** and click Continue
6. Enter:
   - **Description**: `Gold Coast Financial Member Card`
   - **Identifier**: `pass.com.goldcoastfnl.membercard`
7. Click **Register**

## Step 2: Create Pass Signing Certificate

1. In Apple Developer Portal, go to **Certificates**
2. Click **+** to create a new certificate
3. Under Services, select **Pass Type ID Certificate**
4. Click Continue
5. Select your Pass Type ID (`pass.com.goldcoastfnl.membercard`)
6. Follow the prompts to create a Certificate Signing Request (CSR):
   - Open **Keychain Access** on your Mac
   - Go to **Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority**
   - Enter your email and name
   - Select **Saved to disk**
   - Save the `.certSigningRequest` file
7. Upload the CSR to Apple Developer Portal
8. Download the resulting `.cer` certificate file

## Step 3: Export Certificate and Private Key

### Add Certificate to Keychain
```bash
# Double-click the .cer file to add it to Keychain
# Or use command line:
security add-certificates pass_certificate.cer
```

### Export as .p12
1. Open **Keychain Access**
2. Find your certificate (search for "Pass Type ID")
3. Right-click the certificate > **Export**
4. Choose **.p12** format
5. Set a password (remember this!)
6. Save as `pass_certificate.p12`

### Convert to PEM Format
```bash
# Navigate to your certs directory
cd /path/to/gcf/certs

# Extract the certificate
openssl pkcs12 -in pass_certificate.p12 -clcerts -nokeys -out pass-cert.pem

# Extract the private key (you'll be prompted for the .p12 password)
openssl pkcs12 -in pass_certificate.p12 -nocerts -out pass-key-encrypted.pem

# Remove the passphrase from the key (recommended for server use)
openssl rsa -in pass-key-encrypted.pem -out pass-key.pem

# Secure the key file
chmod 600 pass-key.pem
```

## Step 4: Download WWDR Certificate

Apple's Worldwide Developer Relations (WWDR) certificate is required for the trust chain.

1. Go to [Apple Certificate Authority](https://www.apple.com/certificateauthority/)
2. Download **Worldwide Developer Relations - G4** certificate
3. Convert to PEM format:

```bash
# Convert from DER to PEM format
openssl x509 -in AppleWWDRCAG4.cer -inform DER -out wwdr.pem -outform PEM
```

## Step 5: Create Pass Assets

Create images for your passes. Place them in `server/assets/wallet/heritage/` (or other DBA folder).

### Required Images

| File | Size | Description |
|------|------|-------------|
| `icon.png` | 29×29 | Pass icon (1x) |
| `icon@2x.png` | 58×58 | Pass icon (2x) |
| `icon@3x.png` | 87×87 | Pass icon (3x) |
| `logo.png` | 160×50 | Pass logo (1x) |
| `logo@2x.png` | 320×100 | Pass logo (2x) |
| `logo@3x.png` | 480×150 | Pass logo (3x) |

### Design Guidelines
- Use PNG format with transparency
- Icon should be your company logo mark
- Logo appears on the pass and should include your brand name
- Follow [Apple's Wallet Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/wallet)

## Step 6: Configure Environment Variables

Add these to your `.env` file:

```env
# Apple Wallet Pass Configuration
APPLE_PASS_TYPE_IDENTIFIER=pass.com.goldcoastfnl.membercard
APPLE_TEAM_IDENTIFIER=YOUR_TEAM_ID

# Certificate Paths (relative to project root or absolute)
APPLE_PASS_CERTIFICATE_PATH=./certs/pass-cert.pem
APPLE_PASS_KEY_PATH=./certs/pass-key.pem
APPLE_WWDR_CERTIFICATE_PATH=./certs/wwdr.pem

# Optional: Password if key is encrypted
APPLE_PASS_KEY_PASSWORD=
```

### Finding Your Team ID
1. Log in to [Apple Developer Portal](https://developer.apple.com)
2. Go to **Membership**
3. Your Team ID is listed there (10-character alphanumeric)

## Step 7: Test the Setup

### Check Configuration Status
```bash
curl http://localhost:5000/api/wallet/setup
```

### Generate a Test Pass
```bash
curl -X POST http://localhost:5000/api/wallet/pass \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "TEST-001",
    "memberName": "John Doe",
    "policyNumber": "POL-123456",
    "insuranceCarrier": "Mutual of Omaha",
    "coverageAmount": "$500,000",
    "planType": "Term Life",
    "effectiveDate": "01/01/2026",
    "beneficiaryName": "Jane Doe",
    "agentName": "Agent Smith"
  }' \
  --output test-pass.pkpass
```

### Install Test Pass
- AirDrop the `.pkpass` file to your iPhone, or
- Email it to yourself and open on iPhone, or
- Host it on a web server and access via Safari on iPhone

## File Structure

After setup, your project should have:

```
gcf/
├── certs/
│   ├── pass-cert.pem      # Your signing certificate
│   ├── pass-key.pem       # Your private key
│   └── wwdr.pem           # Apple WWDR certificate
├── server/
│   ├── assets/
│   │   └── wallet/
│   │       ├── heritage/   # Heritage Life Solutions assets
│   │       │   ├── icon.png
│   │       │   ├── icon@2x.png
│   │       │   ├── icon@3x.png
│   │       │   ├── logo.png
│   │       │   ├── logo@2x.png
│   │       │   └── logo@3x.png
│   │       └── default/    # Fallback assets
│   └── routes/
│       └── wallet.ts       # Pass generation API
```

## Adding New DBAs

To add a new DBA (e.g., a new brand under Gold Coast Financial):

1. Add configuration to `server/routes/wallet.ts`:
```typescript
const DBA_CONFIG = {
  heritage: { ... },
  newbrand: {
    name: "New Brand Name",
    logoText: "NEW BRAND",
    backgroundColor: "rgb(R, G, B)",
    foregroundColor: "rgb(255, 255, 255)",
    labelColor: "rgb(R, G, B)",
    supportPhone: "1-800-XXX-XXXX",
    supportEmail: "support@newbrand.com",
    website: "newbrand.com",
    barcodePrefix: "NBD"
  }
};
```

2. Create assets folder: `server/assets/wallet/newbrand/`

3. Add the required icon and logo images

4. Pass `dba: "newbrand"` when generating passes

## Troubleshooting

### "Pass signing not configured" Error
- Verify all certificate paths in `.env` are correct
- Check that certificate files exist and are readable
- Ensure certificates are in PEM format

### "Invalid pass" on iPhone
- Check that Team ID matches your Apple Developer account
- Verify Pass Type ID is registered
- Ensure all required fields are in pass.json
- Verify the signature was created correctly

### Certificate Expired
- Signing certificates expire after 1 year
- Create a new certificate in Apple Developer Portal
- Export and convert as described above

## Security Best Practices

1. **Never commit certificates to git** - Add to `.gitignore`:
   ```
   certs/
   *.pem
   *.p12
   *.cer
   ```

2. **Use environment variables** for paths and passwords

3. **Restrict file permissions**:
   ```bash
   chmod 600 certs/*.pem
   ```

4. **Rotate certificates** before expiration

5. **Use separate certificates** for development and production

## Resources

- [Apple Wallet Developer Documentation](https://developer.apple.com/documentation/walletpasses)
- [Wallet Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/wallet)
- [Pass Type ID Reference](https://developer.apple.com/documentation/walletpasses/pass)
- [Apple Certificate Authority](https://www.apple.com/certificateauthority/)
