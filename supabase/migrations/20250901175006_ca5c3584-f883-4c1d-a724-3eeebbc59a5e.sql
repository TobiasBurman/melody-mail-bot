-- Create organizations table for target companies
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL, -- 'car_advertising', 'food_advertising', 'fashion', etc
  website TEXT,
  email TEXT NOT NULL,
  contact_person TEXT,
  company_size TEXT, -- 'startup', 'small', 'medium', 'large', 'enterprise'
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  target_industry TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sending', 'completed', 'paused'
  sent_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  replied_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create demo files table
CREATE TABLE public.demo_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'audio/mp3', 'audio/wav', etc
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio projects table
CREATE TABLE public.portfolio_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  client TEXT,
  industry TEXT,
  project_type TEXT, -- 'commercial', 'jingle', 'background_music', etc
  completion_date DATE,
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign results table for tracking individual emails
CREATE TABLE public.campaign_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'replied', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_results ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view all organizations" 
ON public.organizations 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert organizations" 
ON public.organizations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own email templates" 
ON public.email_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email templates" 
ON public.email_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email templates" 
ON public.email_templates 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own demo files" 
ON public.demo_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own demo files" 
ON public.demo_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own demo files" 
ON public.demo_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own demo files" 
ON public.demo_files 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own portfolio projects" 
ON public.portfolio_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio projects" 
ON public.portfolio_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio projects" 
ON public.portfolio_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio projects" 
ON public.portfolio_projects 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view campaign results for their campaigns" 
ON public.campaign_results 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_results.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can create campaign results for their campaigns" 
ON public.campaign_results 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_results.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can update campaign results for their campaigns" 
ON public.campaign_results 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_results.campaign_id 
  AND campaigns.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample organizations for testing
INSERT INTO public.organizations (name, industry, email, contact_person, company_size, location) VALUES
('Volvo Cars', 'car_advertising', 'marketing@volvo.com', 'Marketing Manager', 'large', 'Göteborg, Sweden'),
('McDonald''s Sweden', 'food_advertising', 'marketing@mcdonalds.se', 'Brand Manager', 'large', 'Stockholm, Sweden'),
('ICA Sverige', 'food_advertising', 'reklam@ica.se', 'Marketing Director', 'large', 'Stockholm, Sweden'),
('BMW Nordic', 'car_advertising', 'marketing@bmw.se', 'Creative Director', 'large', 'Stockholm, Sweden'),
('KFC Sweden', 'food_advertising', 'marketing@kfc.se', 'Marketing Manager', 'medium', 'Stockholm, Sweden'),
('Scania', 'car_advertising', 'marketing@scania.com', 'Communications Manager', 'large', 'Södertälje, Sweden'),
('Max Burgers', 'food_advertising', 'marketing@max.se', 'Brand Manager', 'medium', 'Gävle, Sweden'),
('Audi Sweden', 'car_advertising', 'marketing@audi.se', 'Marketing Director', 'large', 'Stockholm, Sweden');