-- Create storage buckets for demo files and portfolio assets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('demo-files', 'demo-files', false),
  ('portfolio-assets', 'portfolio-assets', true);

-- Create storage policies for demo files (private)
CREATE POLICY "Users can view their own demo files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'demo-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own demo files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'demo-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own demo files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'demo-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own demo files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'demo-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for portfolio assets (public for sharing)
CREATE POLICY "Portfolio images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Users can upload portfolio assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'portfolio-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own portfolio assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'portfolio-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own portfolio assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'portfolio-assets' AND auth.uid()::text = (storage.foldername(name))[1]);