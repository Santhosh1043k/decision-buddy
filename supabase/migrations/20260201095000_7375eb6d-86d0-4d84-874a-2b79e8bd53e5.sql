-- Create saved_decisions table for storing user decisions
CREATE TABLE public.saved_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  decision TEXT NOT NULL,
  options JSONB NOT NULL,
  priorities JSONB NOT NULL,
  recommendation JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_decisions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own decisions
CREATE POLICY "Users can view their own decisions"
  ON public.saved_decisions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own decisions
CREATE POLICY "Users can insert their own decisions"
  ON public.saved_decisions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own decisions
CREATE POLICY "Users can delete their own decisions"
  ON public.saved_decisions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saved_decisions_updated_at
  BEFORE UPDATE ON public.saved_decisions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();