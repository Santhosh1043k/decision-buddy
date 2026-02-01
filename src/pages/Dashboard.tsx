import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Loader2, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SavedDecision {
  id: string;
  decision: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState<SavedDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchDecisions = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('saved_decisions')
        .select('id, decision, created_at')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching decisions:', error);
      } else {
        setDecisions(data || []);
      }
      setLoading(false);
    };

    if (user) {
      fetchDecisions();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl font-medium text-foreground">
              Your Decisions
            </h1>
            <p className="text-sm text-muted-foreground">
              Review your past decision analyses
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* New Decision Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/')}
          className="w-full card-calm mb-6 flex items-center justify-center gap-2 hover:border-primary transition-colors"
        >
          <Plus size={20} className="text-primary" />
          <span className="font-medium text-foreground">New Decision</span>
        </motion.button>

        {/* Decision List */}
        {decisions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground mb-4">
              No decisions saved yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Complete a decision analysis to see it here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {decisions.map((decision, index) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/decision/${decision.id}`)}
                className="card-calm cursor-pointer hover:border-primary transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate pr-4">
                      {decision.decision}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      <span>{format(new Date(decision.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
