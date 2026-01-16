'use client';

import { useState } from 'react';
import Image from 'next/image';
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
} from 'lucide-react';

const stats = [
  { icon: Users, value: '5,000+', label: 'Satisfied Customers' },
  { icon: Globe, value: '50+', label: 'Countries Served' },
  { icon: Award, value: '10+', label: 'Years Experience' },
];

const contactInfo = [
  {
    icon: MapPin,
    label: 'Address',
    value: 'Seoul, South Korea',
    link: null,
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+82 10-1234-5678',
    link: 'tel:+821012345678',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@jungcar.com',
    link: 'mailto:info@jungcar.com',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon-Fri: 9:00 AM - 6:00 PM (KST)',
    link: null,
  },
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

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-[var(--primary)] to-blue-700 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              About Jungcar
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              Your trusted partner for premium Korean used cars export
            </p>
          </motion.div>
        </div>
      </div>

      {/* About Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold">
                Exporting Quality Korean Cars{' '}
                <span className="gradient-text">Worldwide</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Jungcar is a leading Korean used car exporter, dedicated to providing
                high-quality vehicles to customers around the world. With years of
                experience in the automotive industry, we have built a reputation for
                excellence, reliability, and customer satisfaction.
              </p>
              <p className="mt-4 text-muted-foreground">
                We specialize in exporting premium Korean brands including Hyundai, Kia,
                and Genesis. Our team carefully inspects each vehicle to ensure it meets
                our strict quality standards before being shipped to your destination.
              </p>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1714348938110-d3692bc3716a?w=800"
                  alt="Jungcar Office"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card border border-border p-4 shadow-xl">
                <p className="text-sm text-muted-foreground">Established</p>
                <p className="text-2xl font-bold">2014</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Why Choose Jungcar?</h2>
            <p className="mt-4 text-muted-foreground">
              We are committed to providing the best service to our customers
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Quality Assurance',
                description:
                  'Every vehicle undergoes thorough inspection before export',
              },
              {
                title: 'Competitive Pricing',
                description:
                  'We offer the best prices with transparent pricing policy',
              },
              {
                title: 'Global Shipping',
                description:
                  'Reliable shipping to over 50 countries worldwide',
              },
              {
                title: 'Customer Support',
                description:
                  '24/7 support via WhatsApp, email, and phone',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-hover rounded-2xl bg-card border border-border p-6"
              >
                <CheckCircle className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold">Get in Touch</h2>
              <p className="mt-4 text-muted-foreground">
                Have questions? We&apos;d love to hear from you. Send us a message and
                we&apos;ll respond as soon as possible.
              </p>

              <div className="mt-8 space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>
                      {item.link ? (
                        <a
                          href={item.link}
                          className="font-medium hover:text-primary"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <p className="text-sm font-medium text-muted-foreground">
                  Follow us on social media
                </p>
                <div className="mt-4 flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-white"
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
              <div className="rounded-2xl bg-card border border-border p-6 lg:p-8">
                <h3 className="text-xl font-semibold">Send us a Message</h3>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 rounded-xl bg-green-50 p-6 text-center dark:bg-green-900/20"
                  >
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-4 font-medium text-green-700 dark:text-green-400">
                      Thank you for your message!
                    </p>
                    <p className="mt-2 text-sm text-green-600 dark:text-green-500">
                      We&apos;ll get back to you as soon as possible.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full rounded-xl bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full rounded-xl bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full rounded-xl bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Subject *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                          className="w-full rounded-xl bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full rounded-xl bg-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder="Your message..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70"
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

      {/* Map Section (Placeholder) */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative h-96 overflow-hidden rounded-2xl bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Seoul, South Korea</p>
                <p className="text-sm text-muted-foreground">
                  Our headquarters location
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
