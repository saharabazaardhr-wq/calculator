# Control Center — Master Plan
**Company:** Sahara Bazaar India Pvt Ltd (Supermarket)
**System name:** Control Center: one place to see, assign, track and control everything in the business.

---

## 1. Understanding the business

A supermarket makes money on **thin margins (typically 15–25% gross, 2–5% net) and high volume**. Profit is not lost in one big mistake. It leaks out a little at a time in many places:

| Where money leaks | What it looks like in a store |
|---|---|
| **Expiry & wastage** | Dairy, bread, fruits & vegetables, packaged food crossing expiry on the shelf |
| **Shrinkage** | Theft, billing errors, wrong GRN quantities, damaged stock not recorded |
| **Out-of-stock** | Customer wants it, shelf is empty, sale lost (often 5–8% of sales) |
| **Over-stock** | Cash locked in slow-moving items, so vendor payments get delayed |
| **Purchase leakage** | Wrong rates, missed vendor schemes/free goods, short supply accepted |
| **Cash leakage** | Cash counter short/excess, unrecorded expenses, UPI mismatches |
| **People leakage** | Tasks "told" but never done, nobody owns the outcome, no follow-up |

**The real root problem you described is accountability.** Every leak above happens because a task has **no clear owner, no deadline, no proof and no follow-up**. So Control Center is built on one rule:

> **Every task, every number and every problem has ONE owner, a DEADLINE, PROOF of completion, and an automatic ESCALATION if missed.**

---

## 2. The Control Center architecture

```
                    ┌──────────────────────────────────┐
                    │   OWNER'S CONTROL CENTER (CEO)   │
                    │  Live dashboard · AI daily brief │
                    │  Red alerts · Ask-your-business  │
                    └────────────────┬─────────────────┘
                                     │
   ┌───────────┬───────────┬─────────┼─────────┬───────────┬───────────┐
   │ MARKETING │   SALES   │ PURCHASE│OPERATIONS│  FINANCE  │   TEAM    │
   └───────────┴───────────┴─────────┴─────────┴───────────┴───────────┘
                                     │
          ┌──────────────────────────┴──────────────────────────┐
          │ CORE ENGINE (shared by all modules)                 │
          │ People & roles · Tasks & checklists · Approvals ·   │
          │ Escalations · Alerts (WhatsApp) · Master data       │
          └─────────────────────────────────────────────────────┘
```

The **Core Engine** is built once and every department uses it. That is why it comes first.

---

## 3. What we will build: module by module

### A. TEAM MANAGEMENT (fixes accountability)
- **Org chart & roles**: Owner → Store Manager → Department heads (FMCG, Staples, Fruits & Vegetables, Dairy/Frozen, Cash) → Staff.
- **KRA sheet per role**: 3–5 measurable results each person owns (e.g. Dairy head: wastage < 1% of dairy sales).
- **Daily checklists with photo proof**: opening, closing, cleanliness, fridge temperature, shelf fill, cash handover.
- **Task assignment**: owner, deadline, priority, proof required. Nothing is assigned verbally any more.
- **Escalation ladder**: missed task → reminder → manager alert → owner alert.
- **Attendance & shift roster**: who is on duty, late marks, overtime.
- **Individual scorecard**: tasks on time %, checklist score, KRA achievement. Used for incentives and reviews.
- **Morning huddle report**: auto-generated list of yesterday's misses + today's priorities.
- **SOP library**: short written/video SOPs for each job (receiving goods, handling returns, cash closing).

### B. OPERATIONS (store runs the same way every day)
- **Store audit checklist**: weekly scored audit (cleanliness, planogram, pricing labels, FIFO).
- **Expiry tracker (FEFO)**: items expiring in 7/15/30 days → markdown, return to vendor, or liquidate.
- **Out-of-stock reporting**: staff report empty shelves in seconds; goes straight to purchase.
- **Wastage & damage log**: every damaged/expired item logged with reason, value and photo.
- **Shrinkage tracking**: stock-count variance by department and by person responsible.
- **Daily cash reconciliation**: POS sales vs cash + UPI + card; short/excess flagged per cashier.
- **Maintenance tracker**: fridges, AC, DG set, billing machines (complaint → fixed → cost).
- **Customer complaint log**: complaint, owner, resolution time.

### C. PURCHASE (buy right, at the right price, at the right time)
- **Vendor master**: contacts, credit days, delivery days, margin, schemes.
- **Reorder suggestions**: based on sales speed + current stock + lead time (min/max levels).
- **Purchase order with approval**: above a set limit needs manager/owner approval.
- **GRN (goods receipt)**: received vs ordered; short supply, damage and rate difference captured at the door.
- **3-way match**: PO vs GRN vs vendor invoice before payment is approved.
- **Scheme & claim tracker**: free goods, display incentives, expiry return claims, so no claim money is left uncollected.
- **Vendor scorecard**: fill rate, on-time delivery, rate accuracy, return acceptance.

### D. SALES (know what sells, push what earns)
- **Daily sales dashboard**: by store, department, category, hour of day.
- **Key numbers**: footfall/bills, average bill value (ATV), items per bill, gross margin %.
- **Target vs achievement**: daily/monthly targets per department and store.
- **Category analysis**: fast/slow/dead movers, high-margin vs low-margin mix.
- **Cashier performance**: bills/hour, voids, discounts given, errors.
- **Home delivery / phone orders** (if applicable): order → pick → deliver → payment tracking.

