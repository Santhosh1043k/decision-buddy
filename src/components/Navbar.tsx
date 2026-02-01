import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogIn, LogOut, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Don't show navbar on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container max-w-lg mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="font-serif text-lg font-medium text-foreground hover:text-primary transition-colors"
          >
            Decision Coach
          </button>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {location.pathname !== '/' && (
                  <button
                    onClick={() => navigate('/')}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="New Decision"
                  >
                    <Plus size={20} />
                  </button>
                )}
                {location.pathname !== '/dashboard' && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Dashboard"
                  >
                    <LayoutDashboard size={20} />
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Sign out"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
