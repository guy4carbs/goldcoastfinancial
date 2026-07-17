#!/usr/bin/env python3
"""One-shot patcher for /Users/guy4carbs/discord-bot/cogs/onboarding.py.

Adds the applicant "current commission" step to the Discord apply flow and
raises the founder invite dropdown ceiling (75..155). Exact-match string
replacement with fail-loud semantics: if ANY pattern is missing (file drifted),
nothing is written and the missing pattern is reported. Idempotent: re-running
after success reports "already applied". A .bak backup is written first.

Run:  python3 scripts/apply-discord-bot-commission.py
"""
import sys, shutil

PATH = "/Users/guy4carbs/discord-bot/cogs/onboarding.py"

REPLACEMENTS = [
    # 1. ApplyModal: add the commission TextInput + pass through on_submit
    (
        '''    email = discord.ui.TextInput(label="Work email (same as your Gold Coast CRM)",
                                 placeholder="The exact email you use to log into the Gold Coast CRM",
                                 required=False, max_length=120)

    def __init__(self, cog: "Onboarding"):
        super().__init__()
        self.cog = cog

    async def on_submit(self, interaction: discord.Interaction) -> None:
        await self.cog.submit_application(
            interaction, str(self.full_name).strip(), str(self.upline).strip(), str(self.email).strip())''',
        '''    email = discord.ui.TextInput(label="Work email (same as your Gold Coast CRM)",
                                 placeholder="The exact email you use to log into the Gold Coast CRM",
                                 required=False, max_length=120)
    commission = discord.ui.TextInput(label="Current commission % (at your current IMO)",
                                      placeholder="e.g. 110 - the contract level you're at today",
                                      required=False, max_length=10)

    def __init__(self, cog: "Onboarding"):
        super().__init__()
        self.cog = cog

    async def on_submit(self, interaction: discord.Interaction) -> None:
        await self.cog.submit_application(
            interaction, str(self.full_name).strip(), str(self.upline).strip(), str(self.email).strip(),
            str(self.commission).strip())''',
    ),
    # 2. Founder invite dropdown ceiling: 75..120 -> 75..155
    (
        "LEVEL_OPTIONS = [75, 80, 85, 90, 95, 100, 105, 110, 115, 120]",
        '''# 75..155 in steps of 5. Ceiling mirrors the CRM's 160 contract-level ceiling
# minus the 5% minimum spread; the CRM API still rejects anything above the
# chosen upline's level - 5, so an over-pick fails loudly rather than silently.
LEVEL_OPTIONS = [*range(75, 160, 5)]''',
    ),
    # 3. submit_application signature
    (
        '    async def submit_application(self, interaction: discord.Interaction, name: str, upline: str, email: str) -> None:',
        '''    async def submit_application(self, interaction: discord.Interaction, name: str, upline: str, email: str,
                                 commission: str = "") -> None:''',
    ),
    # 4. Application card: show the stated commission to founders
    (
        '''                {"name": "Name", "value": name or "—", "inline": True},
                {"name": "Upline", "value": upline_field, "inline": True},
                {"name": "Work Email", "value": email or "—", "inline": False},''',
        '''                {"name": "Name", "value": name or "—", "inline": True},
                {"name": "Upline", "value": upline_field, "inline": True},
                {"name": "Stated Commission", "value": ("%s%%" % commission.rstrip("%")) if commission else "—", "inline": True},
                {"name": "Work Email", "value": email or "—", "inline": False},''',
    ),
    # 5. open_crm_modal: parse the stated commission off the card
    (
        '''        upline_name = (fields.get("Upline", "") or "").split(" — ")[0].strip()''',
        '''        upline_name = (fields.get("Upline", "") or "").split(" — ")[0].strip()
        stated_raw = fields.get("Stated Commission", "") or ""
        stated_digits = "".join(ch for ch in stated_raw if ch.isdigit())
        stated_commission = int(stated_digits) if stated_digits and 0 <= int(stated_digits) <= 200 else None''',
    ),
    # 5b. pass it into the view
    (
        '''            view=CRMInviteView(self, first, last, email if email != "—" else "", uplines, default_id),''',
        '''            view=CRMInviteView(self, first, last, email if email != "—" else "", uplines, default_id,
                               stated_commission=stated_commission),''',
    ),
    # 6. CRMInviteView stores it
    (
        '''    def __init__(self, cog: "Onboarding", first: str, last: str, email: str,
                 uplines: list, default_upline_id: str | None = None):
        super().__init__(timeout=300)
        self.cog = cog
        self.first = first
        self.last = last
        self.email = email
        self.role = "sales_agent"
        self.upline_id = default_upline_id
        self.level = 80''',
        '''    def __init__(self, cog: "Onboarding", first: str, last: str, email: str,
                 uplines: list, default_upline_id: str | None = None,
                 stated_commission: int | None = None):
        super().__init__(timeout=300)
        self.cog = cog
        self.first = first
        self.last = last
        self.email = email
        self.role = "sales_agent"
        self.upline_id = default_upline_id
        self.level = 80
        # Applicant's self-reported commission at their current IMO (from the
        # apply modal) — forwarded to the CRM as currentCommissionLevel.
        self.stated_commission = stated_commission''',
    ),
    # 7. Invite payload carries it to the CRM
    (
        '''        payload = {"firstName": view.first, "lastName": view.last or view.first, "email": view.email,
                   "phone": None, "role": role, "uplineId": view.upline_id, "contractLevel": view.level}''',
        '''        payload = {"firstName": view.first, "lastName": view.last or view.first, "email": view.email,
                   "phone": None, "role": role, "uplineId": view.upline_id, "contractLevel": view.level,
                   "currentCommissionLevel": view.stated_commission}''',
    ),
]


def main() -> int:
    with open(PATH, encoding="utf-8") as f:
        src = f.read()

    if "Stated Commission" in src and "stated_commission" in src:
        print("Already applied — nothing to do.")
        return 0

    missing = [old.splitlines()[0] for old, _ in REPLACEMENTS if old not in src]
    if missing:
        print("ABORT — file has drifted; these anchors were not found:")
        for m in missing:
            print("  ·", m.strip()[:80])
        return 1
    dupes = [old.splitlines()[0] for old, _ in REPLACEMENTS if src.count(old) > 1]
    if dupes:
        print("ABORT — ambiguous anchors (appear more than once):")
        for d in dupes:
            print("  ·", d.strip()[:80])
        return 1

    shutil.copyfile(PATH, PATH + ".bak")
    for old, new in REPLACEMENTS:
        src = src.replace(old, new, 1)
    with open(PATH, "w", encoding="utf-8") as f:
        f.write(src)
    print("Applied 8 changes to", PATH)
    print("Backup at", PATH + ".bak")
    print("Now restart the bot for the new modal + dropdown to take effect.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
