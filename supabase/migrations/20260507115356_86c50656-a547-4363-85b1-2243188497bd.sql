CREATE TABLE public.profiles (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  salesperson_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "User inserts own profile or admin" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

CREATE POLICY "User updates own profile or admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

CREATE POLICY "Admin deletes profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();