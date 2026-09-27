import React from 'react';
import { Outlet } from 'react-router-dom';
import { StorefrontHeader } from './StorefrontHeader';
import { StorefrontFooter } from './StorefrontFooter';

export const StorefrontLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-page print:min-h-0 print:bg-white">
      <StorefrontHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <StorefrontFooter />
    </div>
  );
};
