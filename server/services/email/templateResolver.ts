// =============================================================================
// Template resolver — {{a.b.c}} dotted-path substitution
// =============================================================================
//
// Ported verbatim from server/services/automation-email.ts so the drip engine
// and any other system-email caller share one implementation. Unknown paths are
// left untouched (the original {{...}} token is preserved) so partial contexts
// degrade gracefully instead of producing "undefined".

export function resolveTemplate(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const parts = String(path).trim().split(".");
    let value: any = context;

    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        return match; // Keep original if not found
      }
    }

    return value !== undefined ? String(value) : match;
  });
}
