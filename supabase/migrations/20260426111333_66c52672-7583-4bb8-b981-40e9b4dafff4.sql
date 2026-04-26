ALTER TABLE public.invoices_log
ADD COLUMN IF NOT EXISTS invoice_date date,
ADD COLUMN IF NOT EXISTS material text,
ADD COLUMN IF NOT EXISTS agent text,
ADD COLUMN IF NOT EXISTS customer_address text,
ADD COLUMN IF NOT EXISTS jersey_items jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS design_items jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS validity text,
ADD COLUMN IF NOT EXISTS payment_term text,
ADD COLUMN IF NOT EXISTS delivery_term text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS shirt_deposit_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS shirt_deposit_mode text NOT NULL DEFAULT 'percent',
ADD COLUMN IF NOT EXISTS shirt_deposit_percent numeric NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS shirt_deposit_custom numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS lock_deposit_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_note text,
ADD COLUMN IF NOT EXISTS manager_name text,
ADD COLUMN IF NOT EXISTS manager_title text,
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS account_number text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS contact_email text;

CREATE INDEX IF NOT EXISTS idx_invoices_log_created_at ON public.invoices_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_log_invoice_number ON public.invoices_log (invoice_number);