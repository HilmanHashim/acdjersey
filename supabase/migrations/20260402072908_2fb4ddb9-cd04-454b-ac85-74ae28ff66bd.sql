
-- Drop the existing SELECT policy on leads
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;

-- Create new SELECT policy: admin/superadmin see all, others see only their own
CREATE POLICY "Users can view own leads, admins see all"
ON public.leads FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'superadmin'::app_role)
);
