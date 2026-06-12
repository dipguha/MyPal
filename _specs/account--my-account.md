# Spec — My Account

## 1. Overview (required)

**Feature name:** My Account  
**Module / nav location:** My Account (top-level area, accessed via avatar/profile icon in the top nav)  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-27 16:22

### Problem statement
Family members need a single, clearly organised place to manage their personal details, identity documents, household membership, app preferences, access control, and account security. Without this, critical personal data is scattered and access management is opaque to household managers.

### User-facing goal
As a household member, I want to view and update my personal details, manage my household's membership and permissions, and control my account security — so that my data is accurate, my household is set up correctly, and I feel in control of my privacy.

---

## 2. Scope (required)

### In scope
- My Profile: personal details, hobbies & interests preferences, plan & billing
- Personal identity documents (passport, driving licence, NI number, OCI card, BRP, GHIC, Other) with expiry indicators, file upload/remove, and OCI re-endorsement prompt — fully specified in this document
- Family Members: member list, invite flow, role management, member removal
- Access: per-member, per-module permission overrides (HMG management moved to Family Members)
- Preferences: theme, language & region (Phase 1 read-only), notifications (Phase 2 placeholder)
- Security & Privacy: login methods, active sessions, password change, privacy toggles, data export and account deletion (Phase 2 for export and deletion)
- Two-factor authentication (Phase 2)

### Out of scope
- Full notification configuration — Phase 2 (placeholder shown in Preferences)
- Multi-currency and multilingual support — Phase 2
- Owner succession / ownership transfer — deferred to dedicated spec
- Billing and subscription management UI — Phase 2

### Dependencies
- `_specs/platform--access-control.md` — authoritative roles, permission levels, HMG model, and Access tab design
- Cognito / NextAuth auth layer — password change and login methods interact with Cognito directly
- S3 — document file uploads stored per member; same prefix as avatar
- GDPR data export pipeline — required for data export (Phase 2)

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | My Profile (personal details, identity documents, hobbies & interests, plan summary), Family Members (list, invite, role change, remove, HMG management), Access (per-member permission overrides), Preferences (theme only; language/region/currency as read-only), Security & Privacy (login methods, active sessions, password change, privacy toggles) | Launch |
| Phase 2 | 2FA, enforce-2FA account control, full notification configuration, multilingual support, multi-currency, data export (GDPR), account deletion, billing management | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Owner | Account creator; full access to all modules and account-level controls | Manage household membership, roles, permissions, and billing |
| Admin | Co-manager (e.g. partner); same operational access as Owner, personal data private from Owner | Manage family members and permissions; maintain own profile and security |
| Adult Member | 18+; personal access to own modules by default | Keep own profile accurate; view their own account settings |
| Teenager | 13 to under 18; restricted access; personal data private even from Owner/Admin | Manage own profile and security settings without parental visibility |
| Children | Under 13; no independent login in Phase 1 | Profile managed by Owner/Admin on their behalf |

---

## 4. Roles & access (required)

> Refer to `_specs/platform--access-control.md` for full role definitions and the permission model.

| Capability | Owner | Admin | Adult Member | Teenager | Children |
|------------|:-----:|:-----:|:------------:|:--------:|:--------:|
| View own My Profile | ✓ | ✓ | ✓ | ✓ | — |
| Edit own My Profile | ✓ | ✓ | ✓ | ✓ | — |
| View Child's My Profile | ✓ | ✓ | ✗ | ✗ | — |
| View Family Members list | ✓ | ✓ | ✗ | ✗ | ✗ |
| Invite / remove members | ✓ | ✓ (not Owner) | ✗ | ✗ | ✗ |
| Change member roles | ✓ | ✓ (not Owner) | ✗ | ✗ | ✗ |
| Manage HMG membership (Family Members tab) | ✓ | ✓ | ✗ | ✗ | ✗ |
| Set per-member permissions (Access tab) | ✓ | ✓ | ✗ | ✗ | ✗ |
| View / edit own Preferences | ✓ | ✓ | ✓ | ✓ | ✗ |
| View / edit own Security & Privacy | ✓ | ✓ | ✓ | ✓ | ✗ |
| Delete household account | ✓ | ✗ | ✗ | ✗ | ✗ |
| Delete own membership | ✓ | ✓ | ✓ | ✓ | ✗ |

