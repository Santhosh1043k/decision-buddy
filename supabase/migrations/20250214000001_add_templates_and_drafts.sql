-- Create decision_templates table for pre-configured decision templates
CREATE TABLE public.decision_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('career', 'financial', 'relationships', 'lifestyle', 'health')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  example_decision TEXT NOT NULL,
  suggested_priorities JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create decision_drafts table for auto-saving user progress
CREATE TABLE public.decision_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  draft_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- One draft per user
);

-- Enable Row Level Security on decision_drafts
ALTER TABLE public.decision_drafts ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own drafts
CREATE POLICY "Users can view their own drafts"
  ON public.decision_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own drafts
CREATE POLICY "Users can insert their own drafts"
  ON public.decision_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own drafts
CREATE POLICY "Users can update their own drafts"
  ON public.decision_drafts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own drafts
CREATE POLICY "Users can delete their own drafts"
  ON public.decision_drafts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on decision_drafts
CREATE TRIGGER update_decision_drafts_updated_at
  BEFORE UPDATE ON public.decision_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on decision_templates
CREATE TRIGGER update_decision_templates_updated_at
  BEFORE UPDATE ON public.decision_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_decision_drafts_user_id ON public.decision_drafts(user_id);
CREATE INDEX idx_decision_templates_category ON public.decision_templates(category);
CREATE INDEX idx_decision_templates_is_active ON public.decision_templates(is_active);

-- Insert initial template data
INSERT INTO public.decision_templates (category, title, description, example_decision, suggested_priorities) VALUES
('career', 'Job Offer Evaluation', 'Compare job opportunities considering compensation, growth, culture, and work-life balance.', 'Should I accept the senior developer position at TechCorp?', 
'[
  {"id": "compensation", "label": "Compensation", "description": "Salary, benefits, equity, and perks", "value": 4},
  {"id": "growth", "label": "Career Growth", "description": "Learning opportunities and advancement potential", "value": 5},
  {"id": "culture", "label": "Company Culture", "description": "Team dynamics and workplace environment", "value": 4},
  {"id": "worklife", "label": "Work-Life Balance", "description": "Flexibility, hours, and remote options", "value": 3},
  {"id": "impact", "label": "Impact", "description": "Meaningful work and influence on product", "value": 3}
]'::jsonb),

('career', 'Career Change Decision', 'Evaluate switching to a different field or industry with focus on fulfillment and risk.', 'Should I transition from engineering to product management?',
'[
  {"id": "fulfillment", "label": "Fulfillment", "description": "Passion and long-term satisfaction", "value": 5},
  {"id": "financial", "label": "Financial Impact", "description": "Income changes during transition", "value": 4},
  {"id": "skills", "label": "Skill Transfer", "description": "Relevance of existing skills", "value": 3},
  {"id": "risk", "label": "Risk Tolerance", "description": "Career stability and uncertainty", "value": 4},
  {"id": "timeline", "label": "Timeline", "description": "Time to proficiency and success", "value": 3}
]'::jsonb),

('financial', 'Home Buying Decision', 'Decide whether to buy a home or continue renting, considering finances and lifestyle goals.', 'Should I buy a house or continue renting?',
'[
  {"id": "affordability", "label": "Affordability", "description": "Monthly costs and down payment", "value": 5},
  {"id": "flexibility", "label": "Flexibility", "description": "Ability to relocate easily", "value": 4},
  {"id": "investment", "label": "Investment Value", "description": "Equity building and appreciation", "value": 4},
  {"id": "maintenance", "label": "Maintenance", "description": "Time and cost of upkeep", "value": 3},
  {"id": "stability", "label": "Stability", "description": "Long-term living security", "value": 4}
]'::jsonb),

('financial', 'Major Purchase Decision', 'Evaluate a significant purchase like a car, comparing financial impact with practical benefits.', 'Should I buy a new car or continue using public transit?',
'[
  {"id": "cost", "label": "Total Cost", "description": "Purchase price, insurance, and maintenance", "value": 5},
  {"id": "convenience", "label": "Convenience", "description": "Time savings and accessibility", "value": 4},
  {"id": "environmental", "label": "Environmental Impact", "description": "Sustainability considerations", "value": 3},
  {"id": "necessity", "label": "Necessity", "description": "Essential vs. luxury purchase", "value": 4},
  {"id": "alternatives", "label": "Alternatives", "description": "Other options available", "value": 3}
]'::jsonb),

