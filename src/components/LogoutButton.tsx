import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const LogoutButton = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={handleLogout}
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5 text-white/60" />
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Sign out</p>
      </TooltipContent>
    </Tooltip>
  );
};
