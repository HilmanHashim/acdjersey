ALTER TABLE public.invoices_log ADD COLUMN client_name TEXT DEFAULT NULL;
ALTER TABLE public.invoices_log ADD COLUMN client_phone TEXT DEFAULT NULL;
ALTER TABLE public.invoices_log ADD COLUMN project_title TEXT DEFAULT NULL;