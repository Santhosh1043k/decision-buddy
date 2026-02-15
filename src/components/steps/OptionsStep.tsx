import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, X, Heart, Image, ImageOff } from 'lucide-react';
import type { Option } from '@/types/decision';
import { detectEmotions, getEmotionColor } from '@/lib/emotionDetection';

interface OptionsStepProps {
  options: Option[];
  onOptionsChange: (options: Option[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const OptionsStep = ({ options, onOptionsChange, onNext, onBack }: OptionsStepProps) => {
  const [newOption, setNewOption] = useState('');
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<Record<string, string>>({});

  const addOption = () => {
    if (newOption.trim() && options.length < 4) {
      const option: Option = {
        id: crypto.randomUUID(),
        name: newOption.trim(),
        emotionalText: '',
        scores: {},
        pros: [],
        cons: [],
      };
      onOptionsChange([...options, option]);
      setNewOption('');
      setExpandedOption(option.id);
    }
  };

  const updateImageUrl = (id: string, url: string) => {
    onOptionsChange(
      options.map((o) => (o.id === id ? { ...o, imageUrl: url.trim() || undefined } : o))
    );
  };

  const clearImageUrl = (id: string) => {
    onOptionsChange(
      options.map((o) => (o.id === id ? { ...o, imageUrl: undefined } : o))
    );
    setImageUrlInput((prev) => ({ ...prev, [id]: '' }));
  };

  const removeOption = (id: string) => {
    onOptionsChange(options.filter((o) => o.id !== id));
    if (expandedOption === id) {
      setExpandedOption(null);
    }
  };

  const updateEmotionalText = (id: string, text: string) => {
    onOptionsChange(
      options.map((o) => (o.id === id ? { ...o, emotionalText: text } : o))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOption(expandedOption === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-8"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-3">
            Your Options
          </h2>
          <p className="text-muted-foreground">
            Add up to 4 options and share how each makes you feel
          </p>
        </motion.div>

        <div className="space-y-4 mb-8">
          <AnimatePresence mode="popLayout">
            {options.map((option, index) => {
              const emotions = detectEmotions(option.emotionalText);
              const isExpanded = expandedOption === option.id;
              
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="card-calm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => toggleExpand(option.id)}
                    >
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-foreground font-medium">{option.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(option.id)}
                        className={`p-2 rounded-full transition-colors ${
                          option.emotionalText 
                            ? 'bg-accent/20 text-accent' 
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                        title="Add how you feel"
                      >
                        <Heart size={16} fill={option.emotionalText ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => removeOption(option.id)}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          {/* Image URL Input */}
                          <div>
                            <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2">
                              <Image size={14} />
                              Add an image (optional)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                value={imageUrlInput[option.id] ?? option.imageUrl ?? ''}
                                onChange={(e) => {
                                  setImageUrlInput((prev) => ({ ...prev, [option.id]: e.target.value }));
                                  updateImageUrl(option.id, e.target.value);
                                }}
                                placeholder="https://example.com/image.jpg"
                                className="input-calm flex-1 text-sm"
                              />
                              {option.imageUrl && (
                                <button
                                  onClick={() => clearImageUrl(option.id)}
                                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                                  title="Remove image"
                                >
                                  <ImageOff size={18} />
                                </button>
                              )}
                            </div>
                            {/* Image Preview */}
                            {option.imageUrl && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3"
                              >
                                <div className="relative w-full h-32 rounded-xl overflow-hidden bg-muted">
                                  <img
                                    src={option.imageUrl}
                                    alt={option.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground text-sm">Failed to load image</div>';
                                    }}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Emotional Text Input */}
                          <div>
                            <label className="block text-sm text-muted-foreground mb-2 flex items-center gap-2">
                              <Heart size={14} />
                              How does this option make you feel?
                            </label>
                            <textarea
                              value={option.emotionalText}
                              onChange={(e) => updateEmotionalText(option.id, e.target.value)}
                              placeholder="e.g., Excited but nervous about the unknown..."
                              className="input-calm min-h-[80px] resize-none text-sm"
                              maxLength={200}
                            />
                            
                            {emotions.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {emotions.slice(0, 3).map((emotion) => (
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
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {options.length < 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add an option..."
                className="input-calm flex-1"
                maxLength={50}
              />
              <button
                onClick={addOption}
                disabled={!newOption.trim()}
                className="btn-secondary px-4 disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </motion.div>
          )}
        </div>

        <div className="flex gap-4">
          <button onClick={onBack} className="btn-secondary flex-1">
            Back
          </button>
          <button
            onClick={onNext}
            disabled={options.length < 2}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Continue
          </button>
        </div>

        {options.length < 2 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Add at least 2 options to continue
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default OptionsStep;
