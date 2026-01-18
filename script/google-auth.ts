import "dotenv/config";
import { google } from "googleapis";
import http from "http";
import open from "open";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/auth/google/callback"
);

const scopes = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

async function main() {
  console.log("\n🔐 Google OAuth2 Setup for Gold Coast Financial\n");

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("❌ Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env");
    process.exit(1);
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });

  console.log("📋 Steps to complete setup:\n");
  console.log("1. A browser window will open for Google authorization");
  console.log("2. Sign in with the Gmail account you want to use for sending emails");
  console.log("3. Grant the requested permissions");
  console.log("4. You'll be redirected back and see the refresh token\n");

  // Create a temporary server to handle the callback
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url!, `http://localhost:3000`);

    if (url.pathname === "/api/auth/google/callback") {
      const code = url.searchParams.get("code");

      if (code) {
        try {
          const { tokens } = await oauth2Client.getToken(code);

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Authorization Successful</title>
                <style>
                  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                  .token { background: #f5f5f5; padding: 15px; border-radius: 8px; word-break: break-all; margin: 20px 0; }
                  .success { color: #22c55e; }
                  code { background: #e5e5e5; padding: 2px 6px; border-radius: 4px; }
                </style>
              </head>
              <body>
                <h1 class="success">✅ Authorization Successful!</h1>
                <p>Copy this refresh token and add it to your <code>.env</code> file:</p>
                <div class="token"><strong>GOOGLE_REFRESH_TOKEN=</strong>${tokens.refresh_token}</div>
                <p>Then add the same value to your Railway environment variables.</p>
                <p>You can close this window now.</p>
              </body>
            </html>
          `);

          console.log("\n✅ Authorization successful!\n");
          console.log("Add this to your .env file:\n");
          console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
          console.log("Also add this to your Railway environment variables.\n");

          setTimeout(() => {
            server.close();
            process.exit(0);
          }, 1000);
        } catch (error) {
          console.error("Error getting tokens:", error);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error getting tokens. Check the console for details.");
          server.close();
          process.exit(1);
        }
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("No authorization code received");
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    }
  });

  server.listen(3000, () => {
    console.log("🌐 Temporary server started on http://localhost:3000");
    console.log("🔗 Opening browser for authorization...\n");

    // Try to open browser, fall back to manual URL if it fails
    open(authUrl).catch(() => {
      console.log("Could not open browser automatically.");
      console.log("Please open this URL manually:\n");
      console.log(authUrl);
    });
  });
}

main().catch(console.error);
