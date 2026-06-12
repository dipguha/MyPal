# MyDigitalPals — UI Design Brief
## App Structure + Health Area
_Version 1.0 · 23-May-2026_

---

## 1. What is MyPal?

MyDigitalPals (MyPal) is a UK family digital assistant web app. It helps households manage life admin, finances, health, and lifestyle in one place. The app is designed for families — multiple members with different roles, different levels of access, and different privacy needs.

**Key conventions:**
- Date format: dd-Mon-yyyy (e.g. 23-May-2026)
- Currency: GBP (£) only
- Hierarchy: **Area → Module → Section** (3 levels only, no sub-modules)

---

## 2. Member Roles

| Role | Description |
|---|---|
| **Owner** | Account creator, full access |
| **Admin** | Co-manager (e.g. partner); same operational access as Owner; personal data private from Owner |
| **Adult Member** | 18+; module access granted per-module by Owner/Admin |
| **Teenager** | 13 to under 18; restricted access; personal data private from Owner/Admin by default |
| **Children** | Under 13; no privacy from Owner/Admin — all data visible to parents |

**Household Managers Group (HMG):** Owner + Admin by default. Trusted Adult Members can be added. Teenagers and Children excluded. HMG is the unit that manages family-wide data.

---

## 3. App Structure — All Areas & Modules

| # | Area | Modules |
|---|---|---|
| 1 | **Today** | Daily Briefing · MyPal AI |
| 2 | **Life Admin** | Tasks · Household Info · Documents · Cars & Home |
| 3 | **Finance** | Overview · Budget Envelopes · Transactions · Bills & Subs · Admin · My Finance |
| 4 | **Health** | Overview · Profiles · Medications · Preventive Care · Emergency Info · Appointments · Journal |
| 5 | **Lifestyle** | Hobbies · Travel · Pet Care · Recipes & Groceries |
| 6 | **My Account** | _(account & settings)_ |

---

## 4. Global Design Patterns

These patterns apply consistently across the app and must be carried through Health:

