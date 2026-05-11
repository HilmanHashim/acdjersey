
CREATE TABLE public.jobsheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  job_name TEXT NOT NULL,
  date_in DATE,
  date_out DATE,
  total_pcs INTEGER NOT NULL DEFAULT 0,
  entries JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jobsheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view jobsheets"
  ON public.jobsheets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated create jobsheets"
  ON public.jobsheets FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creator or admin update jobsheets"
  ON public.jobsheets FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'superadmin'));

CREATE POLICY "Creator or admin delete jobsheets"
  ON public.jobsheets FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'superadmin'));

CREATE TRIGGER update_jobsheets_updated_at
  BEFORE UPDATE ON public.jobsheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_jobsheets_created_at ON public.jobsheets(created_at DESC);
