import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Eye, EyeOff, RefreshCw, ExternalLink, ArrowLeft, X } from 'lucide-react';
import { HomeAssistantIcon } from '@/components/icons/HomeAssistantIcon';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { useToast } from '@/hooks/use-toast';
import { TIMING, EASE } from '@/lib/animations/tokens';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// =============================================================================
// TYPES
// =============================================================================

type ConnectionStatus = 'idle' | 'connecting' | 'success' | 'error';

// =============================================================================
// ANIMATION CONFIGURATION - Clean, consistent, elegant
// =============================================================================

// Layout transition for card size changes
const LAYOUT_TRANSITION = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 28,
  mass: 0.9,
};

const ANIM = {
  // Card entrance - gentle and refined
  card: {
    initial: { opacity: 0, scale: 0.97, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: {
      duration: TIMING.slow,
      ease: EASE.gentle,
    },
  },
  
  // Content crossfade - orchestrated timing
  content: {
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: EASE.smooth,
      },
    },
    enter: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: EASE.smooth,
        delay: 0.05, // Small delay after exit completes
      },
    },
  },
  
  // Icon - subtle scale entrance
  icon: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      duration: TIMING.medium,
      ease: EASE.gentle,
    },
  },
  
  // Form items - simple fade with minimal y
  item: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: {
      duration: TIMING.fast,
      ease: EASE.smooth,
    },
  },
  
  // Stagger timing
  stagger: {
    children: 0.04,
    delay: 0.08,
  },
  
  // Connecting pulse - subtle and calming
  pulse: {
    scale: [1, 1.025, 1] as number[],
    boxShadow: [
      '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
      '0 10px 20px -3px rgba(255, 188, 0, 0.25)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
    ] as string[],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: EASE.smooth,
    },
  },
  
  // Success/error icon
  statusIcon: {
    initial: { scale: 0.85, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: {
      duration: TIMING.medium,
      ease: EASE.gentle,
    },
  },
  
  // Checkmark path draw
  checkmark: {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { duration: TIMING.slow, ease: EASE.out, delay: 0.1 },
      opacity: { duration: TIMING.micro },
    },
  },
  
  // Progress bar
  progress: {
    initial: { width: '0%' },
    animate: { width: '100%' },
    transition: {
      duration: 2.2,
      delay: 0.25,
      ease: EASE.smooth,
    },
  },
  
  // Separator line
  separator: {
    initial: { opacity: 0, scaleX: 0 },
    animate: { opacity: 1, scaleX: 1 },
    transition: {
      duration: TIMING.medium,
      ease: EASE.out,
    },
  },
  
  // Back button
  backButton: {
    initial: { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
    transition: {
      delay: 0.35,
      duration: TIMING.medium,
      ease: EASE.out,
    },
  },
} as const;

// Reduced motion variants
const REDUCED = {
  content: {
    duration: TIMING.micro,
    ease: EASE.smooth,
  },
  card: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: TIMING.fast },
  },
} as const;

// =============================================================================
// COMPONENT
// =============================================================================

