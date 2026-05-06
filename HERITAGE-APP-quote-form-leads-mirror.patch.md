# Patch: Mirror website quote submissions into the `leads` table

**Branch to apply on:** `heritage-app`
**File to modify:** `server/routes.ts`
**Why:** When a visitor submits the quote form on heritagels.org, the handler currently writes to `quote_requests` only and broadcasts an in-memory WebSocket event. Nothing lands in the shared `leads` table, so the cross-deployment Founders Lead Distribution surface (goldcoastfinancial.co) never sees it in its Website tab.

This patch adds a **best-effort** `storage.createLead({...})` call right after the quote_request is created. A failure on the leads-insert never blocks the visitor's submission response — they always get their 201.

## How to apply

```bash
cd /Users/guy4carbs/gcf
git checkout heritage-app
# (apply the diff below — see "Diff" section)
git add server/routes.ts
git commit -m "Mirror website quote submissions into leads table for founders Lead Distribution"
git push origin heritage-app   # triggers Railway redeploy on heritagels.org
git checkout feature/hcms-foundation
```

## Diff

Locate `server/routes.ts` line ~830 (the `app.post("/api/quote-requests", ...)` handler). Replace the block from `// Quote request submission (rate limited)` through the existing `// Auto-score: higher coverage ...` and `// Priority based on coverage amount` constants with the version below. The variable computations are lifted out of the WebSocket block so the leads-mirror and the broadcast share them — net behavior of the broadcast is unchanged.

```diff
   // Quote request submission (rate limited)
   app.post("/api/quote-requests", quoteLimiter, async (req, res) => {
     try {
       const validatedData = insertQuoteRequestSchema.parse(req.body);
       const quoteRequest = await storage.createQuoteRequest(validatedData);
-      
+
+      // Compute the auto-score / priority once — used by both the leads-table
+      // mirror below AND the in-memory WebSocket broadcast further down.
+      const coverageNum = parseInt(String(validatedData.coverageAmount).replace(/[^0-9]/g, '')) || 0;
+      const birthYear = validatedData.birthDate ? new Date(validatedData.birthDate).getFullYear() : null;
+      const age = birthYear ? new Date().getFullYear() - birthYear : null;
+      const baseScore = Math.min(90, Math.max(30, Math.round(coverageNum / 10000) * 5 + 40));
+      const leadScore = age && age >= 30 && age <= 55 ? Math.min(95, baseScore + 10) : baseScore;
+      const priority = coverageNum >= 500000 ? 'urgent' : coverageNum >= 250000 ? 'high' : coverageNum >= 100000 ? 'medium' : 'low';
+      const scoreTier: 'cold' | 'warm' | 'hot' | 'on_fire' =
+        leadScore >= 80 ? 'on_fire' : leadScore >= 60 ? 'hot' : leadScore >= 40 ? 'warm' : 'cold';
+
+      // Mirror into the shared `leads` table so the cross-deployment Founders
+      // Lead Distribution surface (goldcoastfinancial.co) sees website quote
+      // submissions in its Website tab. source='web_form' matches the
+      // founders pool filter; sourceId links back to quote_requests.id for
+      // traceability. Underwriting context (DOB, age, height, weight, gender,
+      // tobacco, addressLine2, full medical background) lands in the
+      // `enrichment_data` JSONB column so the LeadDetailDrawer can render a
+      // full "Underwriting Info" card without re-querying quote_requests.
+      // Best-effort: a leads-insert failure must NOT block the quote_request
+      // response — the visitor's submission still confirmed.
+      try {
+        await storage.createLead({
+          firstName: validatedData.firstName,
+          lastName: validatedData.lastName,
+          email: validatedData.email,
+          phone: validatedData.phone || null,
+          streetAddress: validatedData.streetAddress || null,
+          city: validatedData.city || null,
+          state: validatedData.state || null,
+          zipCode: validatedData.zipCode || null,
+          source: 'web_form',
+          sourceId: String(quoteRequest.id),
+          status: 'new',
+          priority,
+          coverageType: validatedData.coverageType || null,
+          coverageAmount: validatedData.coverageAmount ? String(validatedData.coverageAmount) : null,
+          estimatedValue: coverageNum || null,
+          leadScore,
+          scoreTier,
+          pipelineStage: 'new',
+          notes: validatedData.medicalBackground || null,
+          enrichmentData: {
+            addressLine2: validatedData.addressLine2 || null,
+            birthDate: validatedData.birthDate || null,
+            age,
+            height: validatedData.height || null,
+            weight: validatedData.weight || null,
+            // gender + tobacco aren't in insertQuoteRequestSchema today; if
+            // the QuickQuoteWidget prefill is later persisted into
+            // quote_requests, surface them here too.
+            medicalBackground: validatedData.medicalBackground || null,
+            quoteRequestId: quoteRequest.id,
+            submittedAt: new Date().toISOString(),
+          },
+        } as any);
+      } catch (leadErr: any) {
+        console.error("[QuoteRequests] Failed to mirror into leads table:", leadErr?.message);
+      }
+
       // Broadcast new website lead to Executive Lead Distribution via WebSocket
       try {
         const wsServer = app.get('wsServer');
         if (wsServer) {
-          // Parse coverage amount to numeric
-          const coverageNum = parseInt(String(validatedData.coverageAmount).replace(/[^0-9]/g, '')) || 0;
-          // Calculate age from birthDate
-          const birthYear = validatedData.birthDate ? new Date(validatedData.birthDate).getFullYear() : null;
-          const age = birthYear ? new Date().getFullYear() - birthYear : null;
-          // Auto-score: higher coverage = higher score, adjusted by age
-          const baseScore = Math.min(90, Math.max(30, Math.round(coverageNum / 10000) * 5 + 40));
-          const leadScore = age && age >= 30 && age <= 55 ? Math.min(95, baseScore + 10) : baseScore;
-          // Priority based on coverage amount
-          const priority = coverageNum >= 500000 ? 'urgent' : coverageNum >= 250000 ? 'high' : coverageNum >= 100000 ? 'medium' : 'low';
-
           const websiteLead = {
             type: 'new_website_lead',
             lead: {
               id: `quote-${quoteRequest.id}`,
               firstName: validatedData.firstName,
               lastName: validatedData.lastName,
               email: validatedData.email,
               phone: validatedData.phone,
               streetAddress: validatedData.streetAddress,
               city: validatedData.city,
               state: validatedData.state,
               zipCode: validatedData.zipCode,
               source: 'website',
               priority,
               product: validatedData.coverageType,
               coverageType: validatedData.coverageType,
               estimatedValue: coverageNum,
               coverageAmountDisplay: validatedData.coverageAmount,
               leadScore,
-              scoreTier: leadScore >= 80 ? 'on_fire' : leadScore >= 60 ? 'hot' : leadScore >= 40 ? 'warm' : 'cold',
+              scoreTier,
               status: 'pool',
```

