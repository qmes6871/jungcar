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
  { icon: Award, value: '10+', label: 'Years Experience' },
  { icon: Truck, value: '500+', label: 'Monthly Exports' },
];

const whyChoose = [
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Every vehicle undergoes thorough multi-point inspection before export to ensure top quality.',
  },
  {
    icon: Search,
    title: 'Competitive Pricing',
    description: 'Direct sourcing from Korean auctions means the best market prices with full transparency.',
  },
  {
    icon: Globe,
    title: 'Global Shipping',
    description: 'Reliable RoRo and container shipping to over 50 countries with full documentation support.',
  },
  {
    icon: Handshake,
    title: 'Dedicated Support',
    description: 'Personalized service via WhatsApp, email, and phone throughout your entire buying journey.',
  },
];

const teamMembers = [
  { name: 'James Jung', role: 'CEO & Founder', image: '/Jungcar/images/staff/staff-8.png' },
  { name: 'Sarah Kim', role: 'Sales Director', image: '/Jungcar/images/staff/staff-1.jpg' },
  { name: 'Yuna Lee', role: 'Export Manager', image: '/Jungcar/images/staff/staff-2.jpg' },
  { name: 'Jiwon Park', role: 'Auction Specialist', image: '/Jungcar/images/staff/staff-5.jpg' },
  { name: 'Daniel Choi', role: 'Vehicle Inspector', image: '/Jungcar/images/staff/staff-6.jpg' },
  { name: 'Minjae Seo', role: 'Logistics Manager', image: '/Jungcar/images/staff/staff-7.jpg' },
];

const contactInfo = [
  { icon: MapPin, label: 'Address', value: 'Seoul, South Korea', link: null },
  { icon: Phone, label: 'Phone', value: '+82 10-1234-5678', link: 'tel:+821012345678' },
  { icon: Mail, label: 'Email', value: 'info@jungcar.com', link: 'mailto:info@jungcar.com' },
  { icon: Clock, label: 'Business Hours', value: 'Mon-Fri: 9:00 AM - 6:00 PM (KST)', link: null },
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
                Beyond Borders,
                <br />
                Elevating{' '}
                <span className="text-[#D4A843]">Your Car&apos;s Value</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                JungCar is Korea&apos;s trusted auto export partner. We source premium
                vehicles from Korea&apos;s largest auctions and deliver them worldwide
                with full quality assurance since 2014.
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
                Exporting Quality Korean Cars{' '}
                <span className="text-[#D4A843]">Worldwide</span>
              </h2>
              <p className="mt-5 text-[#0a4d0e]/60 leading-relaxed">
                JungCar is a leading Korean used car exporter, dedicated to providing
                high-quality vehicles to customers around the world. With over a decade of
                experience in the automotive industry, we have built a reputation for
                excellence, reliability, and customer satisfaction.
              </p>
              <p className="mt-4 text-[#0a4d0e]/60 leading-relaxed">
                We specialize in exporting premium Korean brands including Hyundai, Kia,
                and Genesis. Our team carefully inspects each vehicle and handles all
                export documentation, shipping, and customs clearance to your destination.
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

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 sm:py-28 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              Why JungCar
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e] sm:text-4xl">
              Why Choose <span className="text-[#D4A843]">Us?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#0a4d0e]/60">
              We are committed to providing the best service from vehicle selection to delivery
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border border-[#0a4d0e]/10 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-[#0a4d0e]/20 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a4d0e]/10 transition-colors group-hover:bg-[#0a4d0e] group-hover:text-white">
                  <item.icon className="h-6 w-6 text-[#0a4d0e] group-hover:text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#0a4d0e]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0a4d0e]/60">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              Our People
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e] sm:text-4xl">
              Meet the <span className="text-[#D4A843]">JungCar Team</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#0a4d0e]/60">
              Our experienced professionals are dedicated to delivering the best
              Korean vehicles to customers worldwide
            </p>
          </motion.div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-white border border-[#0a4d0e]/10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#0a4d0e]">{member.name}</h3>
                  <p className="mt-1 text-sm font-medium text-[#0a4d0e]/60">{member.role}</p>
                </div>
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
