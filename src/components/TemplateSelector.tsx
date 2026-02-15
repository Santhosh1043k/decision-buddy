import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { DECISION_TEMPLATES, TEMPLATE_CATEGORIES } from '@/data/templates';
import { DecisionTemplate } from '@/types/decision';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplateSelectorProps {
  onSelectTemplate: (template: DecisionTemplate) => void;
}

const TemplateSelector = ({ onSelectTemplate }: TemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DecisionTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredTemplates = DECISION_TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = 
      searchQuery === '' ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateClick = (template: DecisionTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">Start from a template</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose a pre-configured template to get started faster
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card border-border focus-visible:ring-primary/30"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 h-auto gap-1 bg-muted/50 p-1">
          {TEMPLATE_CATEGORIES.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all duration-200"
            >
              <span className="mr-1">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Templates Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory + searchQuery}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <motion.button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="group relative bg-card rounded-xl p-4 sm:p-5 text-left border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Icon */}
                <div className="text-3xl sm:text-4xl mb-3">{template.icon}</div>
                
                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-serif font-medium text-base sm:text-lg text-foreground group-hover:text-primary transition-colors duration-200">
                    {template.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-sm">
                No templates found. Try a different search or category.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Template Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{selectedTemplate.icon}</span>
                  <div>
                    <DialogTitle className="font-serif text-2xl">
                      {selectedTemplate.title}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Example Decision */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Example Decision</h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm italic text-foreground">
                      "{selectedTemplate.exampleDecision}"
                    </p>
                  </div>
                </div>

                {/* Suggested Priorities */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">
                    Suggested Priorities ({selectedTemplate.suggestedPriorities.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedTemplate.suggestedPriorities.map((priority) => (
                      <div
                        key={priority.id}
                        className="bg-card border border-border rounded-lg p-3 flex items-start gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-foreground">
                            {priority.label}
                          </h5>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {priority.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                            {priority.value}/5
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUseTemplate}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use This Template
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateSelector;