### E. MARKETING (bring customers back more often)
- **Customer database**: built from billing mobile numbers.
- **Loyalty / points program**: simple points or cashback on repeat visits.
- **Customer segments**: new, regular, lapsed (not visited in 30 days), high-value.
- **WhatsApp campaigns**: offers, festival promotions, "we miss you" messages to lapsed customers.
- **Festival & promotion calendar**: Diwali, Eid, Navratri, month-start salary week, etc.
- **Campaign ROI**: offer cost vs extra sales generated.
- **Local presence**: Google reviews tracking, in-store display/offer compliance (photo proof).

### F. FINANCE (know your real profit every month)
- **Daily cash & bank position.**
- **Payables ageing**: what we owe each vendor, due dates, payment planning.
- **Expense management**: request → approve → pay, with bill photo.
- **P&L by store and department**: monthly, with gross and net margin.
- **Budget vs actual**: rent, salaries, electricity, marketing.
- **GST summary & reconciliation support** (with Tally/accounting software).
- **Cash flow forecast**: next 30 days of incoming vs outgoing.

### G. OWNER'S CONTROL CENTER + AI LAYER (the top)
- **One-screen dashboard**: today's sales, margin, cash, red alerts, overdue tasks per person.
- **AI daily brief** (WhatsApp, every morning): "Yesterday sales ₹X (−4% vs last week), dairy wastage high, 3 tasks overdue by Ramesh, Vendor ABC short-supplied 12%."
- **Anomaly alerts**: unusual discounts, cash shortage, sudden drop in a category.
- **Ask your business**: type a question ("Which vendor had most short supply this month?") and get the answer.
- **Demand forecasting** (later): AI suggests order quantities using sales history + festivals.

---

## 4. Phase-by-phase roadmap

| Phase | Name | What gets built | Why this order | Approx. time |
|---|---|---|---|---|
| **0** | **Foundation** | Org chart, roles, KRAs, master data (stores, departments, staff, vendors, categories), user login & permissions | Nothing works without knowing *who* owns *what* | 1–2 weeks |
| **1** | **Team & Accountability** | Task engine, daily checklists with photo proof, escalations, attendance, scorecards, morning huddle report | **Your #1 pain.** Every later module uses this engine | 3–4 weeks |
| **2** | **Operations + Daily Cash** | Expiry tracker, OOS reporting, wastage log, store audit, daily cash reconciliation, complaints | Biggest daily money leaks; quick visible results | 4 weeks |
| **3** | **Purchase** | Vendor master, reorder suggestions, PO approval, GRN, 3-way match, scheme/claim tracker, vendor scorecard | Controls the largest cost line (≈75–80% of sales) | 4–5 weeks |
| **4** | **Sales** | POS data import, sales dashboard, targets, category & cashier analysis | Needs clean data from phases 2–3 to be meaningful | 3–4 weeks |
| **5** | **Marketing** | Customer database, segments, loyalty, WhatsApp campaigns, festival calendar, campaign ROI | Built on customer data captured by sales | 4 weeks |
| **6** | **Finance** | Payables, expenses, P&L by store/department, budget vs actual, cash-flow forecast | Consumes data from all modules → accurate profit | 4 weeks |
| **7** | **Owner's Control Center + AI** | CEO dashboard, AI daily brief, anomaly alerts, ask-your-business, forecasting | The "control everything" layer on top of real data | Ongoing |

**Rule for every phase:** build it, run it in one store/department for 2 weeks, fix it, *then* roll out. A system the team doesn't use is worse than no system.

---

## 5. Phase 1 in detail (what we start building first)

**Goal:** within 30 days, the owner can open one screen and see, for every person, what they were supposed to do, whether it was done, and the proof.

1. **People & roles**: add every staff member with role, department, manager, shift.
2. **KRA definitions**: 3–5 KRAs per role (we draft these together).
3. **Checklist builder**: opening/closing/cleanliness/temperature checklists; items can require a photo.
4. **Task module**: create → assign → deadline → proof → done / overdue.
5. **Escalation rules**: e.g. overdue 2 hrs → manager; overdue 24 hrs → owner.
6. **WhatsApp/SMS alerts**: reminders and escalations go to people's phones.
7. **Scorecards & leaderboard**: weekly score per person and department.
8. **Owner view**: today's completion %, overdue list, worst/best performers.

**Success measures for Phase 1**
- 90%+ daily checklists completed on time
- 100% of tasks have an owner and a deadline
- Owner spends < 15 minutes/day to know the status of the whole store

---

## 6. Suggested technology (simple, low-cost, AI-ready)
- **App**: mobile-friendly web app (works on staff phones, no installation needed).
- **Database & login**: Supabase (secure cloud database, role-based access).
- **Alerts**: WhatsApp/SMS messaging.
- **Integrations**: import daily data from your POS/billing software and Tally (Excel/CSV export to start, direct connection later).
- **AI**: Claude for daily briefs, anomaly explanations and "ask your business".

---

## 7. Questions to answer before Phase 1 starts
1. How many stores, and approximate size (sq. ft.) of each?
2. Total staff count, and current roles/designations?
3. Which billing/POS software do you use (e.g. Gofrugal, Marg, Tally POS, other)? Can it export Excel/CSV?
4. Which accounting software (Tally / other)?
5. Approx. number of SKUs and number of active vendors?
6. Do you do home delivery or WhatsApp/phone orders?
7. Who are your managers today, and what are the top 5 recurring problems you face with them?
8. Do staff have smartphones with WhatsApp?
9. Your business description mentions teaching other business owners to build systems with AI. Should Control Center also become a **template/product** you can show and teach to other owners? (If yes, we design it to be reusable from day one.)
