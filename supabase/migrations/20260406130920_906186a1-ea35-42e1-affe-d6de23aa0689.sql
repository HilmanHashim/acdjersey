
-- Fix contacts RLS: scope to owner + admins
DROP POLICY "Authenticated users can view contacts" ON contacts;
DROP POLICY "Authenticated users can create contacts" ON contacts;
DROP POLICY "Authenticated users can update contacts" ON contacts;
DROP POLICY "Authenticated users can delete contacts" ON contacts;

CREATE POLICY "Users view own contacts, admins see all" ON contacts FOR SELECT
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Users create own contacts" ON contacts FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users update own contacts" ON contacts FOR UPDATE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Users delete own contacts" ON contacts FOR DELETE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Fix orders RLS: scope to owner + admins
DROP POLICY "Authenticated users can view orders" ON orders;
DROP POLICY "Authenticated users can create orders" ON orders;
DROP POLICY "Authenticated users can update orders" ON orders;
DROP POLICY "Authenticated users can delete orders" ON orders;

CREATE POLICY "Users view own orders, admins see all" ON orders FOR SELECT
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Users create own orders" ON orders FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users update own orders" ON orders FOR UPDATE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Users delete own orders" ON orders FOR DELETE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Fix leads RLS: scope UPDATE and DELETE to owner + admins
DROP POLICY "Authenticated users can delete leads" ON leads;
DROP POLICY "Authenticated users can update leads" ON leads;

CREATE POLICY "Users update own leads, admins update all" ON leads FOR UPDATE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Users delete own leads, admins delete all" ON leads FOR DELETE
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Fix leads INSERT to enforce ownership
DROP POLICY "Authenticated users can create leads" ON leads;
CREATE POLICY "Users create own leads" ON leads FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Fix user_roles: prevent admin from granting/deleting superadmin
DROP POLICY "Admins can insert roles" ON user_roles;
DROP POLICY "Admins can delete roles" ON user_roles;

CREATE POLICY "Admins assign non-superadmin roles" ON user_roles FOR INSERT
  WITH CHECK (
    (has_role(auth.uid(), 'admin'::app_role) AND role <> 'superadmin'::app_role)
    OR has_role(auth.uid(), 'superadmin'::app_role)
  );

CREATE POLICY "Admins delete non-superadmin roles" ON user_roles FOR DELETE
  USING (
    (has_role(auth.uid(), 'admin'::app_role) AND role <> 'superadmin'::app_role)
    OR has_role(auth.uid(), 'superadmin'::app_role)
  );
