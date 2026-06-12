# Health — Journal

## 1. Overview (required)

**Feature name:** Journal  
**Module / nav location:** Health → Journal  
**Author:** Dip  
**Status:** Draft  
**Last updated:** 2026-05-30 14:10

### Problem statement
People rarely have a single place to capture how they feel day-to-day and what drives those feelings. Without that record, the activities and events that bring happiness fade from memory while stressors accumulate invisibly. MyPal Journal gives every household member a private, low-friction space to log mood and thoughts, then surfaces patterns back to them so they can do more of what works and less of what doesn't.

### User-facing goal
As a household member, I want to quickly record how I feel and what's going on, so that MyPal can remind me of the moments and activities that make me happy and help me notice patterns in my wellbeing over time.

---

## 2. Scope (required)

### In scope
- Mood + free-text + tag journal entries for any member with a login
- Photo attachments — up to 3 photos per day, stored as happy memories
- 30-day mood calendar heatmap as the primary navigation surface
- Chronological list of last 30 entries below the heatmap
- Entry detail modal — view, add to (free text, tags, photos), but mood rating is locked after submission
- Weekly insight card within the Journal summarising mood patterns and top activities
- Today module integration — periodic surfacing of happy memories and positive activity patterns (positive framing only)

### Out of scope
- Journal access for children without a login (no `users` row)
- Mood rating editing after submission
- Cross-member visibility of journal entries (entries are always private to the author)
- HMG or Owner override of any member's journal data
- Push/native notifications (Phase 2)
- Export or sharing of journal entries
- Integration with third-party mental health or wellbeing platforms

### Dependencies
- `_specs/platform--access-control.md` — role definitions and privacy model
- Health area navigation scaffold (tab strip, area layout)
- Today module — surfacing integration point
- S3 — photo storage

### Phasing

| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | Web MVP: entry creation, heatmap, 30-day list, entry detail modal, weekly insight card | Launch |
| Phase 2 | Today module surfacing of memories and patterns; push notification reminders | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| Adult member | Any adult in the household with a login | Private space to log mood and reflect; see what makes them happy |
| Teenager | Teen member with their own login | Personal, private journal fully hidden from parents by default |
| Owner / Admin | Household manager | Their own journal; cannot access other members' entries |

---

## 4. Roles & access (required)

> Full role definitions in `_specs/platform--access-control.md`. Journal is strictly personal — no role can read another member's journal.

| Capability | Owner | Admin | Adult Member | Teenager | Children |
|------------|:-----:|:-----:|:------------:|:--------:|:--------:|
| View own journal | ✓ | ✓ | ✓ | ✓ | ✗ |
| Create entry | ✓ | ✓ | ✓ | ✓ | ✗ |
| Add to entry (text, tags, photos) within 30 days | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit mood rating after submission | ✗ | ✗ | ✗ | ✗ | ✗ |
| View another member's journal | ✗ | ✗ | ✗ | ✗ | ✗ |
| Delete own entry | ✓ | ✓ | ✓ | ✓ | ✗ |

**Notes:**
- Children (members without a `users` row) have no journal access — the module requires a login.
- Teenager journals are private from HMG by default; this is not configurable. No sharing option exists for journal data.
- The personal-first privacy rule is absolute here: server-side RLS ensures no role can query another member's `journal_entries`.

---

## 5. Functional requirements (required)

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

| # | Requirement | Priority | Acceptance criteria |
|---|-------------|----------|---------------------|
| F-01 | Member can create a journal entry with a mood rating (required), free text (optional), and tags (optional) | P0 | Entry saved with UTC timestamp; mood required before save enabled |
| F-02 | Mood rating is a 5-point scale: Great / Good / Okay / Low / Rough | P0 | All 5 options available; selection visually distinct; only one selectable |
| F-03 | Quick-add path: mood + one tag tap = valid entry, no typing required | P0 | Entry can be created in under 10 seconds without keyboard |
| F-04 | Tags include system-suggested set (Exercise, Family, Work, Social, Rest, Food, Outdoors) plus user-defined tags | P1 | System tags shown by default; user can add custom tags; custom tags persist |
| F-05 | Member can attach up to 3 photos per day across all entries for that day | P0 | 4th photo blocked with clear message; total enforced at day level, not entry level |
| F-06 | 30-day mood heatmap displayed at top of Journal; each day coloured by mood rating | P0 | Heatmap renders correctly; empty days shown as neutral; tapping a day opens that day's entry |
| F-07 | Chronological list of last 30 entries shown below the heatmap | P0 | Entries sorted newest first; each row shows date, mood, and first line of text or top tag |
| F-08 | Entry detail modal shows full entry; allows adding free text, tags, and photos; mood rating display-only | P0 | Mood shown but not editable; save button only active if changes made |
| F-09 | Entry additions locked after 30 days (entry becomes read-only) | P1 | Add controls hidden on entries older than 30 days; read-only state clearly indicated |
| F-10 | Weekly insight card in Journal summarises mood patterns and top tags for the past 7 days, framed positively | P1 | Card visible in Journal view; highlights best days and most common positive-correlating tags; no negative labelling |