**Access exceptions:**
- Teenagers' My Profile is private from Owner and Admin — consistent with the Teenager privacy model throughout the app.
- Children's My Profile (including identity documents, Phase 2) is visible to Owner/Admin — consistent with the under-13 parental oversight model.
- Owner cannot change their own role; only another Owner can transfer ownership (deferred to Phase 2 succession spec).
- Admin cannot demote or remove the Owner.

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

### My Profile

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Each member can view and edit their own personal details (full name, display name, avatar, date of birth, email, phone number, home address) | P0 | Saving updates are reflected immediately; email shown read-only with a note to change via Security & Privacy |
| F-02 | Each member can select and deselect hobbies & interests from a fixed tag list | P0 | Selections persist; MyPal AI uses them to personalise content in Today · Daily Briefing |
| F-03 | Owner sees a My Plan card showing plan name, monthly cost, next renewal, member count, and payment method | P0 | Card shows correct plan tier label — "Individual" (£2.99/mo) or "Family" (£4.99/mo); never the raw enum |
| F-04 | Owner sees a Billing History section (collapsible, collapsed by default) showing the last 12 months of invoices with date, description, amount, status, and a Receipt link | P1 | Collapsed by default; expands on tap; receipts link to the relevant invoice |
| F-05 | MyPal AI shows a profile completion nudge when the profile is incomplete | P2 | Nudge lists what is missing; links to the relevant section; dismissed once complete |

### Identity Documents

The Identity Documents section lives within My Profile as a collapsible card, collapsed by default. It supports seven document types, each with its own fields and behaviours.

**Document types and fields:**

| Type | Fields | Expiry? | File upload? |
|------|--------|---------|-------------|
| Passport | Country of issue, Passport number, Expiry date | Yes | Yes |
| Driving Licence | Country of issue, Licence number, Expiry date, Licence categories | Yes | Yes |
| National Insurance | NI number | No | No |
| BRP | BRP number, Expiry date | Yes | Optional |
| GHIC | Card number, Expiry date | Yes | Optional |
| OCI Card | OCI number | No (see below) | Optional |
| Other | Document name (freeform), Reference number (optional), Expiry date (optional) | Optional | Optional |

**Expiry indicator rules (applied to the dot on each document row):**
- Green — valid; more than 3 months until expiry
- Amber — expiring within 3 months
- Grey — no expiry date (NI number, OCI card)

**OCI Card special rule:** OCI cards do not expire and have no expiry field. However, when a member saves a new or updated passport, the app shows a prompt: *"You have an OCI card on file — remember to get it re-endorsed with your new passport before you travel."* This prompt is informational only; the member dismisses it manually.

**Collapsed card header:** When collapsed, the card header shows an amber badge reading "X expiring soon" if any documents are within 3 months of expiry. The badge is hidden when the card is expanded.

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-06 | Each member can view their stored identity documents in a collapsible card within My Profile, collapsed by default | P0 | Card shows all stored documents as rows with expiry dot, document name, and summary line; "X expiring soon" badge visible in header when collapsed and any doc is within 3 months of expiry |
| F-07 | Each member can add a new identity document via a modal, with type-appropriate fields | P0 | Modal pre-sets fields based on document type; date picker used for expiry fields; file upload available where applicable; saving stores the document and adds it to the card |
| F-08 | Each member can edit an existing identity document via a modal, with fields pre-filled | P0 | Modal opens with current values; date picker shows existing expiry; existing file shown with a Remove option; saving updates the record |
| F-09 | File upload accepts PDF, JPG, and PNG; uploaded file name is shown with a Remove option | P0 | Clicking "Upload file…" opens the OS file picker; on selection the filename renders immediately; Remove clears the file; re-upload is possible after removing |
| F-10 | Expiry date fields use a date picker control | P0 | Native date picker rendered; existing dates pre-populated correctly; no free-text expiry entry |
| F-11 | When a passport is saved and the member has an OCI card on file, the OCI re-endorsement prompt is shown | P1 | Prompt appears after saving passport; member can dismiss it; prompt does not block saving |