(rest of the file is unchanged)

## Verification (after deploying heritage-app)

1. On heritagels.org, submit the public quote form with a test name + email.
2. On goldcoastfinancial.co, log in as founder → `/founders/lead-distribution` → click the "Website" pool tab. The submission should appear there with:
   - `source: 'web_form'`
   - `priority` derived from coverage (urgent/high/medium/low)
   - `leadScore` 30–95 with `scoreTier` derived
   - `status: 'new'`, `pipelineStage: 'new'`, `distributedTo: null`
3. Click "Distribute Evenly" → the lead writes `distributed_to = $manager_id` and lands in the manager's heritagels.org inbox.

## Why this is safe

- The `storage.createLead({...})` call is wrapped in its own `try/catch` so any leads-table failure (FK violation, schema drift, transient connectivity) is logged and the original `res.status(201).json(quoteRequest)` still fires. The visitor's submission UX is unaffected.
- `source: 'web_form'` matches the founders pool tab filter (`?tab=web_form`) — no founders-side change required.
- `sourceId: quoteRequest.id` lets you trace any leads row back to its originating quote_request for forensics.
- `notes: validatedData.medicalBackground || null` carries the medical context across, useful for the agent who eventually picks the lead up. If you don't want medical info bleeding into the leads table, drop that field — it's optional.
- The auto-score / priority extraction out of the WebSocket block is functionally identical (same expressions); only the scope changed so both code paths share them.

## What is NOT changing

- `quote_requests` table writes are unchanged — `storage.createQuoteRequest` still runs first and is the primary write.
- The WebSocket broadcast is unchanged in shape (the `source: 'website'` string in the payload stays — that's the in-memory event channel, not the persisted lead row).
- No other endpoints touched.
- No schema changes — `leads` table already has every column referenced.
