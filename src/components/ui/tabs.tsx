import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

// Context to share active tab state for the sliding indicator
const TabsContext = React.createContext<{ activeValue?: string }>({})

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <LayoutGroup>
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-1.5 gap-1",
        className
      )}
      {...props}
    />
  </LayoutGroup>
))
TabsList.displayName = TabsPrimitive.List.displayName

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  value: string
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, value, ...props }, ref) => {
  const [isActive, setIsActive] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const el = triggerRef.current
    if (el) {
      const checkActive = () => {
        setIsActive(el.getAttribute('data-state') === 'active')
      }
      checkActive()
      const observer = new MutationObserver(checkActive)
      observer.observe(el, { attributes: true, attributeFilter: ['data-state'] })
      return () => observer.disconnect()
    }
  }, [])

  return (
    <TabsPrimitive.Trigger
      ref={(node) => {
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      value={value}
      className={cn(
        "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-xl px-8 py-3 text-sm font-light tracking-wide transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
        "text-white/60 hover:text-white/75",
        isActive && "text-white/90",
        className
      )}
      {...props}
    >
      {/* Sliding Background Indicator */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.12] shadow-lg shadow-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              layout: {
                type: "spring",
                stiffness: 400,
                damping: 30,
              },
              opacity: { duration: 0.15 }
            }}
          />
        )}
      </AnimatePresence>
      <span className="relative z-10">{children}</span>
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & { value: string }
>(({ className, children, value, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    value={value}
    className={cn(
      "mt-6 ring-offset-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0",
      "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-300",
      "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:duration-200",
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.Content>
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
