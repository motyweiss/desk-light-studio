import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, RefreshCw, ExternalLink, ArrowLeft } from 'lucide-react';
import { HomeAssistantIcon } from '@/components/icons/HomeAssistantIcon';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { useToast } from '@/hooks/use-toast';

// Orchestrated animation timing
const TIMING = {
  card: { delay: 0.1, duration: 0.7 },
  content: { stagger: 0.08, delayStart: 0.35 },
  ease: [0.22, 0.03, 0.26, 1] as const,
};

// Card container animation - starts compact and expands
const cardVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.88,
    y: 40,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: TIMING.card.duration,
      delay: TIMING.card.delay,
      ease: TIMING.ease,
    }
  },
};

// Content wrapper - orchestrates children
const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: TIMING.content.stagger,
      delayChildren: TIMING.content.delayStart,
    }
  },
};

// Individual item animations with height expansion feel
const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 16,
    filter: 'blur(4px)',
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: TIMING.ease,
    }
  },
};

// Separator line draws in
const separatorVariants = {
  hidden: { 
    opacity: 0,
    scaleX: 0,
  },
  visible: { 
    opacity: 1,
    scaleX: 1,
    transition: {
      duration: 0.6,
      ease: TIMING.ease,
    }
  },
};

// Icon container with subtle pulse
const iconVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5,
    rotate: -10,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    }
  },
};

const Demo = () => {
  const navigate = useNavigate();
  const { config, testConnection, saveConfig } = useHAConnection();
  const { toast } = useToast();
  
  const [baseUrl, setBaseUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (config) {
      setBaseUrl(config.baseUrl || '');
      setAccessToken(config.accessToken || '');
    }
  }, [config]);

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
        navigate('/');
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
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#A59587]">
      {/* Back button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-10 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 hover:text-white/90 transition-all backdrop-blur-md"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 0.03, 0.26, 1] }}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Main Card - dark frosted glass for contrast on warm bg */}
      <motion.div
        className="relative z-10 w-full max-w-md bg-[#1a1816]/90 backdrop-blur-[60px] border border-black/10 rounded-3xl p-8 overflow-hidden"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="space-y-6"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Icon */}
          <motion.div 
            variants={iconVariants}
            className="flex justify-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <HomeAssistantIcon className="w-7 h-7 text-white/80" />
            </div>
          </motion.div>

          {/* Title & Subtitle */}
          <motion.div variants={itemVariants} className="text-center space-y-2">
            <h1 className="text-xl font-light text-white/90 tracking-wide">
              Connect to your Home Assistant
            </h1>
            <p className="text-sm text-white/50">
              Enter your instance URL and access token
            </p>
          </motion.div>

          {/* Separator */}
          <motion.div 
            variants={separatorVariants}
            className="h-px bg-white/10 origin-left" 
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
                className="bg-white/[0.06] border-white/10 rounded-xl h-12 text-white placeholder:text-white/40 focus:border-amber-500/50 focus:ring-amber-500/20"
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
                  className="bg-white/[0.06] border-white/10 rounded-xl h-12 text-white placeholder:text-white/40 focus:border-amber-500/50 focus:ring-amber-500/20 pr-12"
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
              className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-light transition-all duration-200 disabled:opacity-40"
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
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              How to create an access token
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Demo;