---

## 5.1 User Stories

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | household member | log my mood and a quick note in under a minute | I can build a habit without it feeling like a chore |
| US-02 | adult member | attach a photo to a journal entry | I can capture a happy memory visually, not just in words |
| US-03 | household member | see my mood over the last 30 days as a heatmap | I can spot patterns in how I've been feeling at a glance |
| US-04 | household member | tap on any day in the heatmap | I can read back what I wrote and how I felt that day |
| US-05 | household member | add more detail to a past entry | I can enrich a memory after the fact without changing how I felt |
| US-06 | teenager | know my journal is completely private | I can write honestly without worrying a parent will read it |
| US-07 | household member | receive a weekly mood and activity summary | I can understand what's contributing to my wellbeing over time |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | Journal entry list and heatmap load in < 500ms |
| NF-02 | Accessibility | WCAG 2.1 AA — mood selector keyboard-navigable, heatmap has text alternative |
| NF-03 | Photo storage | Photos stored in S3; max 3 per day enforced server-side |
| NF-04 | Data retention | Soft-delete on entries; retained 30 days before permanent deletion |
| NF-05 | Privacy enforcement | `journal_entries` RLS policy scopes all queries to the authenticated member's `member_id`; no cross-member reads possible |
| NF-06 | Photo size | Max 10MB per photo; server-side validation |

---

## 7. User flows (required)

### Happy path — Quick mood log

1. Member opens Health → Journal.
2. Taps "Add entry" button.
3. Selects mood (e.g. Great).
4. Optionally taps one or more suggested tags (e.g. Family, Outdoors).
5. Optionally types a short note.
6. Taps Save — entry created, heatmap updates to reflect today's mood.

### Happy path — Add a photo to today's entry

1. Member opens today's entry via the heatmap or entry list.
2. Entry detail modal opens.
3. Member taps "Add photo" — device photo picker opens.
4. Selects a photo; photo attaches to the entry.
5. Member taps Save. Photo stored in S3; visible in entry detail.

### Happy path — Browse past mood via heatmap

1. Member opens Journal; heatmap shows 30 days of colour-coded mood.
2. Member taps a specific day.
3. Entry detail modal opens showing that day's mood, note, tags, and photos.
4. If within 30 days: Add controls visible. If older: read-only view.

### Error / edge paths

- **No entry for a tapped day:** Modal opens in "new entry" state pre-set to that date (if within 30 days); read-only empty state if older.
- **4th photo attempt:** Upload blocked; toast shows "You've reached the 3-photo limit for today."
- **Photo > 10MB:** Upload rejected; toast shows "Photo must be under 10MB."
- **Entry older than 30 days:** Add controls hidden; entry displayed as read-only with a subtle "archived" label.
- **Offline / save fails:** Toast error; entry draft retained locally until next successful save attempt.

---

## 8. Data model

> Column types and indexes go in the tech plan. This captures field-level semantics.

**`journal_entries`** (existing table — extend as needed)

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Entry identifier | Yes | UUID |
| `member_id` | Owning member | Yes | FK to `members`; RLS enforced |
| `account_id` | Household account | Yes | FK to `accounts`; RLS enforced |
| `entry_date` | Calendar date of the entry | Yes | Date only (not timestamp); one entry per member per day |
| `mood` | Mood rating | Yes | Enum: `great / good / okay / low / rough`; locked after creation |
| `body` | Free-text note | No | Plain text; editable within 30 days |
| `tags` | Selected tags | No | Array of strings; mix of system and user-defined; editable within 30 days |
| `photo_urls` | S3 URLs for attached photos | No | Max 3 per day (day = `entry_date`); editable within 30 days |
| `created_at` | UTC creation timestamp | Yes | Set on insert; not editable |
| `updated_at` | UTC last-updated timestamp | Yes | Updated on any edit |

