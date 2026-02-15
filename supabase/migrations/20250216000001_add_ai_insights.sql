-- Add AI Insights support to saved_decisions table

ALTER TABLE public.saved_decisions
ADD COLUMN IF NOT EXISTS ai_insights JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS devils_advocate_questions JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the new fields
COMMENT ON COLUMN public.saved_decisions.ai_insights IS 'Decision Intelligence Agent analysis including situation summary, emotional insight, options analysis, risks, recommendations, and next steps';
COMMENT ON COLUMN public.saved_decisions.devils_advocate_questions IS 'Critical thinking questions to challenge the decision from different angles';
