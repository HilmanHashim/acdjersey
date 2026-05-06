## What's already done

- April 2026 tracker imported into the database (114 entries) for JEED ACD, DIDO ACD, MUNIR ACD, ALYPH ACD, HILMAN ACD, UMAR ACD.
- Columns missing from the April tracker (job name, jersey type, quantity, price per pc) are stored as null per your instruction.

## What I'll change

Add a month switcher to `src/components/crm/DashboardTab.tsx` so the dashboard can show data from April 2026 onward.

### UI

- A small selector at the top of the dashboard (next to the title) listing every month from April 2026 up to the current month — e.g. "April 2026", "May 2026", "June 2026", ...
- Defaults to the current month on load.
- "TEAM PERFORMANCE — TODAY" section becomes "TEAM PERFORMANCE — [first day of month] / TODAY":
  - When viewing the current month → shows today's data (unchanged behavior).
  - When viewing a past month → shows the **last day with entries** in that month (so April view isn't empty).
- "MONTH CUMULATIVE — INDIVIDUAL" aggregates all entries in the selected month.
- "MONTHLY TARGET PROGRESS" cards (revenue, % achieved, leads, orders closed) recalc for the selected month. "DAYS LEFT IN MONTH" shows 0 for past months.

### Technical details

- Add `selectedMonth` state (`{ year, month }`), default = current month.
- Replace `mStart`/`today` constants with computed `monthStart` / `monthEnd` from `selectedMonth`.
- Filter `entries` by `entry_date >= monthStart && entry_date <= monthEnd`.
- For "today" rows: if selected month is current → filter `entry_date === today`; else → find max `entry_date` within month and filter on it.
- Build month list dynamically from `FIRST_MONTH = {year:2026, month:4}` up to current month using a small helper.
- Styling: shadcn `Select` component, themed to match dashboard palette (dark panel, yellow accent).

No DB changes. No changes to the Sales Tracker tab.
