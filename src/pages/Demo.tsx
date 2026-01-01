import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RefreshCw, ExternalLink, ArrowLeft, X } from 'lucide-react';
import { HomeAssistantIcon } from '@/components/icons/HomeAssistantIcon';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { useToast } from '@/hooks/use-toast';

// Connection states
type ConnectionStatus = 'idle' | 'connecting' | 'success' | 'error';

// Refined easing curves
const EASE = {
  smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
  gentle: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  out: [0, 0, 0.2, 1] as [number, number, number, number],
  spring: [0.34, 1.4, 0.64, 1] as [number, number, number, number],
};

// Card container - smooth entrance with soft landing
const cardVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.92,
    y: 30,
    filter: 'blur(8px)',
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: EASE.gentle,
      opacity: { duration: 0.5 },
      filter: { duration: 0.6 },
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    filter: 'blur(6px)',
    transition: {
      duration: 0.4,
      ease: EASE.smooth,
    }
  }
};

// Content stagger orchestration
const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.25,
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    }
  }
};

// Individual items - subtle rise with fade
const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 12,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.45,
      ease: EASE.out,
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.25,
      ease: EASE.smooth,
    }
  }
};

// Separator - smooth draw
const separatorVariants = {
  hidden: { 
    opacity: 0,
    scaleX: 0,
  },
  visible: { 
    opacity: 1,
    scaleX: 1,
    transition: {
      duration: 0.5,
      ease: EASE.out,
    }
  },
};

// Icon - playful spring entrance
const iconVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.6,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: EASE.spring,
    }
  },
};

// Status states - shared transition config
const stateTransition = {
  enter: {
    duration: 0.5,
    ease: EASE.gentle,
  },
  exit: {
    duration: 0.35,
    ease: EASE.smooth,
  }
};

// Success checkmark draw
const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: EASE.out, delay: 0.15 },
      opacity: { duration: 0.2 }
    }
  }
};

// Status icon container
const statusIconVariants = {
  hidden: { 
    scale: 0.5, 
    opacity: 0,
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: EASE.spring,
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
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [cardKey, setCardKey] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

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
        
        // Smooth reset sequence
        setTimeout(() => {
          setIsResetting(true);
        }, 2000);
        
        setTimeout(() => {
          setConnectionStatus('idle');
          setCardKey(prev => prev + 1);
          setIsResetting(false);
        }, 2400);
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

  // Success State
  const SuccessContent = () => (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: isResetting ? 0 : 1, y: isResetting ? -10 : 0, scale: isResetting ? 0.95 : 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={stateTransition.enter}
      className="space-y-6 text-center py-6"
    >
      <motion.div 
        className="flex justify-center"
        variants={statusIconVariants}
        initial="hidden"
        animate="visible"
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
              variants={checkmarkVariants}
              initial="hidden"
              animate="visible"
            />
          </motion.svg>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4, ease: EASE.out }}
      >
        <h2 className="text-xl font-light text-white/90 tracking-wide">
          Connected Successfully
        </h2>
      </motion.div>

      <motion.div 
        className="h-0.5 bg-white/8 rounded-full overflow-hidden mx-auto max-w-[180px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <motion.div
          className="h-full bg-emerald-400/80 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, delay: 0.4, ease: EASE.out }}
        />
      </motion.div>
    </motion.div>
  );

  // Error State
  const ErrorContent = () => (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={stateTransition.enter}
      className="space-y-6 text-center py-6"
    >
      <motion.div 
        className="flex justify-center"
        variants={statusIconVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
          <motion.div
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE.spring }}
          >
            <X className="w-8 h-8 text-red-400" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: EASE.out }}
      >
        <h2 className="text-xl font-light text-white/90 tracking-wide mb-2">
          Connection Failed
        </h2>
        <p className="text-sm text-white/45 max-w-[260px] mx-auto leading-relaxed">
          {errorMessage}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4, ease: EASE.out }}
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

  // Form State
  const FormContent = () => (
    <motion.div
      key="form"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <motion.div 
        variants={iconVariants}
        className="flex justify-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/8 flex items-center justify-center">
          <HomeAssistantIcon className="w-7 h-7 text-white/75" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center space-y-2">
        <h1 className="text-xl font-light text-white/90 tracking-wide">
          Connect to your Home Assistant
        </h1>
        <p className="text-sm text-white/45">
          Enter your instance URL and access token
        </p>
      </motion.div>

      <motion.div 
        variants={separatorVariants}
        className="h-px bg-white/8 origin-left" 
      />

      <motion.div variants={itemVariants} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
            Base URL
          </label>
          <Input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://your-instance.ui.nabu.casa"
            disabled={connectionStatus === 'connecting'}
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
              disabled={connectionStatus === 'connecting'}
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

      <motion.div variants={itemVariants}>
        <Button
          onClick={handleTestConnection}
          disabled={connectionStatus === 'connecting' || !baseUrl || !accessToken}
          className="w-full h-12 rounded-xl bg-[#FFBC00] hover:bg-[#FFD040] border-0 text-black font-medium uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-35 disabled:bg-[#FFBC00]/40"
        >
          {connectionStatus === 'connecting' ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              <span className="tracking-[0.15em]">Connecting...</span>
            </>
          ) : (
            'CONNECT'
          )}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center">
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

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#A59587]">
      {/* Back button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-10 p-3 rounded-xl bg-black/10 hover:bg-black/15 border border-black/5 text-white/70 hover:text-white/90 transition-all duration-300 backdrop-blur-md"
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: EASE.out }}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cardKey}
          className="relative z-10 w-full max-w-md bg-[#1a1816] backdrop-blur-[60px] border-[8px] border-white/10 rounded-3xl p-8 overflow-hidden"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <AnimatePresence mode="wait">
            {connectionStatus === 'success' && <SuccessContent />}
            {connectionStatus === 'error' && <ErrorContent />}
            {(connectionStatus === 'idle' || connectionStatus === 'connecting') && <FormContent />}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Demo;
