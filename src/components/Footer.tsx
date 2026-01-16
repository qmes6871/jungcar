import Link from 'next/link';
import { Car, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Cars', href: '/cars' },
    { name: 'How to Buy', href: '/how-to-buy' },
    { name: 'About', href: '/about' },
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
  ],
};

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <Car className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">Jungcar</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your trusted partner for quality Korean used cars. We export premium vehicles worldwide with guaranteed quality and competitive prices.
            </p>
            {/* Social links */}
            <div className="mt-6 flex gap-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-white"
                >
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Navigation
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Car Brands */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Browse by Brand
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.cars.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Seoul, South Korea
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <a
                  href="tel:+821012345678"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  +82 10-1234-5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <a
                  href="mailto:info@jungcar.com"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  info@jungcar.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Jungcar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
