# MyDigitalPals — Product Terminology Reference

> This is the canonical naming reference for MyPal. All specs, plans, code comments, and user-facing copy should use these terms consistently.
> When writing a spec, link here rather than redefining terms inline.
> **Last updated:** 2026-05-30

---

## App structure

The app is organised into five structural levels:

| Level | Term | Definition | Examples |
|-------|------|------------|---------|
| 1 | **Area** | Top-level navigation section grouping related modules | Today, Life Admin, Finance, Health |
| 2 | **Module** | A discrete functional unit within an area; has its own tab/route | Tasks, Documents, Budget Envelopes, Medications |
| 3 | **Section** | A named structural split within a module; persistent and meaningful | My Tasks · Family Tasks; My Health · Family Health |
| 4 | **Group** | A sub-division within a section, typically computed or dynamic | Today · This Week · Later; Upcoming · Overdue · Completed |
| 5 | **Item** | A single record or entry within a group (or section if no groups) | A task, a document, a journal entry, a medication log |

Not every module uses all five levels. A simple module may have no Sections or no Groups. Use only the levels that are meaningful for the content.

### Usage in sentences
> "The **Tasks** module (in the **Life Admin** area) has sections including **My Tasks** and **Family Tasks**. Each section groups items into **Today**, **This Week**, and **Later**. Each entry in those groups is a task **item**."

> "The **Budget Envelopes** module (in the **Finance** area) has no sections — items are listed flat within groups."

### Section vs Group — the key distinction

**Sections** are structural and permanent. They represent a meaningful split in the data (e.g. "mine vs the family's", "active vs archived"). Users may switch between sections via tabs or a toggle. Sections are defined in the product design, not computed at runtime.

**Groups** are dynamic and computed. They organise items within a section based on a rule that changes over time (e.g. due date, status, category). The system determines which group an item belongs to automatically.

### How this maps to code
- Area → top-level route group (e.g. `/life-admin/*`)
- Module → page component and route (e.g. `/life-admin/tasks`)
- Section → a persistent view split, often rendered as tabs or a toggle
- Group → a collapsible or labelled cluster within a section
- Item → a data record returned by the API; rendered as a row or card

---

## Areas and modules

Current confirmed area and module structure. Phase 2 items noted.

| Area | Modules | Notes |
|------|---------|-------|
| **Today** | Daily Briefing | Aggregated cross-module view; not a content-entry area |
| **Life Admin** | Tasks · Household Info · Documents · Cars & Home · Pet Care | Core household admin |
| **Finance** | Overview · Budget Envelopes · Transactions · Bills & Subs · Finance Admin · My Finance | Finance Admin locked to Owner/Admin |
| **Health** | Profiles · Medications · Appointments · Emergency Info · Journal | Personal-first privacy model. Overview is a persistent collapsible header panel above the tab strip — not a module tab. Preventive Care merged into Appointments (2026-05-29). |
| **Recipes & Groceries** | Library · Meal Planner · Grocery List · Nutrition *(Phase 2)* | |
| **Travel** | My Trips · Packing Templates · Travel Ready | *(Phase 2 — placeholder)* |
| **My Account** | My Profile · Family Members · Preferences · Access · Security & Privacy | Configuration; does not follow standard Area→Module→Item pattern |

---

## User and membership terms

| Term | Definition |
|------|------------|
| **Account** | The MyPal subscription unit; one Owner and up to 5 additional members on the Family plan |
| **Owner** | The member who created the account; holds billing responsibility; cannot be removed or downgraded |
| **Admin** | An Owner-designated Adult Member with the same operational permissions as the Owner (except billing); only one at a time |
| **Adult Member** | A family member aged 18 or over; full personal access; no Finance access unless explicitly granted by Owner/Admin |
| **Teenager** | A family member aged 13–17; independent login; can connect their own inbox; health and journal data private even from Owner/Admin |
| **Child** | A family member under 13; independent login; no privacy from HMG — all their data is visible to HMG members |
| **Member** | Any person belonging to an account (Owner, Admin, Adult Member, Teenager, or Child) |
| **Household** | The group of all members in a Family plan account |
| **Household Managers Group (HMG)** | A named group within an account; defaults to Owner + Admin; trusted Adult Members can be added by Owner/Admin; used as an assignment and visibility target across all content types; Teenagers and Children cannot be HMG members |
| **Solo plan** | A MyPal account with one member (the Owner); no sharing or roles |
| **Family plan** | A MyPal account with 2–6 members; roles, HMG, and sharing enabled |

---

## Visibility and recipient model

Every item in MyPal has a single `visible_to` field that controls both who can see it and who it is for. Visibility and responsibility are the same concept — there is no separate assignee field.

| Term | Definition |
|------|------------|
| **visible_to** | The field on every item record that sets who can see and act on it. Stored as an enum on the item's own table. Four possible values: `self`, `hmg`, `family`, `individual` |
| **Self** | visible_to tier: item is for the creator only. Exception: Children's items are always visible to HMG regardless of this setting |
| **HMG** | visible_to tier: item is for all current Household Managers Group members |
| **Family / All** | visible_to tier: item is for all household members including Children — shared, anyone can action it |
| **Individual** | visible_to tier: item is for one or more specific named members; stored as a `visible_to_members` array on the item |
| **visible_to_members** | Array of member IDs; populated only when `visible_to = 'individual'`; stored on the item's own table |
| **Creator** | The member who created an item; always retains visibility of their own items regardless of the visible_to setting |
| **Default visible_to** | `family` for all item types except Health and Journal, which default to `self` |

