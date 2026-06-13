# Spec Template — v3

> Copy this file, rename it to `_specs/<feature-name>.md`, and fill in each section.  
> Delete any section that genuinely doesn't apply — don't leave placeholder text in.  
> Sections marked **(required)** must be present in every spec.  
> UI reference: link to the relevant section of `_UI/mypal-app.jsx` (the canonical UI prototype).  
> **Acceptance criteria (§5) and flows (§7) are written in Gherkin** (`Given`/`When`/`Then`). See the "Writing scenarios" note under §5. Keep all other sections in prose — Gherkin describes behaviour only, not context, data model, or UI.

---

## 1. Overview (required)

**Feature name:** [Short, clear name]  
**Module / nav location:** [e.g. Life Admin → Reminders]  
**Author:** [Name]  
**Status:** Draft | In review | Approved  
**Last updated:** [YYYY-MM-DD HH24:MI]

### Problem statement
[1–3 sentences. What pain does this solve, for whom, and why does it matter now?]

### User-facing goal
[Complete this sentence: "As a [user type], I want to [do something] so that [benefit]."]

---

## 2. Scope (required)

### In scope
- [Feature / behaviour 1]
- [Feature / behaviour 2]

### Out of scope
- [What this feature explicitly does NOT do]
- [Common assumption that might be made but isn't included]

### Dependencies
- [Other feature or spec this depends on — e.g. `_specs/platform--access-control.md`]
- [External service or module that must exist first]

### Phasing (if applicable)
| Phase | What ships | When |
|-------|-----------|------|
| Phase 1 | [Web MVP] | Launch |
| Phase 2 | [Native app / notification enhancements] | Post-launch |

---

## 3. Users & personas (required)

| Persona | Description | Primary need from this feature |
|---------|-------------|-------------------------------|
| [e.g. Owner] | [Brief description] | [What they want] |
| [e.g. Teenager] | [Brief description] | [What they want] |

---

## 4. Roles & access (required)

> What each role can see and do within this feature. Refer to `_specs/platform--access-control.md` for the full role definitions.

| Capability | Owner | Admin | Adult Member | Teenager | Children |
|------------|:-----:|:-----:|:------------:|:--------:|:--------:|
| [e.g. View] | ✓ | ✓ | ✓ | ✓ | ✓ |
| [e.g. Create] | ✓ | ✓ | ✓ | ✗ | ✗ |
| [e.g. Edit others'] | ✓ | ✓ | ✗ | ✗ | ✗ |
| [e.g. Delete] | ✓ | ✓ | Own only | ✗ | ✗ |

Notes on access exceptions or role-specific behaviour go here.

---

## 5. Functional requirements (required)

> Aim for 10 or fewer requirements — the most important ones. Requirements describe what the **system** does.  
> User stories (section 5.1) describe **why** a user cares. Avoid duplicating the same point in both.

Priority key: **P0** = must have at launch · **P1** = should have · **P2** = nice to have

**5a. Requirements index.** One row per requirement. The "Scenarios" column lists the Gherkin scenario names (in §5b) that prove it.

| # | Requirement | Priority | Scenarios |
|---|-------------|----------|-----------|
| F-01 | [Requirement description] | P0 | [Scenario name(s) from §5b] |
| F-02 | [Requirement description] | P1 | [Scenario name(s) from §5b] |
| F-03 | [Requirement description] | P2 | [Scenario name(s) from §5b] |

**5b. Acceptance criteria — Gherkin scenarios.**

> **Writing scenarios.** Each requirement's acceptance criteria are expressed as one or more `Scenario` (or `Scenario Outline`) blocks. These are the canonical, testable definition of "done" — `/tech_spec` turns each into a test-plan item, and `/tech_implement` treats a phase as verified only when its scenarios pass (rspec for backend behaviour, Playwright for UI).
>
> Conventions:
> - One `Feature:` block per requirement (or per closely-related group); tag it with the requirement id, e.g. `# F-01`.
> - Use `Background:` for shared `Given` setup.
> - Use `Scenario Outline:` + `Examples:` for matrix rules — especially **roles** and **`visible_to`** (Own/HMG/Family/Individual) combinations.
> - Always include at least one **server-side rejection** scenario for any access-controlled action (status 403, no mutation) — never assert access in the UI only (see NF-04).
> - Reference canonical terms from `_specs/terminology.md` (roles, HMG, `visible_to`). Don't invent new role or scope names.

```gherkin
# F-01: [Requirement name]
Feature: [Behaviour under test]
  Background:
    Given [shared precondition]

  Scenario: [Happy path]
    Given [precondition]
    When [action]
    Then [observable outcome]

  Scenario Outline: [Matrix rule — e.g. visibility by scope]
    Given an item with visible_to "<scope>"
    When member "<viewer>" lists items
    Then the item is "<result>"

    Examples:
      | scope      | viewer           | result      |
      | own        | another member   | not visible |
      | family     | any member       | visible     |
```

---

## 5.1 User Stories

> User stories describe the user's motivation. Keep to 10 or fewer — one per meaningful job-to-be-done.

| # | As a… | I want to… | So that… |
|---|-------|-----------|---------|
| US-01 | [role] | [action] | [benefit] |

---

## 6. Non-functional requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF-01 | Performance | [e.g. List loads in < 500ms] |
| NF-02 | Accessibility | WCAG 2.1 AA |
| NF-03 | Data retention | [e.g. Soft-delete, retained 30 days] |
| NF-04 | Privacy enforcement | Access rules enforced server-side — never frontend-only |
| NF-05 | Security | Security considerations for personal and financial data |

---

## 7. User flows (required)

> Write flows as Gherkin scenarios so they line up with §5b and become test cases directly. The happy path is one `Scenario`; each error/edge path is its own `Scenario`. Keep these end-to-end (user journey through the UI) — §5b stays focused on per-requirement rules.

```gherkin
# Primary flow — [name]
Feature: [End-to-end journey]
  Scenario: Happy path — [primary flow name]
    Given [starting state]
    When [step 1]
    And [step 2]
    Then [final outcome]

  Scenario: [Error / edge path 1]
    Given [precondition]
    When [action that fails]
    Then [how the system responds — message, status, no side effect]

  Scenario: [Edge path 2 — e.g. empty state / no access]
    Given [precondition]
    When [action]
    Then [observable result]
```

---

## 8. Data model

List the key fields captured or stored. Implementation detail (column types, indexes) goes in the tech plan, not here.

| Field | Description | Required? | Notes |
|-------|-------------|-----------|-------|
| `field_name` | [What it stores] | Yes / No | [Any constraint or default] |

---

## 9. UI / UX considerations

[Describe the intended experience in prose — layout, interaction patterns, empty states, loading states, mobile behaviour. Reference the relevant section of `_UI/mypal-app.jsx` where applicable. Don't over-specify — leave room for design.]

---

## 10. Integration points & platform constraints

| Integration | Availability | Notes |
|-------------|-------------|-------|
| [e.g. Push notifications] | Phase 2 | No notifications in Phase 1 |
| [e.g. Apple HealthKit] | Native only | No web API; Phase 2 |

---

## 11. Success metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| [e.g. Feature adoption] | [e.g. 60% of active users use this within 7 days] | [How / where tracked] |
| [e.g. Completion rate] | [e.g. > 70% of items marked done] | [How / where tracked] |

---

## 12. Definition of done

- [ ] All P0 functional requirements implemented and tested
- [ ] Access rules enforced server-side for all five roles
- [ ] Empty states handled (no items, no access)
- [ ] Mobile layout reviewed at 375px viewport
- [ ] WCAG 2.1 AA verified for interactive elements
- [ ] Open questions resolved or deferred with a decision recorded

---

## 13. Open questions

- [ ] [Question — owner · target date]
- [ ] [Question — owner · target date]

---

## 14. Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | [YYYY-MM-DD HH24:MI] | [Name] | Initial draft |
| 0.2 | 2026-05-20 07:56| Dip | Added Roles & access, Dependencies, Definition of done; split functional requirements from user stories; removed time from Last updated; updated UI reference from Figma to mypal-complete-v2.jsx; added owner/date to open questions |
| 0.3 | 2026-05-22 20:03| Dip | Updated UI reference from mypal-complete-v2.jsx to _UI/mypal-app.jsx (canonical prototype moved to _UI/ folder) |
| 0.4 | 2026-05-24 17:15 | Dip | Confirmed YYYY-MM-DD HH24:MI format for both Last updated and revision history date fields |
| 0.5 | 2026-06-04 | Dip | Template → v3: acceptance criteria (§5) and user flows (§7) now written in Gherkin. Added §5a requirements index + §5b Gherkin scenarios with a "Writing scenarios" convention (Scenario Outline for role/visible_to matrices, mandatory server-side rejection scenario). |
| 0.6 | 2026-06-12 | Cowork | Fixed §5b note: backend acceptance tests use `rspec` (not `pytest` — project migrated to Rails). |
