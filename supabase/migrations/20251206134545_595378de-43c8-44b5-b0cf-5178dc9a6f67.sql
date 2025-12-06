-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for storing user Home Assistant configurations
CREATE TABLE public.user_ha_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_url TEXT NOT NULL,
  access_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_ha_configs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own config
CREATE POLICY "Users can view their own HA config"
ON public.user_ha_configs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own config
CREATE POLICY "Users can insert their own HA config"
ON public.user_ha_configs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own config
CREATE POLICY "Users can update their own HA config"
ON public.user_ha_configs
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own config
CREATE POLICY "Users can delete their own HA config"
ON public.user_ha_configs
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_ha_configs_updated_at
BEFORE UPDATE ON public.user_ha_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();