- **Card-per-member pattern** — modules that hold per-person data (e.g. Profiles, Medications, Preventive Care) show one expandable/unfoldable card per household member.
- **Overdue colour coding** — red (#E57373) for overdue · amber for due ≤7 days · muted for upcoming. Used in Bills & Subs and Preventive Care.
- **Personal-first view** — default view shows the logged-in member's own data. HMG/family view is a secondary layer.
- **Four permission levels** — None / View / Edit / Manage. View and Edit are always configurable per member per module by Owner/Admin.
- **Loose module coupling** — modules link to each other (e.g. Preventive Care → Appointments) but do not auto-complete each other's state. Member initiates cross-module actions.

---

## 5. Health Area — Overview

**Purpose:** Family health management hub. Covers individual health records, medications, preventive care tracking, emergency information, appointments, and personal wellbeing journalling.

**Privacy model (personal-first):**
- Adults and Teenagers own their health data; private by default; can opt in to share with HMG
- Children's health data always visible to HMG — not configurable
- HMG cannot force-share any member's health data; sharing is always the member's choice

**7 modules:**
1. Overview
2. Profiles
3. Medications
4. Preventive Care
5. Emergency Info
6. Appointments
7. Journal

---

## 6. Health Modules — Detailed Design

---

### 6.1 Overview

**Purpose:** Family health dashboard — a snapshot of what needs attention right now.

**Behaviour:**
- Always shows a full summary — no empty/all-clear state
- HMG sees family-wide view (all members they have access to)
- Individuals see their own summary only

**Sections (4 always-visible summary cards):**
1. **Medications due for reorder** — medications with a reorder date approaching or overdue, or flagged as running low
2. **Preventive care due / overdue** — items from Preventive Care module using the same red/amber/muted colour coding
3. **Upcoming appointments this week** — appointments from the Appointments module in the next 7 days
4. **Active critical flags** — severe allergies and critical conditions flagged in Profiles

---

### 6.2 Profiles

**Purpose:** Per-member health records — the foundational health record for each family member.

**Pattern:** Card-per-member. Each card shows the member's name and any critical allergy flags visibly before unfolding.

**Allergy flag:** Life-threatening / severe allergies surface as a visible flag on the card face (before unfolding) — critical for quick carer reference.

**Each card unfolds into 4 sections:**
1. **Medical Info** — conditions, blood type, NHS number
2. **Allergies** — food / drug / environmental; each entry has a severity rating; life-threatening flagged prominently
3. **Vaccination History** — vaccine name + date given (static record; upcoming boosters live in Preventive Care — the two are linked by vaccine type + member)
4. **Care Details** — GP, dentist, optician, specialists; multiple providers per type allowed (e.g. NHS GP + private paediatrician both listed); NHS and private providers included

**Scope:** Household members only (no external dependants such as elderly parents not in the household).

**Access:** HMG manages children's profiles. Adults and teenagers manage their own; can share with HMG.

---

### 6.3 Medications

**Purpose:** Track current and historical medications for each family member.

**Pattern:** Card-per-member. Each card shows active medications with reorder flag visible.

**Each card has 3 sections:**
1. **Current Medications** — name, dosage, frequency, start date, prescriber
2. **Prescription Details** — pharmacy, type (NHS / private / OTC), reorder date
3. **History** — discontinued medications; stopping a medication moves it to History, never deleted

**Key behaviours:**
- OTC (over-the-counter) medications tracked alongside prescriptions
- Reorder reminder: triggered by date (manually set reorder date) OR "running low" toggle — whichever comes first
- Children: HMG adds and edits; child can view but not edit

---

### 6.4 Preventive Care

**Purpose:** Track recurring health maintenance items — when they're due and when they were last done.

**Pattern:** Card-per-member. Same colour coding as Bills & Subs (red/amber/muted).

**5 sections:**
1. **Dental** — check-up cycle tracking
2. **Optician** — eye test cycle tracking
3. **Screenings** — NHS and private health screenings; manual entry only in Phase 1
4. **Vaccinations Due** — upcoming boosters; linked from Profiles vaccination history by vaccine type + member
5. **Custom** — any other recurring health maintenance the member wants to track

**Key behaviours:**
- Auto-calculates next due date from last visit + cycle length; manual override available
- Colour coding: red (overdue) · amber (due ≤7 days) · muted (upcoming)
- **"Mark as Booked" flow:** creates an Appointment entry automatically; Preventive Care item updates to "Booked — [date]" status (bi-directional link)
- **Tasks link:** member-initiated only — "Add to Tasks" button available; no auto-creation; no auto-complete when Appointment is created (modules stay loosely coupled)

---

### 6.5 Emergency Info

**Purpose:** A curated, shareable health summary per member — designed for carers and emergency situations.

**4 sections:**
1. **Critical Flags** — severe / life-threatening allergies and critical conditions (pulled from Profiles)
2. **Current Medications** — live pull from Medications module (always reflects current state)
3. **Emergency Contacts** — GP, specialist, parent/guardian
4. **Care Notes** — free-text carer instructions

**Shareable link:**
- Read-only, view-only access for people outside the household
- No login required for recipient — link-based access only
- Live data — always reflects current health info at time of opening, not a static snapshot
- Expires automatically after 24 hours
- Revocable — HMG or the member can cancel before expiry

**Who can generate the link:**
| Member type | Who generates |
|---|---|
| Children | HMG on their behalf |
| Teenager (private data) | Teenager only |
| Teenager (data shared with HMG) | HMG can generate |
| Adults | Themselves |

---

### 6.6 Appointments

**Purpose:** Health appointment records — past and future — for all family members.

**3 sections:**
1. **Upcoming** — future appointments, sorted by date
2. **Past** — completed appointments; member can add outcome notes post-appointment
3. **All Members View** — HMG can filter by member; individuals see their own only

**Fields per appointment:** date · time · provider · member · location · reason · type

**Appointment types:** GP · Dentist · Optician · Physio · Hospital · Specialist · Other

**Key behaviours:**
- Outcome notes: private by default; same sharing rules as rest of Health
- **Preventive Care link (bi-directional):** "Mark as Booked" in Preventive Care pre-fills a new Appointment; the Preventive Care item updates to "Booked — [date]" status
- Appointments is not replaced by Tasks — distinct data model with location, provider, history, and outcome notes; Tasks handles appointment prep actions only

---

### 6.7 Journal

**Purpose:** Personal wellbeing and emotional reflection journal. Hybrid format — structured prompts for those who want guidance, free text for those who don't. Focus: mental health, what makes you happy/sad/anxious, self-improvement, reflection.

**4 sections:**

**My Journal** — the main entry feed, newest first. Each entry contains:
- Mood rating (5-point: great / good / okay / low / anxious) — optional
- Prompt selected from library — optional
- Free text — optional
- 1 photo — optional (one photo per entry, intentional limit to encourage choosing the most meaningful image)
- Date (always recorded)
_At minimum an entry can be just a mood tap. Write new entry button always visible._

**Prompts** — fixed library of reflection starters, organised by theme:
- _Mood & Feelings_ — e.g. "What made you feel good today?", "What's weighing on you?"
- _Self-awareness_ — e.g. "What would you do differently?", "What pattern have you noticed about yourself?"
- _Growth_ — e.g. "What's an improvement area you're working on?", "What are you proud of?"
Tapping a prompt starts a new entry pre-filled with that prompt.

**Mood Trends** — colour-coded visual chart of mood ratings over the last 30 days. No interpretation or nudges — just the pattern, so members can notice their own trends.

**Memories** — visual photo grid of all photos across all entries, newest first. A personal scrapbook view. Tapping a photo opens the full entry it belongs to.

**Privacy:**
- Adults and Teenagers: private by default; can opt in to share with HMG
- Children: HMG access by default (consistent with child privacy model across all Health modules)

---

## 7. Health Access Control (Summary)

The personal-first model means the primary question is not just permission level but *whose data* is visible:

- **Adults:** own their health data across all 7 modules; private by default; opt-in HMG sharing per module
- **Teenagers:** same as Adults — private by default; opt-in sharing
- **Children:** all health data visible to HMG; not configurable
- **HMG (Owner/Admin):** manages children's data; sees adult/teenager data only if that member has shared it
- **No forced sharing:** Owner/Admin cannot override a member's health data privacy — sharing is always member-initiated

---

_End of brief_