const Demo = () => {
  const navigate = useNavigate();
  const { config, testConnection, saveConfig } = useHAConnection();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  
  const [baseUrl, setBaseUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Animation config based on motion preference
  const contentTransition = useMemo(() => 
    prefersReducedMotion ? REDUCED.content : ANIM.content,
    [prefersReducedMotion]
  );

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
        
        setTimeout(() => {
          setConnectionStatus('idle');
        }, 2800);
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error || 'Could not connect to Home Assistant');
      }
    } catch {
      setConnectionStatus('error');
      setErrorMessage('An unexpected error occurred');
    }
  };

  const handleRetry = () => {
    setConnectionStatus('idle');
    setErrorMessage('');
  };

  // ===========================================================================
  // SUCCESS CONTENT
  // ===========================================================================
  const SuccessContent = () => (
    <motion.div
      key="success"
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={ANIM.content.exit}
      transition={ANIM.content.enter.transition}
      className="space-y-6 text-center py-8"
    >
      <motion.div 
        layout
        className="flex justify-center"
        initial={ANIM.statusIcon.initial}
        animate={ANIM.statusIcon.animate}
        transition={ANIM.statusIcon.transition}
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
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
              initial={ANIM.checkmark.initial}
              animate={ANIM.checkmark.animate}
              transition={ANIM.checkmark.transition}
            />
          </motion.svg>
        </div>
      </motion.div>

      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: TIMING.fast, ease: EASE.smooth }}
      >
        <h2 className="text-xl font-light text-white/90 tracking-wide">
          Connected Successfully
        </h2>
      </motion.div>

      <motion.div 
        layout
        className="h-0.5 bg-white/8 rounded-full overflow-hidden mx-auto max-w-[180px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="h-full bg-emerald-400/80 rounded-full"
          initial={ANIM.progress.initial}
          animate={ANIM.progress.animate}
          transition={ANIM.progress.transition}
        />
      </motion.div>
    </motion.div>
  );

  // ===========================================================================
  // ERROR CONTENT
  // ===========================================================================
  const ErrorContent = () => (
    <motion.div
      key="error"
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={ANIM.content.exit}
      transition={ANIM.content.enter.transition}
      className="space-y-6 text-center py-8"
    >
      <motion.div 
        layout
        className="flex justify-center"
        initial={ANIM.statusIcon.initial}
        animate={ANIM.statusIcon.animate}
        transition={ANIM.statusIcon.transition}
      >
        <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
          <motion.div
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: TIMING.fast, ease: EASE.gentle }}
          >
            <X className="w-8 h-8 text-red-400" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: TIMING.fast, ease: EASE.smooth }}
      >
        <h2 className="text-xl font-light text-white/90 tracking-wide mb-2">
          Connection Failed
        </h2>
        <p className="text-sm text-white/45 max-w-[260px] mx-auto leading-relaxed">
          {errorMessage}
        </p>
      </motion.div>

      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18, duration: TIMING.fast, ease: EASE.smooth }}
      >
        <Button
          onClick={handleRetry}
          className="h-11 px-8 rounded-xl bg-white/8 hover:bg-white/12 border border-white/8 text-white/90 font-light transition-all duration-300"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </motion.div>
    </motion.div>
  );

  // ===========================================================================
  // FORM CONTENT
  // ===========================================================================
  const FormContent = () => {
    const isConnecting = connectionStatus === 'connecting';
    
    return (
      <motion.div
        key="form"
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={ANIM.content.exit}
        transition={ANIM.content.enter.transition}
        className="space-y-6"
      >
        {/* Icon */}
        <motion.div 
          layout
          className="flex justify-center"
          initial={ANIM.icon.initial}
          animate={ANIM.icon.animate}
          transition={ANIM.icon.transition}
        >
          <motion.div 
            className="w-16 h-16 rounded-[18px] bg-white shadow-lg shadow-black/20 flex items-center justify-center"
            animate={isConnecting && !prefersReducedMotion ? {
              scale: ANIM.pulse.scale,
              boxShadow: ANIM.pulse.boxShadow,
            } : {}}
            transition={isConnecting ? ANIM.pulse.transition : {}}
          >
            <HomeAssistantIcon className="w-8 h-8 text-[hsl(28_15%_12%)]" />
          </motion.div>
        </motion.div>

        {/* Header */}
        <motion.div 
          layout
          className="text-center space-y-2"
          initial={ANIM.item.initial}
          animate={ANIM.item.animate}
          transition={{ ...ANIM.item.transition, delay: ANIM.stagger.delay }}
        >
          <h1 className="text-xl font-light text-white/90 tracking-wide">
            Connect to your Home Assistant
          </h1>
          <p className="text-sm text-white/45">
            Enter your instance URL and access token
          </p>
        </motion.div>

        {/* Separator */}
        <motion.div 
          layout
          className="h-px bg-white/10 origin-left mx-4"
          initial={ANIM.separator.initial}
          animate={ANIM.separator.animate}
          transition={{ ...ANIM.separator.transition, delay: ANIM.stagger.delay + ANIM.stagger.children }}
        />

        {/* Form Fields */}
        <motion.div 
          layout
          className="space-y-5"
          initial={ANIM.item.initial}
          animate={ANIM.item.animate}
          transition={{ ...ANIM.item.transition, delay: ANIM.stagger.delay + ANIM.stagger.children * 2 }}
        >
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
              Base URL
            </label>
            <Input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-instance.ui.nabu.casa"
              disabled={isConnecting}
              className="bg-white/[0.05] border-white/8 rounded-xl h-12 text-white placeholder:text-white/35 focus:border-amber-500/40 focus:ring-amber-500/15 disabled:opacity-50 transition-all duration-300"
            />
            <p className="text-xs text-white/30">
              Your Home Assistant instance URL
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
              Access Token
            </label>
            <div className="relative">
              <Input
                type={showToken ? 'text' : 'password'}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="eyJ0eX..."
                disabled={isConnecting}
                className="bg-white/[0.05] border-white/8 rounded-xl h-12 text-white placeholder:text-white/35 focus:border-amber-500/40 focus:ring-amber-500/15 pr-12 disabled:opacity-50 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/35 hover:text-white/60 hover:bg-white/5 transition-all duration-200"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-white/30">
              Long-lived access token from your profile
            </p>
          </div>
        </motion.div>

        {/* Connect Button */}
        <motion.div
          layout
          initial={ANIM.item.initial}
          animate={ANIM.item.animate}
          transition={{ ...ANIM.item.transition, delay: ANIM.stagger.delay + ANIM.stagger.children * 3 }}
        >
          <Button
            onClick={handleTestConnection}
            disabled={isConnecting || !baseUrl || !accessToken}
            className="w-full h-12 rounded-xl bg-[#FFBC00] hover:bg-[#FFD040] border-0 text-black font-medium uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-35 disabled:bg-[#FFBC00]/40"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                <span className="tracking-[0.15em]">Connecting...</span>
              </>
            ) : (
              'CONNECT'
            )}
          </Button>
        </motion.div>

        {/* Help Link */}
        <motion.div 
          layout
          className="text-center"
          initial={ANIM.item.initial}
          animate={ANIM.item.animate}
          transition={{ ...ANIM.item.transition, delay: ANIM.stagger.delay + ANIM.stagger.children * 4 }}
        >
          <a
            href="https://www.home-assistant.io/docs/authentication/#your-account-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white/55 transition-colors duration-300"
          >
            <ExternalLink className="w-4 h-4" />
            How to create an access token
          </a>
        </motion.div>
      </motion.div>
    );
  };

  // ===========================================================================
  // MAIN RENDER
  // ===========================================================================
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#A59587]">
      {/* Back button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-10 p-3 rounded-xl bg-black/10 hover:bg-black/15 border border-black/5 text-white/70 hover:text-white/90 transition-all duration-300 backdrop-blur-md"
        initial={ANIM.backButton.initial}
        animate={ANIM.backButton.animate}
        transition={ANIM.backButton.transition}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Main Card */}
      <LayoutGroup>
        <motion.div
          layout
          className="relative z-10 w-full max-w-md bg-[#302A23]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4),0_10px_25px_-10px_rgba(0,0,0,0.25)]"
          initial={prefersReducedMotion ? REDUCED.card.initial : ANIM.card.initial}
          animate={prefersReducedMotion ? REDUCED.card.animate : ANIM.card.animate}
          transition={LAYOUT_TRANSITION}
        >
          <AnimatePresence mode="wait" initial={false}>
            {connectionStatus === 'success' && <SuccessContent />}
            {connectionStatus === 'error' && <ErrorContent />}
            {(connectionStatus === 'idle' || connectionStatus === 'connecting') && <FormContent />}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
};

export default Demo;
