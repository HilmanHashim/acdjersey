CREATE POLICY "Creator or admin can delete invoice logs"
ON public.invoices_log
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'superadmin'::app_role)
);