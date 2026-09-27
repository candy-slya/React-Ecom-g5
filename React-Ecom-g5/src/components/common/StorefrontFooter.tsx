import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';


export const StorefrontFooter: React.FC = () => {
  return (
    <footer className="bg-primary text-white print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          <div>
            <BrandLogo theme="dark" />
            <p className="mt-4 text-sm text-page opacity-80">
              Quality products, delivered to your door.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/products" className="text-sm text-page opacity-80 hover:opacity-100 hover:underline">
                  All Products
                </Link>
              </li>
            </ul>
          </div>
          
        </div>
        <div className="mt-12 border-t border-primary-hover pt-8 text-center md:text-left">
          <p className="text-sm text-page opacity-60">
            &copy; {new Date().getFullYear()} 6Sync. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
