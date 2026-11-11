# Control Center: Stage 2 Plan (Revised after reviewing the AI Blueprint)
**Sahara Bazaar India Pvt Ltd** · Revised 11 November 2026
Source reviewed: *AI Systems Blueprint, DWG BOA-2026-SAH-01 Rev A (30 Oct 2026)*, all 31 pages.

---

## 1. Verdict on the Blueprint

**The blueprint fits your business well.** It is built around how your hypermarket actually loses money and time, not around generic software. Keep its core:

| Keep as-is | Why it is right |
|---|---|
| **3 problems first:** F&V stock-to-reorder, cashier cash handover, floor tasks | These are where money leaks daily (wastage, cash variance) and where accountability breaks (who did what) |
| **"Enter once, where it happens"** | Removes the 3–4 times re-typing (rack → paper → WhatsApp → eFacto) |
| **eFacto read-only in the first phase** | Safe. Nothing can damage your ERP data |
| **Guardrails** (AI drafts, humans approve, never auto-approve) | Correct for money, suppliers, and people decisions |
| **Start with cash (Red Shift Alert)** | Easiest build, fastest proof (≈₹8,000/month) |
| **Copy F&V to Grocery only after 2 clean weeks** | Prove one department before scaling |
| **No launches during festival rush or March** | Protects the business in peak and year-end weeks |
| **Your own success test** | Wastage down 20%, cash variance caught same day, 9 PM summary nobody compiles, 5 hours/week back for Mohit |

## 2. Gaps and corrections found

| # | Issue in the blueprint | What we should do |
|---|---|---|
| 1 | **Dates have already passed.** Phase 1 was due to go live 30 Oct–10 Nov; Diwali is over and today is 11 Nov | Re-base all dates from this week. **The post-Diwali lull is now**, so this is the best window to start |
| 2 | **Business numbers don't fit a hypermarket** (100 leads, 10 quotes, 100 orders, "headcount: YES") | Replace with retail numbers: bills/day, average bill value, sales per department, staff count per role. Needed to size tablets, PINs and messages |
| 3 | **Everything depends on eFacto export (F-00), still unchecked** | Week-1 job #1. If there is no export, we use a CSV upload every 2–3 hours as the fallback, so the build is never blocked |
| 4 | **eFacto contradiction** ("used", "want to stop paying", "never opened") | Settle it: who logs in, what is entered, licence cost. Decide at the July review, with data |
| 5 | **WhatsApp buttons (Approve / Change / Reject) need the official WhatsApp Business API** (provider account, Meta template approval, per-message cost). Not mentioned | Apply this week. Until approved, messages carry a **one-tap link** to an approval page, which works the same for Mohit |
| 6 | **Mohit is a single point of failure.** He approves orders, red shifts, wastage, and proof photos | Name a **deputy approver** (store manager) and a timeout: if there's no tap in X minutes it goes to the deputy, then to Anil |
| 7 | **Rupee limits still blank:** cash tolerance, red-shift ceiling, wastage write-off ceiling, order value limit (only ₹5,000 is mentioned) | Anil fixes these before go-live (see §5). Nothing goes live without them |
| 8 | **No baseline being captured.** "Wastage down 20%" needs the first 10 days of numbers | Day 1 of the F&V sheet = baseline period. Also log Mohit's current compiling hours this week |
| 9 | **Savings are stacked across 5 layers of the same loop** (claimed ≈₹1 lakh/month) | Treat ₹1 lakh as the ceiling, not a promise. Measure real savings from the boards |
| 10 | **Three separate 9 PM messages** (F&V, cash, floor) | Merge into **one 9 PM owner message** with 3 sections plus one link. Mohit gets a midday version |
| 11 | **Only F&V, Grocery, cash and tasks are covered.** 14+ departments, Purchase, Finance, Sales and Marketing are not planned | Add them as later phases (Phase 6–7 below) so Control Center covers the whole business |
| 12 | **Packaged-goods expiry** (FMCG, dairy) not covered, only F&V wastage | Add an expiry check to the Task Book now; build a full expiry tracker in Phase 6 |
| 13 | **Shared tablets and PIN login** for staff without smartphones | Budget 1 tablet per big section (F&V, Grocery, cash room), with PINs issued in Phase 0 |

## 3. How Stage 1 (what we already built) fits in

The Control Center prototype already built in `control-center/` covers much of **SYS-07 Tick Card & Reminder Chain** and **SYS-08 Floor Board / Floor Munshi**: tasks, checklists with photo proof, escalation, scorecards and the huddle report. To match the blueprint it needs:

- **PIN login** (4-digit) and **Hindi + English** labels, with big buttons
- **Task Book per role/department:** each task is marked *tick*, *quantity* or *photo*
- **Escalation timings from the blueprint:** reminder 15 min before → red at deadline → in-charge +30 min → manager +90 min (currently 2h/24h)
- **In-charge "Reassign"** and **manager "Accept / Reject proof"** with a reason
- **Department view (18 rows: green/yellow/red)**, repeat-miss by task, time-of-day view
- Scores labelled as **"inputs for review, not verdicts"**, plus a monthly bilingual review draft with the comment box left blank
- **Shared cloud database + audit log** (every action logged with time and reason). This becomes the **One Store Record (F-00)**

So the prototype is not wasted. It becomes the shell that the cash form, F&V sheet and boards plug into: **one Control Center, one login, one 9 PM message.**

---

## 4. Revised phases (from 11 Nov 2026)

