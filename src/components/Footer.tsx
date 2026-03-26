import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Cars', href: '/cars' },
    { name: 'Auction', href: '/auction' },
    { name: 'How to Buy', href: '/how-to-buy' },
    { name: 'About Us', href: '/about' },
  ],
  cars: [
    { name: 'Hyundai', href: '/cars?brand=Hyundai' },
    { name: 'Kia', href: '/cars?brand=Kia' },
    { name: 'Genesis', href: '/cars?brand=Genesis' },
    { name: 'All Cars', href: '/cars' },
  ],
  social: [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'YouTube', href: '#', icon: Youtube },
    { name: 'WhatsApp', href: 'https://wa.me/821012345678', icon: MessageCircle },
  ],
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Main Footer */}
      <div className="bg-[#0a4d0e]">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-[#D4A843] via-[#D4A843]/60 to-[#D4A843]" />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block">
                <div className="relative h-12 w-44">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo/logo.png"
                    alt="JungCar"
                    className="h-full w-full object-contain object-left"
                  />
                </div>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Beyond Borders, Elevating Your Car&apos;s Value. Your trusted partner for
                premium Korean used cars export worldwide.
              </p>
              {/* Social links */}
              <div className="mt-6 flex gap-3">
                {navigation.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white/60 transition-all hover:bg-[#D4A843] hover:text-[#0a4d0e] hover:scale-110"
                    aria-label={item.name}
                  >
                    <item.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#D4A843]">
                Quick Links
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 transition-colors hover:text-white hover:translate-x-1 inline-block"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Car Brands */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#D4A843]">
                Browse by Brand
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.cars.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 transition-colors hover:text-white inline-block"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#D4A843]">
                Contact Us
              </h3>
              <ul className="mt-4 space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D4A843]" />
                  <span className="text-sm text-white/60">
                    Seoul, South Korea
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0 text-[#D4A843]" />
                  <a
                    href="tel:+821012345678"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    +82 10-1234-5678
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0 text-[#D4A843]" />
                  <a
                    href="mailto:info@jungcar.com"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    info@jungcar.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs text-white/40">
                &copy; {new Date().getFullYear()} JungCar. All rights reserved.
              </p>
              <p className="text-xs text-white/40">
                Beyond Borders, Elevating Your Car&apos;s Value
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