### Family Members

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-12 | Owner and Admin can view the full household member list showing display name, role, age (for Adult/Teen/Child), HMG badge, and status | P0 | All members shown; current user marked "(You)"; correct data per member |
| F-13 | Owner and Admin can invite a new member by entering their full name, email address, and assigning a role (Adult, Teen, Child) | P0 | Invitation email sent; invited member appears in list with "Invited" status until accepted |
| F-14 | Owner and Admin can change a member's role, with confirmation | P0 | Role change takes effect immediately; affected member's access updates within their next request |
| F-15 | Owner and Admin can remove a member, with confirmation listing what they will lose | P0 | Member loses app access immediately; data retained for 30 days (soft-delete); household shared items they created remain attributed but anonymised |
| F-16 | Owner and Admin can view the current HMG member list and add eligible Adult Members to HMG with a confirmation dialog | P0 | Confirmation dialog lists the three capabilities the member gains; change takes effect immediately |
| F-17 | Owner and Admin can remove an Adult Member from HMG with a confirmation dialog | P0 | Confirmation dialog lists the three capabilities the member loses; change takes effect immediately |

### Access

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-18 | Owner and Admin can select any household member and view/override their permission level (None / View / Edit) for each non-locked module | P0 | Permissions panel defaults to the current user's chip on landing; locked modules shown read-only with lock icon and explanation |
| F-19 | The permissions panel visually distinguishes default permission levels from custom overrides, and provides a Reset action per module; changes are staged until explicitly saved | P1 | "Custom" badge shown only after saving an override (not while pending); "Reset" restores the role default; a permanent Save/Discard bar is always visible — Save commits all pending changes, Discard reverts to last saved state; a "✓ Permissions saved" toast appears for 2 seconds after Save |
| F-20 | Permission changes are logged with actor, target member, module, before state, and after state | P0 | Every change recorded in `access_log` (backend only; no UI history view); see `_specs/platform--access-control.md` for schema |

### Preferences

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-21 | Each member can switch between Light, Dark, and System theme | P0 | Theme applies immediately across the app; preference persists on next login |
| F-22 | Language, date format, currency, and time zone are shown as read-only in Phase 1 with a "Coming in a future update" label | P0 | No edit controls rendered; values shown as English (UK), DD-Mon-YYYY, GBP (£), Europe/London |
| F-23 | Notifications section is shown in Preferences as a Phase 2 placeholder (greyed, non-interactive) | P1 | Section visible but disabled; "✦ Phase 2" badge present; no functional controls |

