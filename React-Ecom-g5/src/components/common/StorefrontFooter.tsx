import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

export const StorefrontFooter: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-white border-t border-slate-800 print:hidden">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand & About Section */}
          <div className="lg:col-span-1">
            <BrandLogo theme="dark" />
            <p className="mt-6 text-sm leading-relaxed text-slate-300">
              Your one-stop destination for premium quality products. We are dedicated to providing you with the best shopping experience, delivering excellence straight to your door. Thank you for choosing 6SYNC as your trusted shopping partner!
            </p>
          </div>
          
          {/* Shop Links Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-700 pb-2 mb-4 inline-block">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-sm text-slate-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-slate-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Categories
                </Link>
              </li>
              <li>
                <Link to="/brands" className="text-sm text-slate-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Brands
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-700 pb-2 mb-4 inline-block">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Call Us</p>
                  <a href="tel:+959123456789" className="text-sm text-white hover:text-accent transition-colors">09-979298180 <br/>09-682945834</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Email</p>
                  <a href="mailto:support@6sync.com" className="text-sm text-white hover:text-accent transition-colors">support@6sync.com</a>
                </div>
              </li>
            </ul>
          </div>

          {/* Payment Section (Updated to just "Mini Banking Supported") */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-700 pb-2 mb-4 inline-block">Payment Methods</h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              We accept secure payments via Mini Banking & Mobile Wallets.
            </p>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-lg inline-flex">
               <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
               </svg>
               <span className="text-sm font-semibold text-white tracking-wide">Mini Banking Supported</span>
            </div>
          </div>
          
        </div>
        
        {/* Footer Bottom */}
        <div className="mt-16 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 text-center md:text-left">
            &copy; {new Date().getFullYear()} 6SYNC Online Store. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};