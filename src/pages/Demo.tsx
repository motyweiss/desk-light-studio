import { useState, useEffect, useMemo, useCallback, useRef, ComponentType } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Eye, EyeOff, RefreshCw, ExternalLink, X } from 'lucide-react';
import { HomeAssistantIcon } from '@/components/icons/HomeAssistantIcon';
import { 
  AnimatedPlugIcon, 
  AnimatedKeyIcon, 
  AnimatedLampIcon, 
  AnimatedSparklesIcon 
} from '@/components/icons/AnimatedStepIcons';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHAConnection } from '@/contexts/HAConnectionContext';
import { useToast } from '@/hooks/use-toast';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// =============================================================================
// TYPES
// =============================================================================

type ConnectionStatus = 'idle' | 'connecting' | 'success' | 'error';

type AnimatedIconComponent = ComponentType<{ className?: string; delay?: number }>;

type WizardStep = {
  id: string;
  label: string;
  AnimatedIcon: AnimatedIconComponent;
  status: 'pending' | 'active' | 'completed';
};

const WIZARD_STEPS: Omit<WizardStep, 'status'>[] = [
  { id: 'connect', label: 'Connecting', AnimatedIcon: AnimatedPlugIcon },
  { id: 'auth', label: 'Authenticating', AnimatedIcon: AnimatedKeyIcon },
  { id: 'devices', label: 'Loading devices', AnimatedIcon: AnimatedLampIcon },
  { id: 'sync', label: 'Syncing', AnimatedIcon: AnimatedSparklesIcon },
];

// =============================================================================
// ANIMATION SYSTEM - Unified, elegant, Apple-inspired
// =============================================================================

// Easing functions
const EASE = {
  apple: [0.25, 0.46, 0.45, 0.94] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
  out: [0.16, 1, 0.3, 1] as const,
} as const;

// Spring configurations
const SPRING = {
  card: { type: 'spring' as const, stiffness: 280, damping: 26, mass: 0.9 },
  content: { type: 'spring' as const, stiffness: 320, damping: 30, mass: 0.8 },
  gentle: { type: 'spring' as const, stiffness: 200, damping: 25, mass: 1 },
} as const;

// Stagger delays for hierarchical reveal - snappy timing
const STAGGER = {
  icon: 0.05,
  title: 0.12,
  separator: 0.18,
  field1: 0.24,
  field2: 0.32,
  button: 0.4,
  link: 0.48,
} as const;

// Exit stagger for smooth coordinated exit
const EXIT_STAGGER = {
  base: 0.015,
} as const;

// Content transition configurations
const getContentTransition = (isEntering: boolean) => ({
  opacity: { duration: isEntering ? 0.2 : 0.1, ease: EASE.smooth },
  scale: { duration: isEntering ? 0.25 : 0.15, ease: EASE.apple },
  y: { duration: isEntering ? 0.25 : 0.15, ease: EASE.apple },
  filter: { duration: isEntering ? 0.18 : 0.08 },
});

// =============================================================================
// COMPONENT
// =============================================================================

