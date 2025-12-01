interface ManufacturerLogoProps {
  manufacturer?: string;
  className?: string;
}

const ManufacturerLogo = ({ manufacturer, className = "w-5 h-5" }: ManufacturerLogoProps) => {
  if (!manufacturer) return null;

  const renderLogo = () => {
    switch (manufacturer) {
      case 'Dyson':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 6v12M8 9l8 6M8 15l8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      
      case 'Philips Hue':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M12 2L4 7v5c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V7l-8-5zm0 18.5c-3.1-1-6-5.4-6-9.5V8.3l6-3.8 6 3.8V11c0 4.1-2.9 8.5-6 9.5z"/>
          </svg>
        );
      
      case 'Apple':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        );
      
      case 'Sonos':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={className}>
            <rect x="6" y="8" width="3" height="8" rx="1.5" fill="currentColor" />
            <rect x="11" y="6" width="3" height="12" rx="1.5" fill="currentColor" />
            <rect x="16" y="10" width="3" height="4" rx="1.5" fill="currentColor" />
          </svg>
        );
      
      case 'Spotify':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
            <path d="M16.5 11c-2.5-1.5-6.5-1.5-9 0M16 13.5c-2-1.2-5-1.2-7 0M15 16c-1.5-.9-3.5-.9-5 0" 
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        );
      
      default:
        return null;
    }
  };

  return <div className="flex items-center justify-center">{renderLogo()}</div>;
};

export default ManufacturerLogo;
