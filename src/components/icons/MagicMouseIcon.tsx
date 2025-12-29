import mouseIcon from '@/assets/mouse.svg';

interface MagicMouseIconProps {
  className?: string;
}

export const MagicMouseIcon = ({ className = "w-6 h-6" }: MagicMouseIconProps) => {
  return (
    <img 
      src={mouseIcon} 
      alt="Mouse"
      className={className}
    />
  );
};