### Security & Privacy

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-24 | Each member can view their active sessions (device, browser, approximate location, last active) and revoke any session other than their current one | P0 | Current session labelled; Revoke terminates the session immediately; revoked session cannot be used again |
| F-25 | Each member can change their password via a form (current password + new password + confirm) | P0 | Cognito password updated on save; error shown if current password incorrect or new passwords do not match |
| F-26 | Each member can link or manage their login methods (Email, Google, Phone/SMS, Apple) | P1 | Linked methods shown with status; unlinked methods show "Link" action |
| F-27 | Each member sees privacy toggles for in-app sharing preferences (e.g. share health summary with family, journal visible to partner) | P1 | Toggles persist; affect visibility of the relevant data immediately |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | Owner | invite a new family member by email and assign their role | they can join our household and access the right modules |
| US-02 | Owner | set per-module permissions for each family member | I can control exactly what each person can see and do |
| US-03 | Owner | add a trusted adult to the Household Managers Group from Family Members | they can help manage the household's shared items and Children's data |
| US-04 | Admin | manage family members without being able to affect the Owner's account | I can maintain the household without overstepping |
| US-05 | Adult Member | update my display name and avatar | other family members see the right name for me |
| US-06 | Adult Member | select my hobbies and interests | MyPal AI shows me relevant suggestions in my daily briefing |
| US-07 | Any member | see all my active sessions and revoke ones I don't recognise | I can keep my account secure |
| US-08 | Owner | see my plan details and billing history | I can track what I'm being charged and download receipts |
| US-09 | Any member | store my passport, driving licence, and other identity documents with expiry dates | I get a heads-up before anything expires and can find the details quickly when I need them |
| US-10 | Any member | upload a scan of my identity document alongside the details | I have a digital copy stored securely in one place |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | My Profile and Family Members tabs load in < 500ms |
| NF-02 | Accessibility | WCAG 2.1 AA — all interactive elements keyboard-accessible; role/permission dropdowns operable without a mouse |
| NF-03 | Data retention | Removed members' data retained for 30 days (soft-delete) before permanent deletion |
| NF-04 | Privacy enforcement | Access rules enforced server-side; Teenager profile data not accessible via API by Owner/Admin |
| NF-05 | Permission propagation | Permission changes take effect within the member's next API request — no stale access |
| NF-06 | Audit logging | All role changes, HMG changes, and permission overrides logged with actor, target, before state, after state, and timestamp — see `_specs/platform--access-control.md` §6 |
| NF-07 | Security | Password change and session revocation interact with Cognito directly; no passwords stored in our DB |

---

## 7. User flows (required)

### Happy path — Owner invites a new family member
1. Owner opens My Account → Family Members tab
2. Taps "+ Invite family member"
3. Enters full name and email address; selects role (Adult / Teen / Child)
4. Taps "Send invite" — invitation email sent; new member appears in list with "Invited" status
5. Invitee accepts via email link → status updates to Active; default permissions apply for their role

### Happy path — Owner sets a custom permission for a member
1. Owner opens My Account → Access tab
2. Access tab opens with the current user's chip selected by default; Owner selects a different member from the chip strip
3. Expands the relevant module group (e.g. Finance)
4. Changes the dropdown for a module (e.g. Budget Envelopes) from "None" to "View"
5. Taps "Save changes" in the permanent Save/Discard bar; "✓ Permissions saved" toast appears for 2 seconds
6. "Custom" badge appears on the Budget Envelopes row; member can now view Budget Envelopes

### Happy path — Owner adds an Adult Member to HMG
1. Owner opens My Account → Family Members tab
2. Sees the HMG card; eligible Adult Members count shown on "+ Add" button
3. Taps "+ Add"; if one eligible adult, confirmation dialog shown immediately; if multiple, a picker opens first
4. Confirmation dialog lists three things the member will gain; Owner confirms
5. Member added to HMG immediately; their card appears in the HMG list with date added

### Happy path — Member adds a new identity document
1. Member opens My Account → My Profile tab
2. Expands the Identity Documents card
3. Taps "+ Add GHIC" (or any other un-added type)
4. Modal opens with type pre-set and fields empty
5. Member enters card number, selects expiry date via date picker, optionally uploads a file
6. Taps "Add document" — modal closes; new document row appears in the card with appropriate expiry dot

### Happy path — Member edits an existing identity document
1. Member opens My Account → My Profile tab
2. Expands the Identity Documents card
3. Taps "Edit" on their Driving Licence row
4. Modal opens with all fields pre-filled; expiry date shown in date picker; existing file shown with Remove option
5. Member updates the expiry date; taps "Save" — modal closes; row updates immediately

### Happy path — Member removes a document file and re-uploads
1. Member opens the edit modal for an existing document
2. Taps "Remove" next to the uploaded file — filename clears immediately
3. Taps "Upload file…" — OS file picker opens
4. Selects a new file — filename renders in the upload area
5. Taps "Save" — new file stored; old file deleted

