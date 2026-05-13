import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import PasswordConfirmInput from "@/components/ui/assisted-password-confirmation";

interface Props {
  form: Record<string, any>;
  set: (k: string, v: any) => void;
  errors: Record<string, string>;
  isInvite: boolean;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

export function StepAccountSetup({ form, set, errors, isInvite, inputStyle, labelStyle }: Props) {
  const [showPw, setShowPw] = useState(false);

  return (
    <div>
      <h2 style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-2xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-2)" }}>Account Setup</h2>
      <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-6)" }}>Create your login credentials. You'll use these to access the Gold Coast Financial agent portal.</p>

      <div className="flex flex-col gap-4">
        <div>
          <label style={labelStyle}>Email Address *</label>
          <input value={form.email} onChange={e => set("email", e.target.value)} type="email" placeholder="agent@email.com"
            style={{ ...inputStyle, opacity: isInvite ? 0.6 : 1 }} readOnly={isInvite} />
          {errors.email && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 2 }}>{errors.email}</span>}
        </div>

        <div className="relative">
          <label style={labelStyle}>Password *</label>
          <div className="relative">
            <input value={form.password} onChange={e => set("password", e.target.value)}
              type={showPw ? "text" : "password"} placeholder="Min 8 chars, uppercase, lowercase, number"
              style={inputStyle} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--gc-text-muted)",
            }}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 2 }}>{errors.password}</span>}
          <div className="flex gap-2 mt-2">
            {[
              { test: /.{8,}/, label: "8+ chars" },
              { test: /[A-Z]/, label: "Uppercase" },
              { test: /[a-z]/, label: "Lowercase" },
              { test: /[0-9]/, label: "Number" },
            ].map(({ test, label }) => (
              <span key={label} style={{
                fontSize: "10px", padding: "2px 6px", borderRadius: "var(--gc-radius-full)",
                backgroundColor: test.test(form.password || "") ? "color-mix(in srgb, var(--gc-status-active) 15%, transparent)" : "var(--gc-surface-2)",
                color: test.test(form.password || "") ? "var(--gc-status-active)" : "var(--gc-text-muted)",
                border: `1px solid ${test.test(form.password || "") ? "color-mix(in srgb, var(--gc-status-active) 30%, transparent)" : "var(--gc-border-subtle)"}`,
              }}>{label}</span>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Confirm Password *</label>
          {form.password ? (
            <PasswordConfirmInput
              passwordToMatch={form.password}
              value={form.confirmPassword || ""}
              onChange={v => set("confirmPassword", v)}
              inputPlaceholder="Re-enter your password"
              className="gc-password-confirm"
            />
          ) : (
            <input value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
              type="password" placeholder="Enter a password first" style={{ ...inputStyle, opacity: 0.5 }} disabled />
          )}
          {errors.confirmPassword && <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", marginTop: 2 }}>{errors.confirmPassword}</span>}
        </div>
      </div>
    </div>
  );
}