('relationships', 'Moving In Together', 'Decide whether to move in with your partner, balancing relationship goals with practical concerns.', 'Should I move in with my partner?',
'[
  {"id": "readiness", "label": "Relationship Readiness", "description": "Stage and strength of relationship", "value": 5},
  {"id": "financial", "label": "Financial Benefits", "description": "Shared expenses and savings", "value": 3},
  {"id": "independence", "label": "Independence", "description": "Personal space and autonomy", "value": 4},
  {"id": "compatibility", "label": "Living Compatibility", "description": "Lifestyle and habits alignment", "value": 4},
  {"id": "commitment", "label": "Commitment Level", "description": "Long-term intentions", "value": 5}
]'::jsonb),

('relationships', 'Long-Distance Relationship', 'Evaluate whether to pursue or continue a long-distance relationship with your partner.', 'Should I try a long-distance relationship?',
'[
  {"id": "connection", "label": "Emotional Connection", "description": "Depth of bond and communication", "value": 5},
  {"id": "logistics", "label": "Logistics", "description": "Travel costs and time zones", "value": 4},
  {"id": "timeline", "label": "End Timeline", "description": "Plan to eventually be together", "value": 5},
  {"id": "trust", "label": "Trust", "description": "Confidence in the relationship", "value": 4},
  {"id": "sacrifice", "label": "Sacrifice", "description": "Social life and local opportunities", "value": 3}
]'::jsonb),

('lifestyle', 'City Relocation', 'Consider relocating to a new city for career, lifestyle, or personal reasons.', 'Should I relocate to a new city for better opportunities?',
'[
  {"id": "opportunity", "label": "Opportunities", "description": "Career and personal growth potential", "value": 5},
  {"id": "cost", "label": "Cost of Living", "description": "Housing, expenses, and savings impact", "value": 4},
  {"id": "social", "label": "Social Network", "description": "Friends, family, and community", "value": 4},
  {"id": "lifestyle", "label": "Lifestyle Fit", "description": "Culture, climate, and activities", "value": 4},
  {"id": "risk", "label": "Risk", "description": "Job security and adaptation challenges", "value": 3}
]'::jsonb),

('lifestyle', 'Graduate School Decision', 'Decide whether to pursue advanced education, weighing career benefits against time and cost.', 'Should I go to graduate school?',
'[
  {"id": "career", "label": "Career Impact", "description": "Required for goals and salary increase", "value": 5},
  {"id": "cost", "label": "Financial Cost", "description": "Tuition, loans, and lost income", "value": 5},
  {"id": "passion", "label": "Passion", "description": "Interest in subject matter", "value": 4},
  {"id": "timing", "label": "Timing", "description": "Right stage of life and career", "value": 3},
  {"id": "alternatives", "label": "Alternatives", "description": "Other paths to same goals", "value": 4}
]'::jsonb),

('health', 'Fitness Routine Change', 'Evaluate switching to a new workout routine or fitness program for better results.', 'Should I switch from gym workouts to CrossFit?',
'[
  {"id": "effectiveness", "label": "Effectiveness", "description": "Goal alignment and results", "value": 5},
  {"id": "enjoyment", "label": "Enjoyment", "description": "Sustainability and fun factor", "value": 4},
  {"id": "cost", "label": "Cost", "description": "Membership and equipment expenses", "value": 3},
  {"id": "time", "label": "Time Commitment", "description": "Schedule fit and convenience", "value": 4},
  {"id": "safety", "label": "Safety", "description": "Injury risk and proper guidance", "value": 4}
]'::jsonb),

('health', 'Dietary Change Decision', 'Consider adopting a new diet or eating pattern for health, ethical, or lifestyle reasons.', 'Should I transition to a plant-based diet?',
'[
  {"id": "health", "label": "Health Benefits", "description": "Nutrition and wellness impact", "value": 5},
  {"id": "practicality", "label": "Practicality", "description": "Ease of implementation and dining out", "value": 4},
  {"id": "cost", "label": "Cost", "description": "Food budget changes", "value": 3},
  {"id": "values", "label": "Values Alignment", "description": "Ethical and environmental beliefs", "value": 4},
  {"id": "social", "label": "Social Impact", "description": "Family meals and social situations", "value": 3}
]'::jsonb);
