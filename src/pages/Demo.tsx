import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RefreshCw, ExternalLink, ArrowLeft, Check, X } from 'lucide-react';
import { HomeAssistantIcon } from '@/components/icons/HomeAssistantIcon';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { useToast } from '@/hooks/use-toast';

// Connection states
type ConnectionStatus = 'idle' | 'connecting' | 'success' | 'error';

// Orchestrated animation timing
const TIMING = {
  card: { delay: 0.1, duration: 0.7 },
  content: { stagger: 0.08, delayStart: 0.35 },
  ease: [0.22, 0.03, 0.26, 1] as const,
};

// Card container animation
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

// Individual item animations
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

// Icon container animation
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

// Status icon animations
const statusIconVariants = {
  hidden: { 
    scale: 0, 
    opacity: 0,
    rotate: -180,
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    }
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Checkmark path animation
const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: 'easeOut' as const, delay: 0.2 },
      opacity: { duration: 0.1 }
    }
  }
};

const Demo = () => {
  const navigate = useNavigate();
  const { config, testConnection, saveConfig } = useHAConnection();
  const { toast } = useToast();
  
  const [baseUrl, setBaseUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

    setConnectionStatus('connecting');
    setErrorMessage('');
    
    try {
      const result = await testConnection(baseUrl, accessToken);
      
      if (result.success) {
        setConnectionStatus('success');
        await saveConfig(baseUrl, accessToken);
        
        // Navigate after showing success state
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error || 'Could not connect to Home Assistant');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage('An unexpected error occurred');
    }
  };

  const handleRetry = () => {
    setConnectionStatus('idle');
    setErrorMessage('');
  };

  // Render status content based on connection state
  const renderStatusContent = () => {
    if (connectionStatus === 'success') {
      return (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, ease: TIMING.ease }}
          className="space-y-6 text-center py-4"
        >
          {/* Success Icon */}
          <motion.div 
            className="flex justify-center"
            variants={statusIconVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <motion.svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-400"
              >
                <motion.path
                  d="M5 12l5 5L20 7"
                  variants={checkmarkVariants}
                  initial="hidden"
                  animate="visible"
                />
              </motion.svg>
            </div>
          </motion.div>

          {/* Success Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h2 className="text-xl font-light text-white/90 tracking-wide mb-2">
              Connected Successfully
            </h2>
            <p className="text-sm text-white/50">
              Redirecting to dashboard...
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div 
            className="h-1 bg-white/10 rounded-full overflow-hidden mx-auto max-w-[200px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="h-full bg-emerald-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            />
          </motion.div>
        </motion.div>
      );
    }

    if (connectionStatus === 'error') {
      return (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.4, ease: TIMING.ease }}
          className="space-y-6 text-center py-4"
        >
          {/* Error Icon */}
          <motion.div 
            className="flex justify-center"
            variants={statusIconVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="w-8 h-8 text-red-400" />
            </div>
          </motion.div>

          {/* Error Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="text-xl font-light text-white/90 tracking-wide mb-2">
              Connection Failed
            </h2>
            <p className="text-sm text-white/50 max-w-[280px] mx-auto">
              {errorMessage}
            </p>
          </motion.div>

          {/* Retry Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Button
              onClick={handleRetry}
              className="h-11 px-8 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-light transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        </motion.div>
      );
    }

    // Default form view (idle or connecting)
    return (
      <motion.div
        key="form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
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
              disabled={connectionStatus === 'connecting'}
              className="bg-white/[0.06] border-white/10 rounded-xl h-12 text-white placeholder:text-white/40 focus:border-amber-500/50 focus:ring-amber-500/20 disabled:opacity-50"
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
                disabled={connectionStatus === 'connecting'}
                className="bg-white/[0.06] border-white/10 rounded-xl h-12 text-white placeholder:text-white/40 focus:border-amber-500/50 focus:ring-amber-500/20 pr-12 disabled:opacity-50"
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

        {/* Connect Button */}
        <motion.div variants={itemVariants}>
          <Button
            onClick={handleTestConnection}
            disabled={connectionStatus === 'connecting' || !baseUrl || !accessToken}
            className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 border-0 text-black font-medium transition-all duration-200 disabled:opacity-40 disabled:bg-amber-500/50"
          >
            {connectionStatus === 'connecting' ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect'
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
    );
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

      {/* Main Card */}
      <motion.div
        className="relative z-10 w-full max-w-md bg-[#1a1816]/90 backdrop-blur-[60px] border border-black/10 rounded-3xl p-8 overflow-hidden"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        layout
      >
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="wait">
            {renderStatusContent()}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Demo;
