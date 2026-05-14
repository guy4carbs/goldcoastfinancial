import { useState, useEffect } from "react";
import { Plus, Trash2, UserCircle, Upload } from "lucide-react";
import { CustomSelect } from "./StepAddress";
import { US_STATES } from "../applicationSchema";
import { AddressAutocomplete } from "../components/AddressAutocomplete";
import { FileUploadZone } from "../components/FileUploadZone";
import { useApplyUpload } from "../hooks/useApplyUpload";

export interface Owner {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  ownershipPercent: number;
  ssn: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  photoIdFile: string;
  photoIdUploaded: boolean;
  isPrimary: boolean;
}

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  token: string;
}

const COMPANY_TYPES = [
  { value: "llc", label: "LLC Corporation" },
  { value: "s_corp", label: "S Corporation" },
  { value: "c_corp", label: "C Corporation" },
  { value: "sole_prop", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
];

const LICENSE_TYPES = [
  { value: "life", label: "Life" },
  { value: "life_health", label: "Life & Health" },
];

function formatSSN(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export function StepBusinessEntity({ form, set, errors, inputStyle, labelStyle, token }: Props) {
  const stateOptions = US_STATES.map(s => ({ value: s, label: s }));
  const owners: Owner[] = form.owners || [];
  const { upload, uploading, error: uploadError } = useApplyUpload(token);

  // Auto-populate first owner from personal info on mount
  useEffect(() => {
    if (owners.length === 0) {
      set("owners", [{
        id: crypto.randomUUID(),
        firstName: form.firstName || "",
        middleName: "",
        lastName: form.lastName || "",
        dateOfBirth: form.dateOfBirth || "",
        ownershipPercent: 100,
        ssn: form.ssn || "",
        streetAddress: form.streetAddress || "",
        city: form.city || "",
        state: form.state || "",
        zipCode: form.zipCode || "",
        photoIdFile: "",
        photoIdUploaded: false,
        isPrimary: true,
      }]);
    }
  }, []);

  const totalOwnership = owners.reduce((sum: number, o: Owner) => sum + (o.ownershipPercent || 0), 0);

  const updateOwner = (id: string, field: string, value: any) => {
    set("owners", owners.map((o: Owner) => o.id === id ? { ...o, [field]: value } : o));
  };

  const addOwner = () => {
    set("owners", [...owners, {
      id: crypto.randomUUID(),
      firstName: "", middleName: "", lastName: "", dateOfBirth: "",
      ownershipPercent: Math.max(0, 100 - totalOwnership),
      ssn: "", streetAddress: "", city: "", state: "", zipCode: "",
      photoIdFile: "", photoIdUploaded: false, isPrimary: false,
    }]);
  };

  const removeOwner = (id: string) => {
    set("owners", owners.filter((o: Owner) => o.id !== id));
  };

  const handlePhotoUpload = async (ownerId: string, file: File) => {
    // Owner photo IDs persist to agent_profiles.owner_photos_json on the
    // server. Each owner's upload is keyed by ownerId so multiple owners
    // can have separate photos without colliding.
    if (await upload("owner_photo", file, { ownerId })) {
      updateOwner(ownerId, "photoIdFile", file.name);
      updateOwner(ownerId, "photoIdUploaded", true);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Business Entity Details</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Provide your business entity information, license type, and ownership details.</p>

      <div className="flex flex-col gap-5">
        {/* Company Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Company Type *</label>
            <CustomSelect value={form.companyType || ""} onChange={v => set("companyType", v)} options={COMPANY_TYPES} placeholder="Select" inputStyle={inputStyle} />
            {errors.companyType && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.companyType}</span>}
          </div>
          <div>
            <label style={labelStyle}>State of Incorporation *</label>
            <CustomSelect value={form.stateOfInc || ""} onChange={v => set("stateOfInc", v)} options={stateOptions} placeholder="Select state" inputStyle={inputStyle} />
            {errors.stateOfInc && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.stateOfInc}</span>}
          </div>
        </div>

        <div>
          <label style={labelStyle}>DBA Name <span style={{ opacity: 0.5, textTransform: "none" }}>(if different from entity name)</span></label>
          <input value={form.dbaName || ""} onChange={e => set("dbaName", e.target.value)} placeholder="Doing Business As" style={inputStyle} />
        </div>

        {/* License Type */}
        <div>
          <label style={labelStyle}>License Type *</label>
          <div className="flex gap-3 mt-1">
            {LICENSE_TYPES.map(lt => (
              <button key={lt.value} onClick={() => set("licenseType", lt.value)} style={{
                padding: "var(--gc-space-2) var(--gc-space-4)", borderRadius: "var(--gc-radius-sm)",
                border: `1px solid ${form.licenseType === lt.value ? "var(--gc-gold)" : "var(--gc-border)"}`,
                backgroundColor: form.licenseType === lt.value ? "color-mix(in srgb, var(--gc-gold) 12%, transparent)" : "var(--gc-surface)",
                color: form.licenseType === lt.value ? "var(--gc-gold)" : "var(--gc-text-secondary)",
                fontSize: "var(--gc-text-sm)", fontWeight: 500, cursor: "pointer",
              }}>{lt.label}</button>
            ))}
          </div>
          {errors.licenseType && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.licenseType}</span>}
        </div>

        {/* Formation Date */}
        <div>
          <label style={labelStyle}>Business Entity Formation Date *</label>
          <input type="date" value={form.formationDate || ""} onChange={e => set("formationDate", e.target.value)} style={inputStyle} />
          {errors.formationDate && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.formationDate}</span>}
        </div>

        {/* Articles of Incorporation Upload */}
        <div>
          <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-2)" }}>Articles of Incorporation</div>
          <FileUploadZone
            label={uploading === "articles" ? "Uploading..." : "Upload Articles of Incorporation"}
            accept=".pdf,.jpg,.jpeg,.png"
            uploaded={form.articlesUploaded || false}
            fileName={form.articlesFileName}
            onUpload={async file => {
              if (await upload("articles", file)) {
                set("articlesUploaded", true);
                set("articlesFileName", file.name);
              }
            }}
          />
          {uploadError && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 4, display: "block" }}>{uploadError}</span>}
          {errors.articlesUploaded && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)" }}>{errors.articlesUploaded}</span>}
        </div>

        {/* Owners Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Owner(s)</div>
              <p style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 2 }}>All owners must total exactly 100% ownership.</p>
            </div>
          </div>

          {/* Ownership progress bar */}
          <div className="flex items-center gap-3 mb-4">
            <div style={{ flex: 1, height: 8, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${Math.min(totalOwnership, 100)}%`,
                backgroundColor: totalOwnership === 100 ? "var(--gc-status-active)" : totalOwnership > 100 ? "var(--gc-status-terminated)" : "var(--gc-gold)",
                borderRadius: "var(--gc-radius-full)", transition: "all 0.3s",
              }} />
            </div>
            <span style={{
              fontSize: "var(--gc-text-sm)", fontWeight: 600, minWidth: 50, textAlign: "right",
              color: totalOwnership === 100 ? "var(--gc-status-active)" : totalOwnership > 100 ? "var(--gc-status-terminated)" : "var(--gc-gold)",
            }}>{totalOwnership}%</span>
          </div>
          {errors.owners && <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginBottom: "var(--gc-space-2)" }}>{errors.owners}</div>}

          {/* Owner Cards */}
          <div className="flex flex-col gap-4">
            {owners.map((owner: Owner, idx: number) => (
              <div key={owner.id} style={{
                padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)",
                border: `1px solid ${owner.isPrimary ? "var(--gc-gold)" : "var(--gc-border)"}`,
                borderRadius: "var(--gc-radius-md)",
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5" style={{ color: owner.isPrimary ? "var(--gc-gold)" : "var(--gc-text-muted)" }} />
                    <span style={{ fontSize: "var(--gc-text-sm)", fontWeight: 600, color: "var(--gc-text-primary)" }}>
                      {owner.isPrimary ? "Primary Owner (You)" : `Owner ${idx + 1}`}
                    </span>
                  </div>
                  {!owner.isPrimary && (
                    <button onClick={() => removeOwner(owner.id)} style={{ color: "var(--gc-status-terminated)", background: "none", border: "none", cursor: "pointer" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label style={labelStyle}>First Name *</label>
                      <input value={owner.firstName} onChange={e => updateOwner(owner.id, "firstName", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Middle Name</label>
                      <input value={owner.middleName} onChange={e => updateOwner(owner.id, "middleName", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name *</label>
                      <input value={owner.lastName} onChange={e => updateOwner(owner.id, "lastName", e.target.value)} style={inputStyle} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label style={labelStyle}>Date of Birth *</label>
                      <input type="date" value={owner.dateOfBirth} onChange={e => updateOwner(owner.id, "dateOfBirth", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Ownership % *</label>
                      <input type="number" min={1} max={100} value={owner.ownershipPercent || ""} onChange={e => updateOwner(owner.id, "ownershipPercent", parseInt(e.target.value) || 0)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>SSN *</label>
                      <input type="password" value={formatSSN(owner.ssn)} onChange={e => updateOwner(owner.id, "ssn", e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="XXX-XX-XXXX" maxLength={11} style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Street Address *</label>
                    <AddressAutocomplete
                      value={owner.streetAddress}
                      onChange={v => updateOwner(owner.id, "streetAddress", v)}
                      onSelect={r => {
                        updateOwner(owner.id, "streetAddress", r.street);
                        updateOwner(owner.id, "city", r.city);
                        updateOwner(owner.id, "state", r.state);
                        updateOwner(owner.id, "zipCode", r.zip);
                      }}
                      inputStyle={inputStyle}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <label style={labelStyle}>City *</label>
                      <input value={owner.city} onChange={e => updateOwner(owner.id, "city", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>State *</label>
                      <CustomSelect value={owner.state} onChange={v => updateOwner(owner.id, "state", v)} options={stateOptions} placeholder="--" inputStyle={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>ZIP *</label>
                      <input value={owner.zipCode} onChange={e => updateOwner(owner.id, "zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))} maxLength={5} style={inputStyle} />
                    </div>
                  </div>

                  {/* Photo ID Upload */}
                  <div>
                    <label style={labelStyle}>Photo ID (Front) *</label>
                    <FileUploadZone
                      label={`Upload ${owner.firstName || "Owner"}'s Photo ID`}
                      accept=".jpg,.jpeg,.png,.pdf"
                      uploaded={owner.photoIdUploaded}
                      fileName={owner.photoIdFile}
                      onUpload={file => handlePhotoUpload(owner.id, file)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Owner Button */}
          <button onClick={addOwner} className="flex items-center gap-2 mt-3" style={{
            padding: "var(--gc-space-2) var(--gc-space-3)", borderRadius: "var(--gc-radius-sm)",
            border: "1px dashed var(--gc-border)", backgroundColor: "transparent",
            color: "var(--gc-text-secondary)", cursor: "pointer", fontSize: "var(--gc-text-sm)",
            width: "100%", justifyContent: "center",
          }}>
            <Plus className="w-4 h-4" /> Add Another Owner
          </button>
        </div>
      </div>
    </div>
  );
}
