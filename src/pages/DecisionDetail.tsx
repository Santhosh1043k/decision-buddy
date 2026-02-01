import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Loader2, Trophy, Heart, Brain, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { Option, Priority } from '@/types/decision';
import {
  analyzeOptionEmotions,
  detectCognitivePatterns,
  getEmotionColor,
} from '@/lib/emotionDetection';

interface SavedDecisionFull {
  id: string;
  decision: string;
  options: Option[];
  priorities: Priority[];
  recommendation: {
    winnerId: string;
    winnerName: string;
    scores: Array<{
      optionId: string;
      optionName: string;
      totalScore: number;
      percentage: number;
    }>;
    logicalInsight: string;
    emotionalInsight: string;
  };
  created_at: string;
}

const DecisionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [decision, setDecision] = useState<SavedDecisionFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchDecision = async () => {
      if (!user || !id) return;

      const { data, error } = await supabase
        .from('saved_decisions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching decision:', error);
        navigate('/dashboard');
      } else if (data) {
        setDecision({
          id: data.id,
          decision: data.decision,
          options: data.options as unknown as Option[],
          priorities: data.priorities as unknown as Priority[],
          recommendation: data.recommendation as unknown as SavedDecisionFull['recommendation'],
          created_at: data.created_at,
        });
      }
      setLoading(false);
    };

    if (user) {
      fetchDecision();
    }
  }, [user, id, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!decision) {
    return null;
  }

  const emotionalAnalyses = analyzeOptionEmotions(decision.options);
  const winnerAnalysis = emotionalAnalyses.find((a) => a.optionId === decision.recommendation.winnerId);
  const cognitivePatterns = detectCognitivePatterns(
    decision.options,
    emotionalAnalyses,
    decision.recommendation.winnerId
  );
  const detectedPatterns = cognitivePatterns.filter((p) => p.detected);
  const hasEmotionalData = decision.options.some((o) => o.emotionalText?.trim());

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto py-8 px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar size={14} />
            <span>{format(new Date(decision.created_at), 'MMMM d, yyyy')}</span>
          </div>

          <h1 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
            {decision.decision}
          </h1>
        </motion.div>

        {/* Winner Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-calm mb-6 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Recommended Choice</p>
          <h2 className="font-serif text-2xl font-medium text-foreground">
            {decision.recommendation.winnerName}
          </h2>
        </motion.div>

        {/* Logical Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-calm mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Logical Analysis</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {decision.recommendation.logicalInsight}
          </p>
        </motion.div>

        {/* Emotional Insight */}
        {hasEmotionalData && decision.recommendation.emotionalInsight && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-calm mb-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Emotional Insight</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {decision.recommendation.emotionalInsight}
            </p>
            {winnerAnalysis && winnerAnalysis.emotions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {winnerAnalysis.emotions.slice(0, 3).map((emotion) => (
                  <span
                    key={emotion.type}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${getEmotionColor(emotion.type)}20`,
                      color: getEmotionColor(emotion.type),
                    }}
                  >
                    {emotion.label}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Cognitive Patterns */}
        {detectedPatterns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-calm mb-6 border-l-4 border-accent"
          >
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Something to Consider</span>
            </div>
            <div className="space-y-2">
              {detectedPatterns.slice(0, 2).map((pattern) => (
                <div key={pattern.id}>
                  <span className="text-xs font-medium text-accent">{pattern.label}</span>
                  <p className="text-muted-foreground text-sm">{pattern.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Options Scores */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-medium text-foreground mb-3">All Options</h3>
          <div className="space-y-3">
            {decision.recommendation.scores.map((score, index) => (
              <div
                key={score.optionId}
                className={`card-calm ${index === 0 ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{score.optionName}</span>
                  </div>
                  <span className="text-lg font-serif text-primary font-medium">
                    {score.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${score.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DecisionDetail;