### Error / edge paths — identity documents
- **Passport saved with OCI card on file:** OCI re-endorsement prompt shown after save; member dismisses it; no blocking
- **File type not accepted:** OS file picker filters to PDF, JPG, PNG only; unsupported types not selectable
- **Expiry date in the past:** Accepted (member may be recording a recently expired document); expiry indicator shows red

### Happy path — Member changes their theme
1. Member opens My Account → Preferences tab
2. Expands Appearance section
3. Selects "Dark" from Light / System / Dark options
4. Theme switches immediately across the entire app; preference persisted

### Error / edge paths
- **Invite to an email already in the household:** Error shown — "This email is already a member of your family"
- **Role change to Owner attempted by Admin:** Not available in the UI — Owner role is not offered in Admin's role-change control
- **Remove member who is the last Admin:** Allowed, with a warning if Owner has no other Admin; does not block the action
- **Session revoke fails (network error):** Error toast shown; session remains active; user can retry
- **Permission change on a locked module:** UI shows lock icon with tooltip; no dropdown rendered; change not possible
- **Removing a member from HMG when they are the only non-Owner HMG member:** Allowed; HMG reverts to Owner-only; confirmation dialog lists what the member will lose

---

## 8. Data model

Key fields managed by this feature. Implementation detail and full schema in Alembic revisions and `mypal-schema.sql`.

### `members` table (existing — key fields for My Profile)

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `full_name` | Member's full name | Yes | |
| `display_name` | Name shown to other household members | Yes | |
| `avatar_url` | S3 path to avatar image | No | |
| `date_of_birth` | Date of birth | No | Not surfaced outside My Profile |
| `phone_number` | Phone number | No | |
| `home_address` | Free text home address | No | |

### `member_identity_documents` table (new)

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Primary key | Yes | UUID |
| `member_id` | FK → members | Yes | |
| `doc_type` | Document type | Yes | Enum: `passport`, `driving_licence`, `national_insurance`, `brp`, `ghic`, `oci_card`, `other` |
| `doc_label` | Freeform label for "Other" type | No | Only used when `doc_type = other` |
| `country` | Country of issue | No | Passport and Driving Licence only |
| `number` | Document number / reference | No | |
| `expiry_date` | Expiry date | No | Null for NI and OCI Card; optional for Other |
| `categories` | Licence categories | No | Driving Licence only (e.g. "B, BE") |
| `file_key` | S3 object key for uploaded scan | No | Null if no file uploaded |
| `created_at` | UTC timestamp | Yes | |
| `updated_at` | UTC timestamp | Yes | |

### `member_interests` table (new)

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `member_id` | FK → members | Yes | |
| `interest_tag` | Interest tag string (e.g. "⚽ Football") | Yes | From a fixed tag list; validated server-side |

### `member_preferences` table (new)

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `member_id` | FK → members | Yes | |
| `theme` | UI theme | Yes | Enum: `light`, `dark`, `system`; default `system` |

### `member_module_permissions` table (existing — from `_specs/platform--access-control.md`)

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `member_id` | FK → members | Yes | |
| `module_key` | Module identifier | Yes | e.g. `budget_envelopes`, `journal` |
| `permission` | Override level | Yes | Enum: `none`, `view`, `edit`; no row = role default applies |

### `access_log` table (existing — from `_specs/platform--access-control.md`)

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `actor_id` | Member who made the change | Yes | |
| `action` | Type of change | Yes | Enum: `role_changed`, `hmg_member_added`, `hmg_member_removed`, `permission_overridden`, `permission_reset`, `member_removed`, etc. |
| `target_id` | Member affected | Yes | |
| `before` | Previous state | Yes | JSON |
| `after` | New state | Yes | JSON |
| `created_at` | UTC timestamp | Yes | |

---

## 9. UI / UX considerations

**UI reference:** `_UI/ui_working/mypal-app-working.jsx` — search for `function AccountScreen` and `function AccessTabContent`. The five tabs are `My Profile`, `Family Members`, `Preferences`, `Access`, and `Security & Privacy`, rendered via a `nav-tabs` strip.

