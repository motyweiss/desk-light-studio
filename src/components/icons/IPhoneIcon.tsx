import phoneIcon from '@/assets/phone.svg';

interface IPhoneIconProps {
  className?: string;
}

export const IPhoneIcon = ({ className = "w-6 h-6" }: IPhoneIconProps) => {
  return (
    <img 
      src={phoneIcon} 
      alt="Phone"
      className={className}
    />
  );
};
