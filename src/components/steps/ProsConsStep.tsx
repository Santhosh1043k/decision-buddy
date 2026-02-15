import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, KeyboardEvent } from 'react';
import { ThumbsUp, ThumbsDown, X, Plus, ArrowRight } from 'lucide-react';
import type { Option } from '@/types/decision';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProsConsStepProps {
  options: Option[];
  onOptionsChange: (options: Option[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const ProsConsStep = ({ options, onOptionsChange, onNext, onBack }: ProsConsStepProps) => {
  const [expandedOption, setExpandedOption] = useState<string | null>(options[0]?.id || null);
  const [newPro, setNewPro] = useState<Record<string, string>>({});
  const [newCon, setNewCon] = useState<Record<string, string>>({});
  const proInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const conInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addPro = (optionId: string) => {
    const text = newPro[optionId]?.trim();
    if (!text) return;

    onOptionsChange(
      options.map((o) =>
        o.id === optionId ? { ...o, pros: [...(o.pros || []), text] } : o
      )
    );
    setNewPro((prev) => ({ ...prev, [optionId]: '' }));
  };

  const addCon = (optionId: string) => {
    const text = newCon[optionId]?.trim();
    if (!text) return;

    onOptionsChange(
      options.map((o) =>
        o.id === optionId ? { ...o, cons: [...(o.cons || []), text] } : o
      )
    );
    setNewCon((prev) => ({ ...prev, [optionId]: '' }));
  };

  const removePro = (optionId: string, index: number) => {
    onOptionsChange(
      options.map((o) =>
        o.id === optionId
          ? { ...o, pros: o.pros.filter((_, i) => i !== index) }
          : o
      )
    );
  };

  const removeCon = (optionId: string, index: number) => {
    onOptionsChange(
      options.map((o) =>
        o.id === optionId
          ? { ...o, cons: o.cons.filter((_, i) => i !== index) }
          : o
      )
    );
  };

  const handleProKeyDown = (e: KeyboardEvent<HTMLInputElement>, optionId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPro(optionId);
    }
  };

  const handleConKeyDown = (e: KeyboardEvent<HTMLInputElement>, optionId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCon(optionId);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOption(expandedOption === id ? null : id);
  };

  const totalPros = options.reduce((sum, o) => sum + (o.pros?.length || 0), 0);
  const totalCons = options.reduce((sum, o) => sum + (o.cons?.length || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4 sm:px-6 py-8"
    >
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-3">
            Pros & Cons
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            For each option, list what works in its favor and what gives you pause
          </p>
          {(totalPros > 0 || totalCons > 0) && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="secondary" className="gap-1">
                <ThumbsUp size={12} />
                {totalPros} pro{totalPros !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <ThumbsDown size={12} />
                {totalCons} con{totalCons !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </motion.div>

        <div className="space-y-4 mb-8">
          <AnimatePresence mode="popLayout">
            {options.map((option, index) => {
              const isExpanded = expandedOption === option.id;
              const prosCount = option.pros?.length || 0;
              const consCount = option.cons?.length || 0;

              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="card-calm overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(option.id)}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <span className="text-foreground font-medium block">{option.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {prosCount} pro{prosCount !== 1 ? 's' : ''}, {consCount} con
                          {consCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {prosCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <ThumbsUp size={12} />
                          {prosCount}
                        </span>
                      )}
                      {consCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <ThumbsDown size={12} />
                          {consCount}
                        </span>
                      )}
                      <ArrowRight
                        size={16}
                        className={`text-muted-foreground transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Pros Section */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                                <ThumbsUp size={16} />
                                <span>Pros</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 min-h-[40px]">
                                <AnimatePresence>
                                  {(option.pros || []).map((pro, i) => (
                                    <motion.div
                                      key={`${option.id}-pro-${i}`}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className="group flex items-center gap-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full text-sm border border-green-200 dark:border-green-800"
                                    >
                                      <span>{pro}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removePro(option.id, i);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-green-200 dark:hover:bg-green-800 rounded-full"
                                      >
                                        <X size={12} />
                                      </button>
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                              </div>

                              <div className="flex gap-2">
                                <input
                                  ref={(el) => { proInputRefs.current[option.id] = el; }}
                                  type="text"
                                  value={newPro[option.id] || ''}
                                  onChange={(e) =>
                                    setNewPro((prev) => ({ ...prev, [option.id]: e.target.value }))
                                  }
                                  onKeyDown={(e) => handleProKeyDown(e, option.id)}
                                  placeholder="Add a pro..."
                                  className="flex-1 min-h-[44px] px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                />
                                <Button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addPro(option.id);
                                    proInputRefs.current[option.id]?.focus();
                                  }}
                                  disabled={!newPro[option.id]?.trim()}
                                  size="icon"
                                  variant="outline"
                                  className="shrink-0 h-11 w-11"
                                >
                                  <Plus size={18} />
                                </Button>
                              </div>
                            </div>

                            {/* Cons Section */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                                <ThumbsDown size={16} />
                                <span>Cons</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 min-h-[40px]">
                                <AnimatePresence>
                                  {(option.cons || []).map((con, i) => (
                                    <motion.div
                                      key={`${option.id}-con-${i}`}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className="group flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full text-sm border border-amber-200 dark:border-amber-800"
                                    >
                                      <span>{con}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeCon(option.id, i);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full"
                                      >
                                        <X size={12} />
                                      </button>
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                              </div>

                              <div className="flex gap-2">
                                <input
                                  ref={(el) => { conInputRefs.current[option.id] = el; }}
                                  type="text"
                                  value={newCon[option.id] || ''}
                                  onChange={(e) =>
                                    setNewCon((prev) => ({ ...prev, [option.id]: e.target.value }))
                                  }
                                  onKeyDown={(e) => handleConKeyDown(e, option.id)}
                                  placeholder="Add a con..."
                                  className="flex-1 min-h-[44px] px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                />
                                <Button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addCon(option.id);
                                    conInputRefs.current[option.id]?.focus();
                                  }}
                                  disabled={!newCon[option.id]?.trim()}
                                  size="icon"
                                  variant="outline"
                                  className="shrink-0 h-11 w-11"
                                >
                                  <Plus size={18} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex gap-4">
          <button onClick={onBack} className="btn-secondary flex-1">
            Back
          </button>
          <button onClick={onNext} className="btn-primary flex-1">
            Continue to Priorities
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProsConsStep;
