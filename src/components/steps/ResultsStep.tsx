import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Heart, Brain, MessageCircle, ThumbsUp, ThumbsDown, Moon, TrendingUp, Sparkles, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import type { Option, Priority } from '@/types/decision';
import {
  analyzeOptionEmotions,
  detectCognitivePatterns,
  getEmotionalInsight,
  getEmotionColor,
} from '@/lib/emotionDetection';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ResultsStepProps {
  decision: string;
  options: Option[];
  priorities: Priority[];
  confidenceScore?: number;
  reflectionNotes?: string;
  onReset: () => void;
}

const ResultsStep = ({ decision, options, priorities, confidenceScore, reflectionNotes, onReset }: ResultsStepProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const hasSavedRef = useRef(false);

  // Calculate weighted scores
  const scoredOptions: ScoredOption[] = options.map((option) => {
    const breakdown = priorities.map((priority) => {
      const score = option.scores[priority.id] ?? 0;
      const weighted = score * priority.value;
      return { priority, weighted };
    });

    const totalScore = breakdown.reduce((sum, b) => sum + b.weighted, 0);

    return { option, totalScore, breakdown };
  });

  // Sort by total score descending
  scoredOptions.sort((a, b) => b.totalScore - a.totalScore);

  const winner = scoredOptions[0];
  const maxPossible = priorities.reduce((sum, p) => sum + p.value * 5, 0);

  // Emotional analysis
  const emotionalAnalyses = analyzeOptionEmotions(options);
  const cognitivePatterns = detectCognitivePatterns(options, emotionalAnalyses, winner.option.id);
  const winnerAnalysis = emotionalAnalyses.find((a) => a.optionId === winner.option.id);
  const emotionalInsight = getEmotionalInsight(winnerAnalysis, cognitivePatterns);
  const detectedPatterns = cognitivePatterns.filter((p) => p.detected);

  const getLogicalRecommendation = () => {
    const secondPlace = scoredOptions[1];
    if (!secondPlace) {
      return `Based on your priorities, "${winner.option.name}" is your only option.`;
    }
    const margin = winner.totalScore - secondPlace.totalScore;
    const percentMargin = (margin / maxPossible) * 100;

    if (percentMargin > 15) {
      return `Based on your priorities, "${winner.option.name}" scores notably higher across the factors you care about most.`;
    } else if (percentMargin > 5) {
      return `"${winner.option.name}" has a slight edge in your priority areas, though "${secondPlace.option.name}" comes close.`;
    } else {
      return `The logical analysis shows a near tie between "${winner.option.name}" and "${secondPlace.option.name}."`;
    }
  };

  const logicalInsightText = getLogicalRecommendation();
  const hasEmotionalData = options.some((o) => o.emotionalText?.trim());
  const hasProsConsData = options.some((o) => (o.pros?.length || 0) > 0 || (o.cons?.length || 0) > 0);

  // Get confidence insight
  const getConfidenceInsight = (score: number | undefined): { text: string; icon: typeof Sparkles; color: string } => {
    if (!score || score < 5) {
      return { 
        text: 'You seem uncertain. Consider reviewing your priorities or taking more time.', 
        icon: AlertCircle, 
        color: 'text-amber-600' 
      };
    } else if (score <= 7) {
      return { 
        text: 'Moderate confidence. Trust your analysis but stay open to new information.', 
        icon: HelpCircle, 
        color: 'text-blue-600' 
      };
    } else {
      return { 
        text: 'You feel confident in this direction. Trust your decision.', 
        icon: CheckCircle2, 
        color: 'text-green-600' 
      };
    }
  };

  const confidenceInsight = getConfidenceInsight(confidenceScore);
  const ConfidenceIcon = confidenceInsight.icon;

  // Save decision to database when component mounts (for logged in users)
  useEffect(() => {
    const saveDecision = async () => {
      if (!user || hasSavedRef.current) return;
      hasSavedRef.current = true;

      const recommendation = {
        winnerId: winner.option.id,
        winnerName: winner.option.name,
        scores: scoredOptions.map((s) => ({
          optionId: s.option.id,
          optionName: s.option.name,
          totalScore: s.totalScore,
          percentage: Math.round((s.totalScore / maxPossible) * 100),
        })),
        logicalInsight: logicalInsightText,
        emotionalInsight: emotionalInsight || '',
        confidenceScore,
      };

      const { error } = await supabase.from('saved_decisions').insert([{
        user_id: user.id,
        decision,
        options: JSON.parse(JSON.stringify(options)),
        priorities: JSON.parse(JSON.stringify(priorities)),
        recommendation: JSON.parse(JSON.stringify(recommendation)),
        confidence_score: confidenceScore,
        reflection_notes: reflectionNotes,
        pros_cons: JSON.parse(JSON.stringify(options.map(o => ({
          optionId: o.id,
          optionName: o.name,
          pros: o.pros || [],
          cons: o.cons || [],
        })))),
      }]);

      if (error) {
        console.error('Error saving decision:', error);
        toast({
          title: 'Could not save',
          description: 'Your decision was not saved to your history.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Decision saved',
          description: 'View it anytime in your dashboard.',
        });
      }
    };

    saveDecision();
  }, [user, decision, options, priorities, winner, scoredOptions, maxPossible, logicalInsightText, emotionalInsight, confidenceScore, reflectionNotes, toast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center min-h-[70vh] px-6 py-8"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">{decision}</p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
            Your Recommendation
          </h2>
        </motion.div>

        {/* Confidence Score */}
        {confidenceScore !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card-calm mb-4 border-2 border-primary/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ConfidenceIcon className={`w-5 h-5 ${confidenceInsight.color}`} />
                <span className="text-sm font-medium text-foreground">Your Confidence</span>
              </div>
              <Badge variant="secondary" className="font-serif text-lg px-3">
                {confidenceScore}/10
              </Badge>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidenceScore * 10}%` }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className={`h-full rounded-full ${
                  confidenceScore < 5 ? 'bg-amber-500' : 
                  confidenceScore <= 7 ? 'bg-blue-500' : 'bg-green-500'
                }`}
              />
            </div>
            <p className={`text-sm ${confidenceInsight.color}`}>
              {confidenceInsight.text}
            </p>
            {reflectionNotes && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Your notes:</p>
                <p className="text-sm text-foreground italic">"{reflectionNotes}"</p>
              </div>
            )}
          </motion.div>
        )}

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
            {getLogicalRecommendation()}
          </p>
        </motion.div>

        {/* Emotional Insight */}
        {hasEmotionalData && (
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
              {emotionalInsight || "Your emotions are complex—and that's perfectly normal. Take your time with this decision."}
            </p>

            {/* Detected emotions for winner */}
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

        {/* Rankings */}
        <div className="space-y-3 mb-6">
          {scoredOptions.map((scored, index) => {
            const analysis = emotionalAnalyses.find((a) => a.optionId === scored.option.id);

            return (
              <motion.div
                key={scored.option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`card-calm ${index === 0 ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{scored.option.name}</span>
                  </div>
                  <span className="text-xl font-serif text-primary font-medium">
                    {Math.round((scored.totalScore / maxPossible) * 100)}%
                  </span>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(scored.totalScore / maxPossible) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>

                {/* Emotions for each option */}
                {analysis && analysis.emotions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {analysis.emotions.slice(0, 2).map((emotion) => (
                      <span
                        key={emotion.type}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${getEmotionColor(emotion.type)}15`,
                          color: getEmotionColor(emotion.type),
                        }}
                      >
                        {emotion.label}
                      </span>
                    ))}
                  </div>
                )}

                {index === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.7 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <p className="text-sm text-muted-foreground mb-2">Top priority scores:</p>
                    <div className="space-y-1">
                      {scored.breakdown
                        .sort((a, b) => b.weighted - a.weighted)
                        .slice(0, 3)
                        .map((b) => (
                          <div key={b.priority.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{b.priority.label}</span>
                            <span className="text-foreground font-medium">{b.weighted} pts</span>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Pros & Cons Breakdown for Winner */}
        {hasProsConsData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="card-calm mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <ThumbsDown className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Pros & Cons for "{winner.option.name}"
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pros */}
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                  <ThumbsUp size={12} />
                  Pros ({winner.option.pros?.length || 0})
                </p>
                {winner.option.pros && winner.option.pros.length > 0 ? (
                  <ul className="space-y-1.5">
                    {winner.option.pros.map((pro, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">+</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No pros recorded</p>
                )}
              </div>

              {/* Cons */}
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
                  <ThumbsDown size={12} />
                  Cons ({winner.option.cons?.length || 0})
                </p>
                {winner.option.cons && winner.option.cons.length > 0 ? (
                  <ul className="space-y-1.5">
                    {winner.option.cons.map((con, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">-</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No cons recorded</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase 4 CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <button
            onClick={() => {
              toast({
                title: 'Sleep on it 💤',
                description: 'Your decision will be here when you return. Take the time you need.',
              });
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary hover:bg-muted transition-colors text-sm font-medium text-foreground"
          >
            <Moon size={18} />
            Sleep on it
          </button>
          <button
            onClick={() => {
              toast({
                title: 'Coming soon',
                description: 'Outcome tracking will be available in Phase 4.',
              });
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary hover:bg-muted transition-colors text-sm font-medium text-foreground"
          >
            <TrendingUp size={18} />
            Track outcome
          </button>
        </motion.div>

        {/* Final note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center mb-8 px-4"
        >
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            This analysis combines your stated priorities with emotional signals, but only you know the full picture. 
            <span className="block mt-2 text-foreground font-medium not-italic">
              The final choice is always yours. Trust yourself.
            </span>
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onReset}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Start New Decision
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ResultsStep;
