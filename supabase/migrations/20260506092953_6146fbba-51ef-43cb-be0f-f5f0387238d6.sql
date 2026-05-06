
-- Sales tracker entries (one row per salesperson per day)
CREATE TABLE public.sales_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson TEXT NOT NULL,
  entry_date DATE NOT NULL,
  job_name TEXT,
  jersey_type TEXT,
  quantity INTEGER,
  price_per_pc NUMERIC,
  new_leads INTEGER NOT NULL DEFAULT 0,
  prospects_contacted INTEGER NOT NULL DEFAULT 0,
  quotations_sent INTEGER NOT NULL DEFAULT 0,
  orders_closed INTEGER NOT NULL DEFAULT 0,
  revenue_closed NUMERIC NOT NULL DEFAULT 0,
  activity_today TEXT,
  energy_level TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_entries_sp_date ON public.sales_entries (salesperson, entry_date);

ALTER TABLE public.sales_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view sales entries"
  ON public.sales_entries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert sales entries"
  ON public.sales_entries FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update sales entries"
  ON public.sales_entries FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can delete sales entries"
  ON public.sales_entries FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_sales_entries_updated_at
  BEFORE UPDATE ON public.sales_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.sales_entries REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_entries;
