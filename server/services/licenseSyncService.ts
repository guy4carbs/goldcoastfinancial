/**
 * License Sync Service
 * Current: Manual entry by admin + auto-creation from application data
 * Future: When GCF gets its own SureLC account, add SURELC_API_KEY to .env
 *         and this service auto-activates API sync — no code changes needed
 */
import { pool } from "../db";

export interface LicenseData {
  stateCode: string;
  licenseNumber: string;
  licenseType: string;
  status: string;
  effectiveDate: string | null;
  expirationDate: string | null;
  isResident: boolean;
}

/**
 * Sync agent licenses from external source (SureLC/NIPR)
 * Phase 1: Stub — returns false (no external sync available)
 * Phase 2: Will call SureLC API with agent's NPN
 */
export async function syncAgentLicenses(npn: string, agentUserId: string): Promise<{ success: boolean; synced: number; source: string }> {
  const surelcApiKey = process.env.SURELC_API_KEY;
  const surelcApiUrl = process.env.SURELC_API_URL;

  if (surelcApiKey && surelcApiUrl) {
    // Phase 2: SureLC API integration
    try {
      const resp = await fetch(`${surelcApiUrl}/producers/${npn}/licenses`, {
        headers: { Authorization: `Bearer ${surelcApiKey}`, "Content-Type": "application/json" },
      });
      if (resp.ok) {
        const data = await resp.json();
        const licenses: LicenseData[] = (data.licenses || []).map((l: any) => ({
          stateCode: l.stateCode || l.state,
          licenseNumber: l.licenseNumber || l.number,
          licenseType: l.licenseType || l.type || "life_health",
          status: l.status || "active",
          effectiveDate: l.effectiveDate || null,
          expirationDate: l.expirationDate || null,
          isResident: l.isResident || l.resident || false,
        }));

        let synced = 0;
        for (const lic of licenses) {
          await pool.query(
            `INSERT INTO agent_licenses (user_id, state_code, license_number, license_type, status, effective_date, expiration_date, is_resident, last_synced_at, sync_source)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'surelc')
             ON CONFLICT (user_id, state_code) DO UPDATE SET
               license_number = EXCLUDED.license_number, license_type = EXCLUDED.license_type,
               status = EXCLUDED.status, effective_date = EXCLUDED.effective_date,
               expiration_date = EXCLUDED.expiration_date, is_resident = EXCLUDED.is_resident,
               last_synced_at = NOW(), sync_source = 'surelc', updated_at = NOW()`,
            [agentUserId, lic.stateCode, lic.licenseNumber, lic.licenseType, lic.status, lic.effectiveDate, lic.expirationDate, lic.isResident]
          );
          synced++;
        }
        return { success: true, synced, source: "surelc" };
      }
    } catch (e: any) {
      console.error("[LicenseSync] SureLC API error:", e.message);
    }
  }

  // Phase 1: No external sync available
  return { success: false, synced: 0, source: "none" };
}

/**
 * Add a license manually (admin-entered)
 */
export async function addManualLicense(agentUserId: string, license: LicenseData): Promise<string> {
  const result = await pool.query(
    `INSERT INTO agent_licenses (user_id, state_code, license_number, license_type, status, effective_date, expiration_date, is_resident, last_synced_at, sync_source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'manual') RETURNING id`,
    [agentUserId, license.stateCode, license.licenseNumber, license.licenseType, license.status, license.effectiveDate, license.expirationDate, license.isResident]
  );
  return result.rows[0].id;
}

/**
 * Get all licenses for an agent
 */
export async function getAgentLicenses(agentUserId: string) {
  const result = await pool.query(
    `SELECT * FROM agent_licenses WHERE user_id::text = $1 ORDER BY is_resident DESC, state_code ASC`,
    [agentUserId]
  );
  return result.rows.map((r: any) => ({
    id: r.id,
    stateCode: r.state_code,
    licenseNumber: r.license_number,
    licenseType: r.license_type,
    status: r.status,
    effectiveDate: r.effective_date,
    expirationDate: r.expiration_date,
    isResident: r.is_resident,
    lastSyncedAt: r.last_synced_at,
    syncSource: r.sync_source,
  }));
}
