import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingOverlay } from './LoadingOverlay';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // TODO: DEV MODE - Bypass authentication for testing. Remove this to restore auth.
  return <>{children}</>;
};
