'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Cars', href: '/cars' },
  { name: 'Auction', href: '/auction' },
  { name: 'How to Buy', href: '/how-to-buy' },
  { name: 'About Us', href: '/about' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a4d0e]/95 backdrop-blur-md shadow-lg shadow-black/10'
          : 'bg-[#0a4d0e]'
      }`}
    >
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#D4A843] to-transparent" />

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between lg:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-14 w-48 sm:h-16 sm:w-60 transition-transform group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Jungcar/images/logo/logo.png"
                alt="JungCar"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-white/80 transition-all hover:text-[#D4A843] group"
              >
                {item.name}
                <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-[#D4A843] transition-all duration-300 group-hover:w-3/4" />
              </Link>
            ))}
            <Link
              href="/cars"
              className="ml-4 rounded-lg border border-[#D4A843] bg-[#D4A843]/10 px-5 py-2.5 text-sm font-semibold text-[#D4A843] transition-all hover:bg-[#D4A843] hover:text-[#0a4d0e] hover:shadow-lg hover:shadow-[#D4A843]/20"
            >
              View Inventory
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden rounded-lg p-2 text-white/80 hover:text-[#D4A843] hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a4d0e] border-t border-white/10"
          >
            <div className="space-y-1 px-4 pb-5 pt-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-white/80 hover:bg-white/10 hover:text-[#D4A843] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/cars"
                className="mt-3 block rounded-lg border border-[#D4A843] bg-[#D4A843]/10 px-4 py-3 text-center text-sm font-semibold text-[#D4A843] hover:bg-[#D4A843] hover:text-[#0a4d0e] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                View Inventory
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