const Demo = () => {
  const navigate = useNavigate();
  const { config, saveConfig } = useHAConnection();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  
  const [baseUrl, setBaseUrl] = useState('https://ui.nabu.casa');
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [formKey, setFormKey] = useState(0); // Key to trigger re-animation
  const [isValidConnection, setIsValidConnection] = useState(false);

  // Load access token from config
  useEffect(() => {
    if (config?.accessToken) {
      setAccessToken(config.accessToken);
    }
  }, [config]);

  const handleTestConnection = useCallback(async () => {
    if (!baseUrl || !accessToken) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both URL and access token',
        variant: 'destructive',
      });
      return;
    }

    setConnectionStatus('connecting');
    
    // Demo mode: Only https://ui.nabu.casa is valid
    const DEMO_VALID_URL = 'https://ui.nabu.casa';
    const isValidDemoUrl = baseUrl.trim().replace(/\/$/, '') === DEMO_VALID_URL;
    
    // Store validation result for later use
    setIsValidConnection(isValidDemoUrl);
  }, [baseUrl, accessToken, toast]);

  // Handle wizard completion - use ref to avoid dependency issues
  const isValidConnectionRef = useRef(false);
  isValidConnectionRef.current = isValidConnection;
  
  const handleWizardComplete = useCallback(async () => {
    if (isValidConnectionRef.current) {
      setConnectionStatus('success');
      await saveConfig(baseUrl, accessToken);
      
      // Return to idle after success animation
      setTimeout(() => {
        setFormKey(prev => prev + 1);
        setConnectionStatus('idle');
      }, 3500);
    } else {
      setConnectionStatus('error');
    }
  }, [baseUrl, accessToken, saveConfig]);

  const handleRetry = useCallback(() => {
    setFormKey(prev => prev + 1); // Trigger re-animation
    setConnectionStatus('idle');
  }, []);

  // ===========================================================================
  // ANIMATED FIELD COMPONENT
  // ===========================================================================
  const AnimatedField = useMemo(() => {
    return ({ 
      delay, 
      children,
      exitDelay = 0,
    }: { 
      delay: number; 
      children: React.ReactNode;
      exitDelay?: number;
    }) => (
      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(8px)', scale: 0.95 }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
        exit={{ 
          opacity: 0, 
          y: -12, 
          filter: 'blur(4px)', 
          scale: 0.98,
          transition: { 
            duration: 0.2, 
            delay: exitDelay,
            ease: EASE.smooth 
          }
        }}
        transition={{
          duration: 0.6,
          delay,
          ease: EASE.apple,
          opacity: { duration: 0.4, delay },
          filter: { duration: 0.5, delay: delay + 0.05 },
          scale: { duration: 0.5, delay, ease: EASE.bounce },
        }}
      >
        {children}
      </motion.div>
    );
  }, []);

  // ===========================================================================
  // CONNECTING WIZARD CONTENT
  // ===========================================================================
  const ConnectingContent = () => {
    const [steps, setSteps] = useState<WizardStep[]>(
      WIZARD_STEPS.map((step, index) => ({
        ...step,
        status: index === 0 ? 'active' : 'pending',
      }))
    );
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
      if (currentStepIndex >= WIZARD_STEPS.length) {
        // All steps completed, wait a moment then transition
        const timer = setTimeout(() => {
          handleWizardComplete();
        }, 500);
        return () => clearTimeout(timer);
      }

      // Progress to next step after delay
      const stepDuration = 1400 + Math.random() * 300; // ~1.4-1.7s per step
      
      // First mark current step as completed (show green checkmark)
      const completeTimer = setTimeout(() => {
        setSteps(prev => prev.map((step, index) => {
          if (index === currentStepIndex) {
            return { ...step, status: 'completed' };
          }
          return step;
        }));
      }, stepDuration);
      
      // Then after a soft delay, move up and activate next step
      const moveTimer = setTimeout(() => {
        setSteps(prev => prev.map((step, index) => {
          if (index === currentStepIndex + 1) {
            return { ...step, status: 'active' };
          }
          return step;
        }));
        setCurrentStepIndex(prev => prev + 1);
      }, stepDuration + 400); // 400ms delay after green appears

      return () => {
        clearTimeout(completeTimer);
        clearTimeout(moveTimer);
      };
    }, [currentStepIndex]);

    const progress = ((currentStepIndex) / WIZARD_STEPS.length) * 100;

    return (
      <motion.div
        key="connecting"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, filter: 'blur(6px)' }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-6"
      >
        {/* Centered Slider with padding for breathing rings */}
        <div className="relative w-full py-8">
          <AnimatePresence mode="wait">
            {steps.map((step) => {
              const { AnimatedIcon } = step;
              const isActive = step.status === 'active';
              
              if (!isActive) return null;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 40, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -40, filter: 'blur(4px)' }}
                  transition={{ 
                    duration: 0.9, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Large Icon Container with space for rings */}
                  <div className="relative mb-6" style={{ padding: '24px' }}>
                    {/* Outer pulse ring - slower, gentler */}
                    <motion.div
                      className="absolute rounded-[32px] border border-amber-400/20"
                      style={{ 
                        top: '8px', 
                        left: '8px', 
                        right: '8px', 
                        bottom: '8px',
                      }}
                      animate={!prefersReducedMotion ? {
                        scale: [1, 1.25, 1],
                        opacity: [0.4, 0, 0.4],
                      } : {}}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    {/* Second pulse ring - even slower */}
                    <motion.div
                      className="absolute rounded-[32px] border border-white/10"
                      style={{ 
                        top: '8px', 
                        left: '8px', 
                        right: '8px', 
                        bottom: '8px',
                      }}
                      animate={!prefersReducedMotion ? {
                        scale: [1, 1.4, 1],
                        opacity: [0.25, 0, 0.25],
                      } : {}}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.8,
                      }}
                    />
                    
                    {/* Icon container */}
                    <motion.div
                      className="relative w-28 h-28 rounded-[28px] border border-white/[0.12] bg-white/[0.03] backdrop-blur-sm flex items-center justify-center"
                      animate={!prefersReducedMotion ? {
                        scale: [1, 1.015, 1],
                      } : {}}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <AnimatedIcon 
                        className="w-12 h-12 text-amber-400/90"
                        delay={0.3}
                      />
                    </motion.div>
                  </div>

                  {/* Step Label - shorter, cleaner */}
                  <motion.p
                    className="text-base font-light text-white/80 tracking-widest uppercase"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    {step.label}
                  </motion.p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Step Indicators (dots) */}
        <motion.div 
          className="flex items-center gap-3 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {steps.map((step) => {
            const isActive = step.status === 'active';
            const isCompleted = step.status === 'completed';
            
            return (
              <motion.div
                key={step.id}
                className="relative"
                layout
                transition={{ duration: 0.4, ease: EASE.apple }}
              >
                {/* Active glow */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-amber-400/40 blur-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <motion.div
                  className={`
                    relative rounded-full transition-all duration-500
                    ${isActive 
                      ? 'w-10 h-2.5 bg-amber-400' 
                      : isCompleted
                      ? 'w-2.5 h-2.5 bg-amber-400/70'
                      : 'w-2.5 h-2.5 bg-white/20'
                    }
                  `}
                  layout
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Progress text */}
        <motion.p
          className="text-sm text-white/50 font-light mt-6 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
        </motion.p>

      </motion.div>
    );
  };

  // ===========================================================================
  // SUCCESS CONTENT - memoized to prevent re-creation
  // ===========================================================================
  const SuccessContent = useMemo(() => () => (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: EASE.apple }}
      className="flex flex-col items-center justify-center py-10 space-y-6"
    >
      {/* Progress Ring with Checkmark */}
      <motion.div 
        className="relative w-24 h-24"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE.bounce }}
      >
        {/* Circular progress */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 96 96"
        >
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="hsl(160 30% 20% / 0.2)"
            strokeWidth="3"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="hsl(160 55% 50%)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.2,
              ease: EASE.out,
              delay: 0.1,
            }}
          />
        </svg>
        
        {/* Inner circle + checkmark */}
        <motion.div 
          className="absolute inset-3 rounded-full bg-emerald-500/10 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.05, ease: EASE.apple }}
        >
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
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 1.0, ease: EASE.bounce }}
          >
            <motion.path
              d="M5 12l5 5L20 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 1.1, ease: EASE.apple }}
            />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Success Text */}
      <motion.div
        className="text-center space-y-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 1.3, ease: EASE.apple }}
      >
        <h2 className="text-xl font-light text-white/90 tracking-wide">
          {"You're all set!"}
        </h2>
        <p className="text-sm text-white/50">
          Home Assistant is now up and running.
        </p>
      </motion.div>
    </motion.div>
  ), []);

  // ===========================================================================
  // ERROR CONTENT - memoized to prevent re-creation
  // ===========================================================================
  const ErrorContent = useMemo(() => () => (
    <motion.div
      key="error"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      transition={{ duration: 0.35, ease: EASE.apple }}
      className="flex flex-col items-center justify-center py-10 space-y-6"
    >
      {/* Error Icon - matching success style */}
      <motion.div 
        className="relative w-24 h-24"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE.bounce }}
      >
        {/* Circular progress */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 96 96"
        >
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="hsl(0 30% 20% / 0.2)"
            strokeWidth="3"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="hsl(0 65% 55%)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.0,
              ease: EASE.out,
              delay: 0.1,
            }}
          />
        </svg>
        
        {/* Inner circle + X icon */}
        <motion.div 
          className="absolute inset-3 rounded-full bg-red-500/10 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.05, ease: EASE.apple }}
        >
          <motion.svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-400"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.8, ease: EASE.bounce }}
          >
            <motion.path
              d="M18 6L6 18"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2, delay: 0.9, ease: EASE.apple }}
            />
            <motion.path
              d="M6 6L18 18"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2, delay: 1.0, ease: EASE.apple }}
            />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Error Text */}
      <motion.div
        className="text-center space-y-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 1.1, ease: EASE.apple }}
      >
        <h2 className="text-xl font-light text-white/90 tracking-wide">
          Unable to connect
        </h2>
        <p className="text-sm text-white/50">
          {"We couldn't authenticate with the provided credentials."}
        </p>
      </motion.div>

      {/* Retry Button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 1.25, ease: EASE.apple }}
      >
        <button
          onClick={handleRetry}
          className="h-11 px-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/80 text-sm font-light tracking-wide transition-all duration-300 inline-flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2.5 opacity-60" />
          Try Again
        </button>
      </motion.div>
    </motion.div>
  ), [handleRetry]);

  // ===========================================================================
  // FORM CONTENT
  // ===========================================================================
  const FormContent = () => {
    return (
      <motion.div
        key={`form-${formKey}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Icon - Frosted Glass Style */}
        <motion.div 
          className="flex justify-center"
        >
          <motion.div 
            className="w-16 h-16 rounded-[18px] border border-white/[0.15] backdrop-blur-sm flex items-center justify-center origin-center"
            initial={{ opacity: 0, scale: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ 
              opacity: 0, 
              scale: 0.5, 
              filter: 'blur(4px)',
              transition: { duration: 0.2, ease: EASE.smooth }
            }}
            transition={{
              duration: 0.45,
              delay: STAGGER.icon,
              scale: { 
                type: 'spring', 
                stiffness: 400, 
                damping: 15, 
                mass: 0.8,
                delay: STAGGER.icon 
              },
              opacity: { duration: 0.25, delay: STAGGER.icon },
              filter: { duration: 0.3, delay: STAGGER.icon },
            }}
          >
            <HomeAssistantIcon className="w-8 h-8 text-white/60" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ 
            opacity: 0, 
            y: -10, 
            filter: 'blur(4px)',
            transition: { duration: 0.2, delay: EXIT_STAGGER.base, ease: EASE.smooth }
          }}
          transition={{
            duration: 0.6,
            delay: STAGGER.title,
            ease: EASE.apple,
            filter: { duration: 0.5, delay: STAGGER.title + 0.05 },
          }}
        >
          <h1 className="text-xl font-light text-white/90 tracking-wide text-center">
            Connect to your Home Assistant
          </h1>
        </motion.div>

        {/* Separator */}
        <motion.div 
          className="h-px bg-white/10 origin-center mx-4"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ 
            opacity: 0, 
            scaleX: 0,
            transition: { duration: 0.2, delay: EXIT_STAGGER.base * 2, ease: EASE.smooth }
          }}
          transition={{ 
            duration: 0.6, 
            delay: STAGGER.separator,
            ease: EASE.out,
          }}
        />

        {/* Base URL Field */}
        <AnimatedField delay={STAGGER.field1} exitDelay={EXIT_STAGGER.base * 3}>
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
              Base URL
            </label>
            <Input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-instance.ui.nabu.casa"
              className="bg-white/[0.05] border-white/10 rounded-xl h-12 text-white placeholder:text-white/35 focus-visible:ring-amber-500/25 focus-visible:border-amber-500/50 transition-all duration-300"
            />
            <p className="text-xs text-white/30">
              Your Home Assistant instance URL
            </p>
          </div>
        </AnimatedField>

        {/* Access Token Field */}
        <AnimatedField delay={STAGGER.field2} exitDelay={EXIT_STAGGER.base * 4}>
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
                className="bg-white/[0.05] border-white/10 rounded-xl h-12 text-white placeholder:text-white/35 focus-visible:ring-amber-500/25 focus-visible:border-amber-500/50 pr-12 transition-all duration-300"
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
        </AnimatedField>

        {/* Connect Button */}
        <AnimatedField delay={STAGGER.button} exitDelay={EXIT_STAGGER.base * 5}>
          <Button
            onClick={handleTestConnection}
            disabled={!baseUrl || !accessToken}
            className="w-full h-12 rounded-xl bg-[#FFBC00] hover:bg-[#FFD040] border-0 text-black font-medium uppercase tracking-[0.2em] transition-colors duration-200 disabled:opacity-35 disabled:bg-[#FFBC00]/40"
          >
            CONNECT
          </Button>
        </AnimatedField>

        {/* Help Link */}
        <AnimatedField delay={STAGGER.link} exitDelay={EXIT_STAGGER.base * 6}>
          <div className="text-center">
            <a
              href="https://www.home-assistant.io/docs/authentication/#your-account-profile"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white/55 transition-colors duration-300"
            >
              <ExternalLink className="w-4 h-4" />
              How to create an access token
            </a>
          </div>
        </AnimatedField>
      </motion.div>
    );
  };

  // ===========================================================================
  // MAIN RENDER
  // ===========================================================================
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#A59587]">
      {/* Main Card */}
      <LayoutGroup>
        <motion.div
          layout
          className="relative z-10 w-full max-w-md bg-[#302A23] backdrop-blur-[60px] outline outline-[8px] outline-white/10 rounded-3xl p-10 overflow-hidden shadow-[0_30px_70px_-15px_rgba(0,0,0,0.45),0_15px_30px_-10px_rgba(0,0,0,0.25)]"
          initial={prefersReducedMotion ? { opacity: 0 } : { 
            opacity: 0, 
            scale: 0.92, 
            y: 40, 
            filter: 'blur(15px)' 
          }}
          animate={prefersReducedMotion ? { opacity: 1 } : { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            filter: 'blur(0px)' 
          }}
          transition={{
            duration: 0.35,
            ease: EASE.apple,
            opacity: { duration: 0.25 },
            scale: { duration: 0.3, ease: EASE.bounce },
            filter: { duration: 0.25 },
          }}
        >
          <AnimatePresence mode="wait">
            {connectionStatus === 'success' && <SuccessContent />}
            {connectionStatus === 'error' && <ErrorContent />}
            {connectionStatus === 'connecting' && <ConnectingContent />}
            {connectionStatus === 'idle' && <FormContent />}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
};

export default Demo;
