import { motion } from 'framer-motion';
import { Monitor } from 'lucide-react';

interface NavigationLinksProps {
  currentPath: string;
}

export const NavigationLinks = ({ currentPath }: NavigationLinksProps) => {
  const links = [
    { path: '/', label: 'Office', icon: Monitor },
    // Future routes will be added here
  ];

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = currentPath === link.path;
        
        return (
          <motion.a
            key={link.path}
            href={link.path}
            className="relative px-4 py-2 text-sm font-light text-white/60 hover:text-white/90 transition-colors rounded-lg"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              <span>{link.label}</span>
            </div>
            
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/90"
                initial={false}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
          </motion.a>
        );
      })}
    </nav>
  );
};