### Phase 0: Settle & Foundation · Week 1 (11–17 Nov)
| Task | Owner |
|---|---|
| Fill in the rupee limits and approvers (§5) | Anil |
| Test eFacto: can it export sales by item, cashier and payment mode? If not, CSV upload | Mohit + builder |
| Staff list: name, role, department, shift, phone/tablet, **PIN** | Mohit |
| Apply for WhatsApp Business API | Builder |
| Set up the shared cloud database (One Store Record) + audit log | Builder |
| Start the baseline: Mohit logs hours spent compiling reports this week | Mohit |
**Done when:** limits signed, eFacto route known, every staff member has a PIN.

### Phase 1: Cash Control · Weeks 2–3 (18 Nov – 1 Dec)
**SYS-02 Shift Close Form + SYS-01 Red Shift Alert** (+ Cash Handover SOP Skill)
- PIN at shift start, float pre-filled, cash-out with reason, note-count grid, payment-mode totals from eFacto
- Green/red before leaving the counter; red locks the shift and alerts the supervisor and Mohit within the minute
- 1 week alongside paper, then paper stops

**Done when:** every shift is a locked record, every red reached a person the same hour. *(₹8,000/month starts here.)*

### Phase 2: F&V Day Sheet · Weeks 2–5 (18 Nov – 15 Dec), in parallel
**SYS-03 F&V Day Sheet** (+ F&V Reorder Skill)
- Sheet opens itself at 8 AM with yesterday's closing; receiving entered once at the back entrance; wastage tapped with a reason (rotten/damaged/trimming); midday and 7 PM rack counts; gaps turn red
- **The first 10 days are the wastage baseline**

**Done when:** nobody re-keys F&V stock into eFacto; 10 days of clean data exist.

### Phase 3: Floor Tasks in 3–4 departments · Weeks 3–8 (25 Nov – 5 Jan)
**SYS-07 Tick Card + Reminder Chain**, upgraded from the existing Control Center prototype
- Pilot departments: **F&V, Grocery/Staples, FMCG, Cash** (suggested)
- Morning WhatsApp task list, 15-min reminder, escalations at +30/+90 min, proof accept/reject

**Done when:** pilot departments are at 90%+ on-time for 2 straight weeks.

### Phase 4: The Clock Runs the Day · Weeks 5–9 (16 Dec – 19 Jan)
**SYS-04 F&V Daily Loop** (order drafted 7:30 PM, waits for Mohit's tap) · **SYS-06 F&V Evening Board** · **SYS-05 Cash Variance Board** · **SYS-08 Floor Board**
- **One merged 9 PM owner message** (F&V + Cash + Floor) and a midday message for Mohit
- Copy the F&V sheet to **Grocery** after 2 clean weeks

**Done when:** at 9 PM Anil gets one message nobody compiled, and the order draft waits for Mohit.

### Phase 5: Roll Out to All Departments · Weeks 10–14 (20 Jan – 28 Feb)
- Tick Card in all ~18 departments; first monthly bilingual review drafts (Floor Munshi, drafts only)
- Fix task lists from staff feedback (shorten, move away from peak billing hours)
- **March: freeze.** Nothing new; year-end stock verification and closing

### Phase 6: AI Employees + Purchase & Expiry · Apr – Jun 2027
- **F&V Clerk** and **Cash Munshi** agents (drafts only: orders, wastage vouchers, deposit slip PDF)
- After 2–3 clean weeks, Anil may move small repeating items from *approve* to *alone*
- **New:** packaged-goods **Expiry Tracker** (7/15/30 days), **Receiving for all departments**, **Supplier payment-due tracker** and short-supply / rate-mismatch flags (the payment itself stays human)

### Phase 7: Complete Control Center · Jul – Sep 2027 (monsoon lull)
- **eFacto decision:** keep read-only, allow writes (wastage vouchers, stock), or replace it, judged on your own data
- **Finance:** daily cash & bank position, payables ageing, expense approvals, P&L by department
- **Sales:** department sales, bills/day, average bill value, hour-of-day, margin mix
- **Marketing:** customer database from billing mobiles, WhatsApp offers to lapsed/regular customers, festival calendar
- **Owner's Control Center:** one screen + AI "ask your business"

### Before Navratri 2027 (target)
All three loops live in every department, the owner's day reduced to **one 9 PM message + one-tap approvals**, marketing campaigns ready for the festival season, and a written review against your own test.

---

## 5. Decisions needed from Anil (blank in the blueprint)

| Decision | Suggested starting value (you decide) |
|---|---|
| Cash variance tolerance (green vs red) | ±₹50 per shift |
| Red-shift ceiling: above this, it goes straight to Anil | ₹1,000 |
| Wastage write-off ceiling: above this, Mohit approves | ₹500 per entry |
| Order value / new supplier: needs Mohit | ₹5,000 or any new item/supplier |
| Always needs Anil | ₹5,000+ (as you stated) |
| No-response timeout before escalating | 30 min (orders 60 min) |
| Deputy approver when Mohit is unavailable | Store Manager (name) |
| Repeat-red threshold per cashier per month | 3 red shifts |
| Pilot departments for Tick Card | F&V, Grocery, FMCG, Cash |

## 6. Questions to settle
1. Did anything go live between 30 Oct and 10 Nov (cash form, F&V sheet, paper backup)?
2. Real numbers: bills per day, average bill value, total staff and staff per role, number of counters and shifts.
3. eFacto: who uses it, what is entered, and does it have a report export?
4. How many staff have smartphones? How many shared tablets will we need?
5. Is the build being done with your consultant (Buildour AI), here in Control Center, or both? If both, we agree that **Control Center is the one store record**, so nothing gets built twice.
