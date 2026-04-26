DROP POLICY IF EXISTS "Admins can manage invoice sequences" ON public.invoice_sequences;

CREATE POLICY "Admins can manage invoice sequences"
ON public.invoice_sequences
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'superadmin'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'superadmin'::app_role)
);

CREATE OR REPLACE FUNCTION public.set_invoice_sequence(
  target_year integer,
  target_month integer,
  target_last_number integer
)
RETURNS public.invoice_sequences
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_sequence public.invoice_sequences;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'superadmin'::app_role)
  ) THEN
    RAISE EXCEPTION 'Only admins can update invoice sequences';
  END IF;

  IF target_year < 2000 OR target_year > 2100 THEN
    RAISE EXCEPTION 'Year must be between 2000 and 2100';
  END IF;

  IF target_month < 1 OR target_month > 12 THEN
    RAISE EXCEPTION 'Month must be between 1 and 12';
  END IF;

  IF target_last_number < 0 THEN
    RAISE EXCEPTION 'Last number cannot be negative';
  END IF;

  INSERT INTO public.invoice_sequences (year, month, last_number)
  VALUES (target_year, target_month, target_last_number)
  ON CONFLICT (year, month)
  DO UPDATE SET last_number = EXCLUDED.last_number
  RETURNING * INTO updated_sequence;

  RETURN updated_sequence;
END;
$$;