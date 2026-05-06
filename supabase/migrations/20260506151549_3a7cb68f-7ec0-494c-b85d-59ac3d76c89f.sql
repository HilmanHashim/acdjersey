
-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text,
  base_price numeric NOT NULL DEFAULT 0,
  images text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

CREATE POLICY "Admins manage products insert"
  ON public.products FOR INSERT
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

CREATE POLICY "Admins manage products update"
  ON public.products FOR UPDATE
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

CREATE POLICY "Admins manage products delete"
  ON public.products FOR DELETE
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

CREATE TRIGGER trg_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCT VARIANTS
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  option_type text NOT NULL,
  option_value text NOT NULL,
  price_delta numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active variants"
  ON public.product_variants FOR SELECT
  USING (is_active = true OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

CREATE POLICY "Admins insert variants"
  ON public.product_variants FOR INSERT
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

CREATE POLICY "Admins update variants"
  ON public.product_variants FOR UPDATE
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

CREATE POLICY "Admins delete variants"
  ON public.product_variants FOR DELETE
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role));

-- SHOP ORDERS
CREATE TABLE public.shop_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  shipping_address text NOT NULL,
  subtotal numeric NOT NULL DEFAULT 0,
  shipping_fee numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place an order"
  ON public.shop_orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Staff view shop orders"
  ON public.shop_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff update shop orders"
  ON public.shop_orders FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Staff delete shop orders"
  ON public.shop_orders FOR DELETE
  TO authenticated
  USING (true);

CREATE TRIGGER trg_shop_orders_updated
  BEFORE UPDATE ON public.shop_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SHOP ORDER ITEMS
CREATE TABLE public.shop_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text NOT NULL,
  selected_options jsonb NOT NULL DEFAULT '{}'::jsonb,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_shop_order_items_order ON public.shop_order_items(order_id);
ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert order items"
  ON public.shop_order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Staff view order items"
  ON public.shop_order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff update order items"
  ON public.shop_order_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Staff delete order items"
  ON public.shop_order_items FOR DELETE
  TO authenticated
  USING (true);

-- ORDER NUMBER GENERATOR
CREATE OR REPLACE FUNCTION public.generate_shop_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ts text := to_char(now(),'YYYYMMDDHH24MISS');
  rnd text := lpad(floor(random()*1000)::text, 3, '0');
BEGIN
  RETURN 'SO-' || ts || '-' || rnd;
END;
$$;

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images','product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role))
  );

CREATE POLICY "Admins update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role))
  );

CREATE POLICY "Admins delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'superadmin'::app_role))
  );