**My Profile tab:** Cards appear in this order:
1. Personal identity card — avatar, name, email/phone, home address, date joined, account type. Avatar uses a gradient placeholder until a photo is uploaded.
2. Identity Documents card — collapsible, collapsed by default. Header shows an amber "X expiring soon" badge when any document is within 3 months of expiry; badge is hidden when expanded. Each stored document appears as a row with a colour-coded dot (green = valid, amber = expiring within 3 months, grey = no expiry), document name, and a summary line. Un-added document types appear as "+ Add [type]" rows below. Edit and Add both open the identity document modal (see below).
3. Hobbies & Interests card — tag grid with active selections highlighted; powers MyPal AI personalisation.
4. My Plan card — collapsible, collapsed by default; header shows "Family · Active" or "Individual · Active" summary. Owner only.
5. Billing History card — collapsible, collapsed by default. Owner only.
6. MyPal AI nudge strip — profile completion prompt.

**Identity document modal:** Shared modal for both Edit and Add flows. Title reads "Edit [type]" or "[type]" for add. Subtitle is a one-line description of the document type. Fields are type-specific (see functional requirements table). Expiry date fields use a native `<input type="date">` with `colorScheme: dark` for correct dark-theme rendering; existing dates pre-converted from DD-Mon-YYYY to YYYY-MM-DD for the input. File upload uses a hidden `<input type="file" accept=".pdf,.jpg,.jpeg,.png">` triggered by the "Upload file…" button; once a file is selected the filename renders with a Remove link. Remove clears the file state and resets the file input so re-upload is possible. Primary button reads "Save" in edit mode and "Add document" in add mode. Backdrop click or ✕ closes the modal.

**Family Members tab:** Single card listing all household members as rows — avatar, name, role, age, HMG badge (if applicable), and a "Manage" button per non-self member. The current user's row shows a "(You)" label instead of a Manage button. Invite and Refer a friend actions sit below the list.

**Invite modal:** Full name, email, and role selector (Adult / Teen / Child). Triggered by "+ Invite family member". Sends an invitation email on submit; invited member appears in the list with "Invited" status. Role labels in the modal must use the user-facing names — Adult Member, Teenager, Children — not role enum values.

**Access tab:** Permissions-only — no HMG card (HMG management is in the Family Members tab). The tab opens with the current user's chip selected by default in the member chip strip; selecting a different chip loads that member's module permission view. Owner/Admin targets show a read-only banner ("Every module is Manage by definition"). All other roles show five collapsible module groups (Life Admin, Finance, Health, Recipes & Groceries, Travel), all collapsed by default with a count of custom overrides in the group header. Each module row shows: icon, name, lock icon for locked modules, a "Custom" badge + "Reset" link when an override has been saved, and either a read-only level badge (locked) or a None / View / Edit dropdown. Finance group hidden entirely for Children. A "What do these mean?" toggle above the groups reveals plain-English descriptions of each permission level. A permanent Save/Discard bar sits at the bottom of the permissions card — always visible regardless of whether changes are pending. Tapping "Save changes" commits all pending overrides, triggers a "✓ Permissions saved" toast for 2 seconds, and updates the Custom badges to reflect the saved state. Tapping "Discard" reverts all pending changes to the last saved state. The Custom badge reflects the saved state only — a pending (unsaved) override does not show the badge.

**HMG confirmation dialogs (Family Members tab):** Before adding, the dialog lists three things the member will gain: (1) see items assigned to HMG across every module; (2) HMG-level assignment rights; (3) see Children's items regardless of who they were assigned to. Before removing, it lists three things they will lose. Requires an explicit confirm button click.

**Preferences tab:** Three collapsible sections — Language & Region, Appearance, Notifications. Language & Region and Notifications are read-only / Phase 2 in Phase 1. Appearance contains the Light / System / Dark theme selector. Collapsible sections use a chevron toggle; Language & Region opens by default.

