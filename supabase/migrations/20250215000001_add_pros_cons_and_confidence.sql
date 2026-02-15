-- Add columns to saved_decisions table
ALTER TABLE saved_decisions ADD COLUMN IF NOT EXISTS confidence_score INTEGER;
ALTER TABLE saved_decisions ADD COLUMN IF NOT EXISTS reflection_notes TEXT;
ALTER TABLE saved_decisions ADD COLUMN IF NOT EXISTS pros_cons JSONB DEFAULT '[]'::jsonb;

-- Create table for decision outcomes (preparing for Phase 4)
CREATE TABLE IF NOT EXISTS decision_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES saved_decisions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  what_happened TEXT,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 10),
  would_choose_differently BOOLEAN,
  lessons_learned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE decision_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own outcomes" ON decision_outcomes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own outcomes" ON decision_outcomes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own outcomes" ON decision_outcomes FOR UPDATE USING (user_id = auth.uid());

-- Create trigger for automatic timestamp updates on decision_outcomes
CREATE TRIGGER IF NOT EXISTS update_decision_outcomes_updated_at
  BEFORE UPDATE ON decision_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
