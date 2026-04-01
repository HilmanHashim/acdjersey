
CREATE TYPE public.lead_stage AS ENUM ('cold', 'prospect', 'first_buy');

CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT,
  name TEXT NOT NULL DEFAULT 'Customer',
  note TEXT,
  date DATE,
  type_of_custom TEXT,
  leads_from TEXT,
  stage public.lead_stage NOT NULL DEFAULT 'cold',
  number_of_pcs INTEGER,
  purchase_amount NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete leads" ON public.leads FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