**Security & Privacy tab:** Cards for Login Methods, Two-Factor Authentication (Phase 2 — greyed with badge), Active Sessions, Password, Privacy Settings, and Your Data (Phase 2 — greyed with badge). Active Sessions shows device, browser, approximate location, and last active time; current session labelled "Current", others show a "Revoke" button.

**Empty states:** If a household has only one member, the Family Members tab shows the owner row with an invite prompt and no Manage buttons. If no interests are selected, Hobbies & Interests shows the full available tag list with a prompt to choose some.

**Plan tier copy:** My Plan must always show the user-facing label — "Individual" for the `solo` DB tier and "Family" for the `family` DB tier — never the raw enum value.

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| Cognito | Phase 1 | Password change and login method management hit Cognito directly via the BFF; tokens never stored in our DB |
| S3 | Phase 1 | Avatar image upload and identity document scans (PDF, JPG, PNG); stored per-member under the account's S3 prefix; access controlled via pre-signed URLs |
| GDPR data export pipeline | Phase 2 | Generates a JSON/CSV bundle of the member's personal data |
| Push notifications | Phase 2 | Required for the Notifications preference section to be functional |
| Stripe / billing | Phase 2 | My Plan card in Phase 1 is read-only display; billing management deferred |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Profile completion rate | ≥ 70% of members complete personal details (name, display name, avatar) within 7 days of joining | Profile completeness score tracked per member |
| Interest selection | ≥ 50% of active members select at least 3 interests within 14 days | `interest_tag` row count per member |
| HMG extension rate | Track ratio of Family plan households where an Adult Member is added to HMG | `hmg_member_added` events per family account |
| Permission override rate | Track % of households that customise at least one module permission | `permission_overridden` events per account |
| Zero privilege escalation incidents | 0 cases of a member accessing data their role does not permit | Server-side 403 rate on protected endpoints |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Access rules enforced server-side for all five roles — including Teenager profile privacy from Owner/Admin
- [ ] Permission overrides apply within the member's next API request (no stale access)
- [ ] All role changes, HMG changes, and permission overrides logged to `access_log`
- [ ] Empty states handled (single-member household, no interests selected)
- [ ] Plan tier labels show "Individual" / "Family" — never the raw DB enum
- [ ] Mobile layout reviewed at 375px viewport
- [ ] WCAG 2.1 AA verified for interactive elements (dropdowns, toggles, chip strip)
- [ ] Open questions resolved or deferred with a decision recorded

---

## 13. Open questions

- [x] Identity documents — promoted to Phase 1. Collapsible card in My Profile with full modal (edit + add), date picker, file upload/remove, expiry indicators, and OCI re-endorsement prompt. Resolved 2026-05-24.
- [ ] Owner succession / ownership transfer flow — deferred to a dedicated spec; should that spec be written before this feature ships, or can ownership transfer be a Phase 2 addition? · Defer for later phase
- [ ] Manage member modal — the "Manage" button on a Family Members row is shown in the prototype but its contents are not fully designed (role change, remove, link to Access). Needs a wireframe or prototype before build. · Dip · target before implementation sprint
- [ ] Children with no email — can Owner/Admin set up a Child profile without an email (no login)? Phase 1 scope to clarify. · Children can be without email.

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-24 09:00 | Dip | Initial draft |
| 0.2 | 2026-05-24 17:13 | Dip | Identity documents promoted to Phase 1; added collapsible card, modal (edit + add), document types/fields table, expiry indicators, file upload/remove, OCI re-endorsement prompt; My Plan card made collapsible; data model, user flows, and UI/UX notes updated accordingly |
| 0.3 | 2026-05-27 16:22 | Dip | HMG management moved from Access tab to Family Members tab; F-16 and F-17 relocated to Family Members section; Access tab is now permissions-only; F-18/F-19 updated to reflect: default chip to current user on landing, staged save/discard pattern (pending changes do not show Custom badge until saved), permanent Save/Discard bar, "✓ Permissions saved" toast (2 s); F-20 clarified as backend-only (no UI history view); user flows, UI/UX notes, scope, phasing, and roles table updated throughout |
