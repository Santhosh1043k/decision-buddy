import { Brain, Lightbulb, ShieldAlert, TrendingUp, CheckCircle2, Clock, AlertTriangle, GitBranch } from 'lucide-react';
import type { DecisionIntelligenceAnalysis } from '@/lib/slm';

interface DecisionInsightProps {
  analysis: DecisionIntelligenceAnalysis;
}

const DecisionInsight = ({ analysis }: DecisionInsightProps) => {
  return (
    <div className="space-y-6">
      {/* Situation Summary */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Situation Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.situationSummary}</p>
          </div>
        </div>
      </div>

      {/* Emotional Insight */}
      <div className="p-4 bg-amber-50 dark:from-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Emotional Insight</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.emotionalInsight}</p>
          </div>
        </div>
      </div>

      {/* Key Factors */}
      {analysis.keyFactorsAndConstraints.length > 0 && (
        <div className="p-4 bg-slate-50 dark:from-slate-950/20 rounded-lg border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-foreground mb-3">Key Factors & Constraints</h3>
          <ul className="space-y-2">
            {analysis.keyFactorsAndConstraints.map((factor, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Options Analysis */}
      {analysis.optionsAnalysis.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Options Analysis</h3>
          <div className="space-y-4">
            {analysis.optionsAnalysis.map((optionAnalysis, index) => (
              <div
                key={index}
                className="p-4 bg-background rounded-lg border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <h4 className="font-medium text-foreground mb-3">{optionAnalysis.option}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-foreground">Pros</span>
                    </div>
                    <ul className="space-y-1.5 ml-6">
                      {optionAnalysis.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-muted-foreground">{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-foreground">Cons</span>
                    </div>
                    <ul className="space-y-1.5 ml-6">
                      {optionAnalysis.cons.map((con, i) => (
                        <li key={i} className="text-xs text-muted-foreground">{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  <strong className="text-foreground">Likely Outcome:</strong> {optionAnalysis.likelyOutcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks & Trade-offs */}
      {analysis.risksAndTradeoffs.length > 0 && (
        <div className="p-4 bg-red-50 dark:from-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-3">Risks & Trade-offs</h3>
              <ul className="space-y-2">
                {analysis.risksAndTradeoffs.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Decision */}
      <div className="p-4 bg-green-50 dark:from-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">Recommended Decision</h3>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">{analysis.recommendedDecision.option}</p>
            <p className="text-sm text-muted-foreground">{analysis.recommendedDecision.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Backup Plan */}
      <div className="p-4 bg-slate-50 dark:from-slate-950/20 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <GitBranch className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">Backup Plan</h3>
            <p className="text-sm font-medium text-foreground mb-2">{analysis.backupPlan.option}</p>
            <p className="text-sm text-muted-foreground">{analysis.backupPlan.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Immediate Next Steps */}
      {analysis.immediateNextSteps.length > 0 && (
        <div className="p-4 bg-blue-50 dark:from-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-3">Immediate Next Steps</h3>
              <ol className="space-y-2">
                {analysis.immediateNextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionInsight;
