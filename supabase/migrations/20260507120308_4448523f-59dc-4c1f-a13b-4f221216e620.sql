CREATE TABLE public.personal_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month)
);

ALTER TABLE public.personal_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own personal targets or admin"
ON public.personal_targets FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'superadmin'));

CREATE POLICY "Insert own personal targets or admin"
ON public.personal_targets FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'superadmin'));

CREATE POLICY "Update own personal targets or admin"
ON public.personal_targets FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'superadmin'));

CREATE POLICY "Delete own personal targets or admin"
ON public.personal_targets FOR DELETE TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'superadmin'));

CREATE TRIGGER personal_targets_updated_at
BEFORE UPDATE ON public.personal_targets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();