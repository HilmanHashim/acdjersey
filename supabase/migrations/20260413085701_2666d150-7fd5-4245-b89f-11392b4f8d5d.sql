
-- Create enquiry status enum
CREATE TYPE public.enquiry_status AS ENUM ('new', 'contacted', 'converted', 'closed');

-- Create enquiries table
CREATE TABLE public.enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  organisation TEXT,
  estimated_quantity INTEGER,
  jersey_type TEXT,
  status enquiry_status NOT NULL DEFAULT 'new',
  followed_up_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form)
CREATE POLICY "Anyone can submit enquiry"
ON public.enquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can view
CREATE POLICY "Authenticated users can view enquiries"
ON public.enquiries
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update enquiries"
ON public.enquiries
FOR UPDATE
TO authenticated
USING (true);

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete enquiries"
ON public.enquiries
FOR DELETE
TO authenticated
USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_enquiries_updated_at
BEFORE UPDATE ON public.enquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
