-- Create table for user device mappings (entity configurations)
CREATE TABLE public.user_ha_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  devices_mapping JSONB NOT NULL DEFAULT '{"rooms": []}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_ha_devices ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_ha_devices
CREATE POLICY "Users can view their own devices" 
ON public.user_ha_devices 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" 
ON public.user_ha_devices 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" 
ON public.user_ha_devices 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" 
ON public.user_ha_devices 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_ha_devices_updated_at
BEFORE UPDATE ON public.user_ha_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();