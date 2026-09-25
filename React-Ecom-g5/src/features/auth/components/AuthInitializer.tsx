import React, { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { initializeAuth } from '../store/authSlice';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isInitializing = useAppSelector((state) => state.auth.isInitializing);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      dispatch(initializeAuth());
    }
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="text-lg font-medium text-text-muted">Loading 6Sync...</div>
      </div>
    );
  }

  return <>{children}</>;
};
