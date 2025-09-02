-- Lägg till unik constraint på email för att undvika dubbletter
ALTER TABLE public.organizations 
ADD CONSTRAINT organizations_email_unique UNIQUE (email);

-- Lägg till index för bättre prestanda vid sökningar
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON public.organizations(industry);
CREATE INDEX IF NOT EXISTS idx_organizations_location ON public.organizations(location);
CREATE INDEX IF NOT EXISTS idx_organizations_company_size ON public.organizations(company_size);