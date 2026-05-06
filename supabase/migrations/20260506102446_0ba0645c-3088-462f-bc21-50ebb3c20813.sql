CREATE TABLE public.monthly_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  month integer NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (year, month)
);

ALTER TABLE public.monthly_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view monthly targets" ON public.monthly_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert monthly targets" ON public.monthly_targets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update monthly targets" ON public.monthly_targets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete monthly targets" ON public.monthly_targets FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_monthly_targets_updated_at
BEFORE UPDATE ON public.monthly_targets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.monthly_targets (year, month, target_amount) VALUES
  (2026, 4, 50000),
  (2026, 5, 55000)
ON CONFLICT (year, month) DO NOTHING;