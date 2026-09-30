import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';


export const StorefrontFooter: React.FC = () => {
  return (
    <footer className="bg-[#000000] text-white border-t border-zinc-800 print:hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          <div>
            <BrandLogo theme="dark" />
            <p className="mt-4 text-sm text-zinc-400">
              Quality products, delivered to your door.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FFFF00]">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/products" className="text-sm text-zinc-300 hover:text-[#FFFF00] hover:underline transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>
          
        </div>
        <div className="mt-12 border-t border-zinc-800 pt-8 text-center md:text-left">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} 6Sync. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