**`journal_tags`** (new — user-defined tags per member)

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `id` | Tag identifier | Yes | UUID |
| `member_id` | Owning member | Yes | FK to `members` |
| `account_id` | Household account | Yes | FK to `accounts` |
| `label` | Tag display name | Yes | User-defined string; max 30 chars |

---

## 9. UI / UX considerations

**Journal main view** — two stacked sections:

The top section is the 30-day mood heatmap: a grid of coloured squares (one per day), colour-mapped to the 5-point mood scale from a warm green (Great) through neutral grey (Okay) to a muted red (Rough). Empty days are shown as a light neutral square, not blank, so the grid always renders as a complete shape. Tapping any square opens that day's entry detail modal.

Below the heatmap: a chronological list of the last 30 entries, newest first. Each row shows the date, the mood label, and either the first line of the body text or the first tag if no text was written. Tapping a row opens the same entry detail modal.

A floating "+" button (bottom-right) opens a new entry for today. If an entry already exists for today, the button opens the existing entry in edit mode instead.

**Entry detail modal** — full-screen on mobile, centred card on desktop. Top section: date and mood displayed prominently (mood as a coloured label, not editable). Below: body text area (editable within 30 days), tag chips with an "Add tag" control, and a photo strip (up to 3 thumbnails with an "Add photo" button until the limit is reached). If the entry is read-only (> 30 days old), all edit controls are hidden and a subtle banner reads "This entry is archived."

**Weekly insight card** — appears as a card at the top of the Journal view (above the heatmap), generated once per week. Shows the highest-mood day of the week, the most frequently logged tag, and a single positive observation (e.g. "Outdoor time seems to lift your mood — you logged it on your 3 best days this week"). Card is dismissible; refreshes each Monday.

**Mood selector (new entry)** — five large tap targets in a row, each labelled with both an emoji and a word (e.g. 😊 Great). Selected state uses a filled colour token; unselected states are outlined. Keyboard-navigable.

**Empty state** — first visit shows a warm illustration and copy: "How are you feeling today? Start your first entry." No data shown until the first entry is created.

UI reference: `_UI/mypal-app.jsx` — Health area screens (Journal section to be added to prototype).

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| S3 photo storage | Phase 1 | Photos uploaded via signed URL; stored under `journal/{member_id}/{entry_date}/` prefix |
| Today module — memory surfacing | Phase 2 | Today shows "on this day" and positive pattern prompts drawn from journal data |
| Push notifications | Phase 2 | Optional daily mood check-in reminder (opt-in only) |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Weekly active journallers | ≥ 40% of logged-in members log at least one entry per week within 60 days of launch | Analytics — `journal_entries` creation events |
| Quick-add usage | ≥ 50% of entries created without body text (mood + tags only) | Analytics — `body` null rate on entries |
| Photo attachment rate | ≥ 20% of entries include at least one photo | Analytics — `photo_urls` non-empty rate |
| Insight card engagement | ≥ 30% of members who see the weekly card do not dismiss it immediately | Analytics — card dismiss events vs. impression events |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Access rules enforced server-side — RLS on `journal_entries` scoped to `member_id`
- [ ] Mood rating locked server-side after creation (not just frontend)
- [ ] Photo day-limit (3/day) enforced server-side
- [ ] Empty state handled (no entries yet)
- [ ] Read-only state handled (entries > 30 days old)
- [ ] Mobile layout reviewed at 375px viewport
- [ ] WCAG 2.1 AA verified for mood selector and heatmap
- [ ] Open questions resolved or deferred with a decision recorded

---

## 13. Open questions

- [ ] One entry per day vs. multiple entries per day — current model assumes one entry per member per day (`entry_date` as the key). If we allow multiple entries, the heatmap needs a blending rule (e.g. average or last mood of the day). Decision needed before implementation. — Dip · 2026-06-06
- [ ] Weekly insight card generation — rule-based (deterministic tag/mood correlation) or AI-generated prose? Rule-based is simpler for Phase 1; AI gives more natural copy. — Dip · 2026-06-06
- [ ] Today module surfacing algorithm — "on this day" (anniversary-based) vs. proactive pattern nudge ("you haven't logged Family time lately") — or both? — Dip · 2026-06-13

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-05-30 14:10 | Dip | Initial draft |
