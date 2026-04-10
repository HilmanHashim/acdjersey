
-- Table to track invoice number sequences per month/year
CREATE TABLE public.invoice_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  UNIQUE (year, month)
);

ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sequences"
  ON public.invoice_sequences FOR SELECT TO authenticated
  USING (true);

-- Function to atomically get next invoice number
CREATE OR REPLACE FUNCTION public.get_next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM now());
  current_month INTEGER := EXTRACT(MONTH FROM now());
  next_num INTEGER;
BEGIN
  -- Upsert: increment if exists, insert with 1 if not
  INSERT INTO public.invoice_sequences (year, month, last_number)
  VALUES (current_year, current_month, 1)
  ON CONFLICT (year, month)
  DO UPDATE SET last_number = invoice_sequences.last_number + 1
  RETURNING last_number INTO next_num;

  -- Return formatted: 00001/MM/YYYY
  RETURN LPAD(next_num::TEXT, 5, '0') || '/' || LPAD(current_month::TEXT, 2, '0') || '/' || current_year::TEXT;
END;
$$;

-- Log of generated invoices for tracking/voiding
CREATE TABLE public.invoices_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  title TEXT,
  total_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invoices"
  ON public.invoices_log FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create invoices"
  ON public.invoices_log FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creator or admin can update invoices"
  ON public.invoices_log FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));
