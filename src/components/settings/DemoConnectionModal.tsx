import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plug, Key, Eye, EyeOff, RefreshCw, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { useToast } from '@/hooks/use-toast';

interface DemoConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const DemoConnectionModal = ({ open, onOpenChange }: DemoConnectionModalProps) => {
  const { config, testConnection, saveConfig } = useHAConnection();
  const { toast } = useToast();
  
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || '');
  const [accessToken, setAccessToken] = useState(config?.accessToken || '');
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    if (!baseUrl || !accessToken) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both URL and access token',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    try {
      const result = await testConnection(baseUrl, accessToken);
      
      if (result.success) {
        await saveConfig(baseUrl, accessToken);
        toast({
          title: 'Connected!',
          description: 'Successfully connected to Home Assistant',
        });
        onOpenChange(false);
      } else {
        toast({
          title: 'Connection failed',
          description: result.error || 'Could not connect to Home Assistant',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <motion.div
          className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]"
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.3, ease: [0.22, 0.03, 0.26, 1] }}
        >
          <div className="w-full max-w-md bg-white/[0.06] backdrop-blur-[48px] border border-white/[0.08] rounded-3xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
            <motion.div
              className="space-y-6"
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.06, delayChildren: 0.1 }}
            >
              {/* Icon */}
              <motion.div 
                variants={itemVariants}
                className="flex justify-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Plug className="w-7 h-7 text-amber-400" />
                </div>
              </motion.div>

              {/* Title & Subtitle */}
              <motion.div variants={itemVariants} className="text-center space-y-2">
                <h2 className="text-xl font-light text-white/90 tracking-wide">
                  Connect to your Home Assistant
                </h2>
                <p className="text-sm text-white/50">
                  Enter your instance URL and access token
                </p>
              </motion.div>

              {/* Token Help */}
              <motion.div 
                variants={itemVariants}
                className="flex items-center justify-center gap-2 text-xs text-white/40"
              >
                <Key className="w-3.5 h-3.5" />
                <span>To get a token: Profile → Security → Long-lived access tokens</span>
              </motion.div>

              {/* Separator */}
              <motion.div 
                variants={itemVariants}
                className="h-px bg-white/[0.06]" 
              />

              {/* Form Fields */}
              <motion.div variants={itemVariants} className="space-y-5">
                {/* Base URL */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Base URL
                  </label>
                  <Input
                    type="url"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://your-instance.ui.nabu.casa"
                    className="bg-white/[0.04] border-white/[0.08] rounded-xl h-12 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-amber-500/20"
                  />
                  <p className="text-xs text-white/30">
                    Your Home Assistant instance URL
                  </p>
                </div>

                {/* Access Token */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Access Token
                  </label>
                  <div className="relative">
                    <Input
                      type={showToken ? 'text' : 'password'}
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="eyJ0eX..."
                      className="bg-white/[0.04] border-white/[0.08] rounded-xl h-12 text-white placeholder:text-white/30 focus:border-amber-500/50 focus:ring-amber-500/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                    >
                      {showToken ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-white/30">
                    Long-lived access token from your profile
                  </p>
                </div>
              </motion.div>

              {/* Test Button */}
              <motion.div variants={itemVariants}>
                <Button
                  onClick={handleTestConnection}
                  disabled={isTesting || !baseUrl || !accessToken}
                  className="w-full h-12 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-white font-light transition-all duration-200 disabled:opacity-40"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Help Link */}
              <motion.div 
                variants={itemVariants}
                className="text-center"
              >
                <a
                  href="https://www.home-assistant.io/docs/authentication/#your-account-profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  How to create an access token
                </a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </DialogPortal>
    </Dialog>
  );
};
