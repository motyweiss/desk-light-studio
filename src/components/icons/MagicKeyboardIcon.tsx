import keyboardIcon from '@/assets/keyboard.svg';

interface MagicKeyboardIconProps {
  className?: string;
}

export const MagicKeyboardIcon = ({ className = "w-6 h-6" }: MagicKeyboardIconProps) => {
  return (
    <img 
      src={keyboardIcon} 
      alt="Keyboard"
      className={className}
    />
  );
};