**Who can set each tier, by role:**

| Role | Can set visible_to to |
|------|-----------------------|
| HMG member (Owner/Admin/HMG Adult) | Self · HMG · Family · Individual (including Children) |
| Adult Member (non-HMG) | Self · HMG · Family · Individual (excluding Children) |
| Teenager | Self · HMG · Family · Individual (excluding Children) |
| Child | HMG only |

---

## Permission levels

Four levels apply consistently across all modules in the permissions system.

| Level | Meaning |
|---|---|
| **None** | Module not visible or accessible |
| **View** | Read-only — can see content, cannot create or edit |
| **Edit** | Read + write own items — can create, edit, and delete their own entries |
| **Manage** | Owner/Admin only — full access including others' items and module settings; cannot be granted to other roles |

---

## Common module-level terms

| Term | Definition |
|------|------------|
| **Item** | Generic term for a single record in any module |
| **Due date** | The date by which an item is expected to be completed or acted on |
| **Recurrence** | A repeating schedule applied to a task or reminder |
| **Overdue** | An item whose due date has passed and which has not been completed |
| **Archive** | Moving an item out of the active view without deleting it; retrievable |
| **Delete** | Permanently removing an item (soft-delete for 30 days, then hard-delete) |
| **Tag** | A user-defined label applied to an item for filtering and organisation |
| **Linked item** | A connection between an item in one module and a record in another |

---

## Feature-specific terms

### Tasks module
| Term | Definition |
|------|------------|
| **Task** | A single to-do item in the Tasks module; has a title, optional due date, priority, and visible_to setting |
| **Routine** | A recurring task with a fixed schedule; treated as a task property, not a separate entity |
| **Recurring section** | The group within Tasks that shows all active routines and recurring items |

### Finance area
| Term | Definition |
|------|------------|
| **Transaction** | A recorded financial movement (income or expense) |
| **Category** | A user-assigned or auto-assigned classification for a transaction |
| **Envelope** | A named budget pot within Budget Envelopes; tracks spend against a limit for a category or purpose |
| **Bill** | A known recurring payment tracked in Bills & Subs |
| **Finance access grant** | An explicit Owner/Admin action giving an Adult Member view or edit access to Finance modules that default to None |

### Health area
| Term | Definition |
|------|------------|
| **Health profile** | A member's personal health record within the Health area |
| **Medication log** | A record of a medication being taken, including dose and timing |
| **Preventive care** | Scheduled health checks, screenings, and vaccinations — tracked within the Appointments module (Preventive Care no longer exists as a standalone module; merged into Appointments 2026-05-29) |

### Reminders (absorbed into Tasks)
| Term | Definition |
|------|------------|
| **Advance notice** | The lead time before a task's due date at which a notification fires |
| **Snooze** | Temporarily dismissing a reminder to re-surface at a later time |

---

## Plan tier display names

The database stores plan tiers as enum values. Always use the display names in UI copy and specs — never expose the raw enum.

| DB enum | Display name | Price |
|---------|-------------|-------|
| `solo` | Individual | £2.99/mo |
| `family` | Family | £4.99/mo |

---

## Terms to avoid

| Avoid | Use instead | Why |
|-------|-------------|-----|
| "Page" (for a module) | Module | A module may span multiple tabs; "page" is too implementation-specific |
| "Card" (for content groups) | Section or Group | Card is a UI component; Section/Group is the content concept |
| "Sub-section" | Group | Group is the precise term for computed sub-divisions within a section |
| "Widget" | Section, Group, or Module | Too developer-specific |
| "Dashboard" | Today / Daily Briefing | MyPal's specific name for its aggregated view |
| "User" | Member | In MyPal, "member" has a precise meaning; "user" is ambiguous |
| "Sub-module" | Module | Each tab within an area (e.g. Overview within Finance) is a Module, not a sub-module |
| "Bucket" | Group | Informal; Group is the canonical term |
| "To-do item" or "to-do" | Task | The module is now called Tasks; items within it are tasks |
| "Young Person" | Teenager | Teenager is the confirmed role name |
| "Private" (for visibility) | Self | Self is the visible_to tier name; "private" is ambiguous |
| "Family-visible" | Family / All | Use the visible_to tier label |
| "Assignee" | visible_to / visible_to_members | Visibility and responsibility are unified in the recipient model |

---

## Writing conventions

- **Area and Module names** are title-cased and used as proper nouns: "the Tasks module", "the Life Admin area"
- **Section names** are title-cased when referring to a specific named section: "the Upcoming section"
- **Item** is lowercase: "a task item", "each item in the list"
- **Role names** are title-cased: "an Adult Member", "a Teenager", "the Owner"
- **visible_to tier names** are title-cased in prose: "set to Self", "visible to Family"
- In user-facing copy, use natural language: "only you can see this", not "visible_to: self"
- In specs and technical docs, use the field name for precision: "each item has a `visible_to` field"
