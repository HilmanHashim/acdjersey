# Self KPI Tab

Add a new "My KPI" tab in the CRM that shows personal-focused metrics for the logged-in user. Admins/superadmin can switch to view any salesperson.

## 1. Database — map users → salesperson key

Create a new `profiles` table (one row per auth user) so each user is linked to their `sales_entries.salesperson` value.

```sql
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  salesperson_key text,  -- e.g. 'HILMAN ACD' — matches sales_entries.salesperson
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Anyone authenticated can read (needed for admin dropdown labels & own profile)
create policy "Authenticated view profiles" on public.profiles
  for select to authenticated using (true);

-- User can upsert/update own profile; admin/superadmin can manage all
create policy "User manages own profile" on public.profiles
  for insert to authenticated with check (user_id = auth.uid());
create policy "User updates own profile" on public.profiles
  for update to authenticated
  using (user_id = auth.uid() or has_role(auth.uid(),'admin') or has_role(auth.uid(),'superadmin'));
create policy "Admin deletes profiles" on public.profiles
  for delete to authenticated
  using (has_role(auth.uid(),'admin') or has_role(auth.uid(),'superadmin'));
```

Admin assigns each user's `salesperson_key` from a small UI in the existing Users tab (a dropdown with the 6 known keys: MUNIR ACD, DIDO ACD, JEED ACD, UMAR ACD, ALYPH ACD, HILMAN ACD).

## 2. New tab in CRM

In `src/pages/CRM.tsx`:
- Add `<TabsTrigger value="my-kpi">` with a `User` icon, between Dashboard and Tracker.
- Add `<TabsContent value="my-kpi"><MyKpiTab /></TabsContent>`.
- Update grid-cols from 7 → 8.

## 3. New component `src/components/crm/MyKpiTab.tsx`

Behavior:
- On mount: fetch current user's profile → resolve `salesperson_key`.
- Check if current user has `admin`/`superadmin` role via `user_roles`.
- If admin: show a salesperson dropdown (lists all profiles with a `salesperson_key`, plus the 6 hardcoded `PEOPLE` from DashboardTab as fallback). Default = own key.
- If non-admin: locked to own `salesperson_key`. If none set, show a friendly empty-state ("Ask an admin to link your account to a salesperson").
- Month switcher (reuse `buildMonthOptions` pattern from DashboardTab).

Metrics shown (personal-focused, all filtered to selected salesperson + month):

**KPI cards (top row)**
- My Revenue MTD (RM)
- My Personal Target (editable for admin only — stored per user/month in a new `personal_targets` table OR derived as `monthly_targets / 6`. Recommend deriving as `monthly_targets.target_amount / 6` initially to skip extra schema; revisit later.)
- % of Personal Target (with progress bar)
- Orders Closed
- Total Pcs Sold
- Avg Price / Pc (weighted)
- Days Left in Month

**Funnel card** (Leads → Contacted → Quotes → Closed) with conversion % between each stage, plus close rate (closed/leads).

**Daily revenue trend** (LineChart from recharts, x = day of month, y = revenue) — same chart style as Dashboard.

**Energy log** — small table of last 14 days showing date + energy_level emoji.

**Recent entries** — paginated table (date, job, qty, price/pc, revenue, energy) like the one in SalesTrackerTab, but read-only.

All queries filter `sales_entries` by `salesperson = <resolved key>` and `entry_date` within selected month. Realtime subscription invalidates on `sales_entries` changes.

## 4. Users tab tweak

Add a small "Salesperson" column + inline select in `src/components/crm/UsersTab.tsx` so admin can map each user to a salesperson key (writes to `profiles`).

## Technical notes

- Reuse styling tokens (`C`, `HERO_GRADIENT`, `BORDER_COL`) from `DashboardTab.tsx` — extract to `src/components/crm/dashboardStyles.ts` for sharing.
- Admin detection: `supabase.from('user_roles').select('role').eq('user_id', user.id)` then check for `admin`/`superadmin`.
- Email `hilmanhashim` → ensure his profile row has `salesperson_key='HILMAN ACD'` (admin can set after migration).

## Files touched
- migration: create `profiles` table + RLS
- `src/pages/CRM.tsx` (add tab)
- `src/components/crm/MyKpiTab.tsx` (new)
- `src/components/crm/dashboardStyles.ts` (new, extracted tokens)
- `src/components/crm/UsersTab.tsx` (add salesperson mapping UI)
