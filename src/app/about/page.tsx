'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Send,
  CheckCircle,
  Users,
  Globe,
  Award,
  Shield,
  Truck,
  Handshake,
  Search,
  ArrowRight,
} from 'lucide-react';

const stats = [
  { icon: Users, value: '5,000+', label: 'Satisfied Customers' },
  { icon: Globe, value: '50+', label: 'Countries Served' },
  { icon: Award, value: '15+', label: 'Years Experience' },
  { icon: Truck, value: '500+', label: 'Monthly Exports' },
];

const sections = [
  {
    icon: Search,
    title: 'Our Mission',
    description: 'Our mission is to make used car exports simple, transparent, and dependable. By providing clear information, honest inspections, and well-prepared vehicles, we help our partners reduce risk and trade with confidence.',
  },
  {
    icon: Shield,
    title: 'Our Team & Quality Control',
    description: 'Jungcar is operated by automotive professionals with extensive knowledge of vehicle conditions and export standards. Each vehicle undergoes a strict inspection process, covering engine performance, mechanical systems, exterior, and interior condition. Only vehicles that meet our stringent standards are approved for export.',
  },
  {
    icon: Handshake,
    title: 'Our Responsibility',
    description: 'Our responsibility does not end with the inspection. Jungcar manages documentation, logistics, and ocean freight, taking full responsibility until the vehicle safely arrives at its destination.',
  },
  {
    icon: Globe,
    title: 'Global Partners',
    description: 'Trusted by buyers in the Middle East, South America, Europe, the CIS, South Asia, and Africa, we are always open to cooperation with global partners who value reliability and accountability.',
  },
];

const contactInfo = [
  { icon: MapPin, label: 'Address', value: '경기도 시흥시 산기대학로 163 A동 330호', link: null },
  { icon: Phone, label: 'Phone', value: '+82 10-1234-5678', link: 'tel:+821012345678' },
  { icon: Mail, label: 'Email', value: 'info@jungcar.com', link: 'mailto:info@jungcar.com' },
];

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
  { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/821012345678' },
];

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative bg-[#0a4d0e] pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/40 bg-[#D4A843]/10 px-4 py-1.5 text-sm font-medium text-[#D4A843]">
                About Us
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Your Long-Term
                <br />
                <span className="text-[#D4A843]">Export Partner</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                Jungcar is a professional used car export company with over 15 years of experience in global vehicle trading.
                Built on expertise and accountability.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/cars"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#D4A843] px-6 py-3 text-sm font-bold text-[#0a4d0e] transition-all hover:bg-[#e0b84f] hover:shadow-lg"
                >
                  Browse Inventory
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>

            {/* Right: Video */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
                <div className="aspect-video flex items-center justify-center bg-white/5">
                  {/* TODO: Replace with actual video */}
                  <div className="text-center px-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D4A843]/20 ring-4 ring-[#D4A843]/10">
                      <svg className="h-7 w-7 text-[#D4A843] ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="mt-4 text-sm font-medium text-white/60">Company Introduction Video</p>
                    <p className="mt-1 text-xs text-white/30">Coming Soon</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT + STATS ===== */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
                Who We Are
              </span>
              <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e] sm:text-4xl">
                Trust Built on{' '}
                <span className="text-[#D4A843]">Experience</span>
              </h2>
              <p className="mt-5 text-[#0a4d0e]/60 leading-relaxed">
                We specialize in supplying carefully inspected used vehicles to overseas markets,
                providing our partners with a safe, reliable, and convenient export experience.
                In international trade, trust is essential.
              </p>
              <p className="mt-4 text-[#0a4d0e]/60 leading-relaxed">
                Jungcar focuses on accuracy, professionalism, and responsibility, ensuring that
                every vehicle meets actual market expectations before it is shipped. We do not
                sacrifice quality for speed. We deliver quality that lasts.
              </p>
              <div className="mt-8">
                <Link
                  href="/cars"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#0a4d0e] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#0d6611] hover:shadow-lg"
                >
                  Browse Our Inventory
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-2 gap-5">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-[#0a4d0e]/10 bg-white p-6 shadow-sm text-center transition-all hover:shadow-lg hover:border-[#0a4d0e]/20"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a4d0e]/10">
                      <stat.icon className="h-6 w-6 text-[#0a4d0e]" />
                    </div>
                    <p className="mt-3 text-3xl font-black text-[#0a4d0e]">{stat.value}</p>
                    <p className="mt-1 text-sm text-[#0a4d0e]/50">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== OUR VALUES ===== */}
      <section className="py-20 sm:py-28 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              What We Stand For
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e] sm:text-4xl">
              Expertise &amp; <span className="text-[#D4A843]">Accountability</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#0a4d0e]/60">
              Jungcar is your long-term export partner—built on expertise and accountability
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {sections.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border border-[#0a4d0e]/10 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-[#0a4d0e]/20"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0a4d0e]/10 transition-colors group-hover:bg-[#0a4d0e]">
                  <item.icon className="h-7 w-7 text-[#0a4d0e] group-hover:text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-[#0a4d0e]">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[#0a4d0e]/60">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="py-20 sm:py-28 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              Contact
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e] sm:text-4xl">
              Get in <span className="text-[#D4A843]">Touch</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#0a4d0e]/60">
              Have questions? We&apos;d love to hear from you.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-5">
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl border border-[#0a4d0e]/10 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#0a4d0e]/10">
                      <item.icon className="h-5 w-5 text-[#0a4d0e]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#0a4d0e]/40">
                        {item.label}
                      </p>
                      {item.link ? (
                        <a href={item.link} className="mt-0.5 font-semibold text-[#0a4d0e] hover:text-[#D4A843] transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 font-semibold text-[#0a4d0e]">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#0a4d0e]/40">
                  Follow us
                </p>
                <div className="mt-3 flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#0a4d0e]/10 bg-white text-[#0a4d0e]/60 shadow-sm transition-all hover:bg-[#0a4d0e] hover:text-white hover:scale-110"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Google Map */}
              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#0a4d0e]/40">
                  Our Location
                </p>
                <div className="mt-3 overflow-hidden rounded-xl border border-[#0a4d0e]/10 shadow-sm">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3174.5!2d126.7339!3d37.3405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b6f!2z7IKw6riw64yA7ZWZ66GcIDE2Mywg7Iuc7Z2l7IucLCDqsr3quLDrj4Q!5e0!3m2!1sko!2skr!4v1706861234567!5m2!1sko!2skr"
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="JungCar Location - 경기도 시흥시 산기대학로 163"
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl border border-[#0a4d0e]/10 bg-white p-6 shadow-sm lg:p-8">
                <h3 className="text-xl font-bold text-[#0a4d0e]">Send us a Message</h3>
                <p className="mt-1 text-sm text-[#0a4d0e]/50">We&apos;ll respond as soon as possible.</p>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 rounded-xl bg-[#0a4d0e]/5 border border-[#0a4d0e]/10 p-8 text-center"
                  >
                    <CheckCircle className="mx-auto h-12 w-12 text-[#0a4d0e]" />
                    <p className="mt-4 font-bold text-[#0a4d0e]">Thank you for your message!</p>
                    <p className="mt-2 text-sm text-[#0a4d0e]/60">We&apos;ll get back to you as soon as possible.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-[#0a4d0e]/70 mb-1.5">Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-xl border border-[#0a4d0e]/10 bg-[#f5f5f5] px-4 py-3 text-[#0a4d0e] placeholder-[#0a4d0e]/30 focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/30 focus:border-transparent"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0a4d0e]/70 mb-1.5">Email *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-xl border border-[#0a4d0e]/10 bg-[#f5f5f5] px-4 py-3 text-[#0a4d0e] placeholder-[#0a4d0e]/30 focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/30 focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-[#0a4d0e]/70 mb-1.5">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-xl border border-[#0a4d0e]/10 bg-[#f5f5f5] px-4 py-3 text-[#0a4d0e] placeholder-[#0a4d0e]/30 focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/30 focus:border-transparent"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#0a4d0e]/70 mb-1.5">Subject *</label>
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full rounded-xl border border-[#0a4d0e]/10 bg-[#f5f5f5] px-4 py-3 text-[#0a4d0e] placeholder-[#0a4d0e]/30 focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/30 focus:border-transparent"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#0a4d0e]/70 mb-1.5">Message *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-xl border border-[#0a4d0e]/10 bg-[#f5f5f5] px-4 py-3 text-[#0a4d0e] placeholder-[#0a4d0e]/30 focus:outline-none focus:ring-2 focus:ring-[#0a4d0e]/30 focus:border-transparent"
                        placeholder="Your message..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a4d0e] py-3.5 font-semibold text-white transition-all hover:bg-[#0d6611] hover:shadow-lg hover:shadow-[#0a4d0e]/20 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          Send Message
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
