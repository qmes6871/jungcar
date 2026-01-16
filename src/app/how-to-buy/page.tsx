'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  MessageCircle,
  CreditCard,
  FileCheck,
  Ship,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Browse & Select',
    description:
      'Browse our extensive inventory of quality Korean used cars. Use filters to find the perfect vehicle that meets your requirements.',
  },
  {
    number: '02',
    icon: MessageCircle,
    title: 'Contact Us',
    description:
      'Contact our team via WhatsApp, email, or phone. We\'ll answer your questions and provide additional details about the vehicle.',
  },
  {
    number: '03',
    icon: FileCheck,
    title: 'Vehicle Inspection',
    description:
      'We conduct a thorough inspection and provide detailed reports including photos and videos. You can also request a live video call inspection.',
  },
  {
    number: '04',
    icon: CreditCard,
    title: 'Payment & Documents',
    description:
      'Once you confirm your purchase, make the payment via bank transfer. We\'ll prepare all necessary export documents.',
  },
  {
    number: '05',
    icon: Ship,
    title: 'Shipping',
    description:
      'Your vehicle will be shipped to your nearest port. We handle all logistics and provide real-time tracking information.',
  },
  {
    number: '06',
    icon: CheckCircle,
    title: 'Receive Your Car',
    description:
      'Pick up your vehicle at the port. We\'ll assist with any customs clearance requirements and documentation.',
  },
];

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept international bank wire transfers (T/T). For large orders, we may offer Letter of Credit (L/C) terms. We require a deposit of 30% to secure the vehicle, with the balance due before shipping.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Shipping times vary depending on your location. Generally, it takes 2-4 weeks to most Asian ports, 4-6 weeks to Middle East and Africa, and 6-8 weeks to Europe and Americas. We provide real-time tracking for all shipments.',
  },
  {
    question: 'Do you provide vehicle inspection reports?',
    answer:
      'Yes, we provide comprehensive inspection reports for all vehicles including exterior condition, interior condition, mechanical inspection, and accident history. We can also arrange live video inspections upon request.',
  },
  {
    question: 'What documents are included with the vehicle?',
    answer:
      'We provide: Original vehicle registration, Export certificate, Bill of Lading, Commercial Invoice, Packing List, and any other documents required by your country\'s customs authority.',
  },
  {
    question: 'Can you ship to my country?',
    answer:
      'We export to over 50 countries worldwide. Contact us with your location, and we\'ll confirm availability and provide a shipping quote. Some countries have specific import regulations that may affect vehicle eligibility.',
  },
  {
    question: 'What warranty do you offer?',
    answer:
      'All vehicles are sold as-is, typical for used car exports. However, we conduct thorough inspections and only sell vehicles that meet our quality standards. We can arrange extended warranty coverage through third-party providers for an additional fee.',
  },
  {
    question: 'Can I request specific modifications or accessories?',
    answer:
      'Yes, we can arrange for certain modifications or accessories before shipping. Common requests include window tinting, dash cameras, floor mats, and protective films. Contact us with your requirements for a quote.',
  },
  {
    question: 'What happens if the vehicle is damaged during shipping?',
    answer:
      'All vehicles are insured during shipping. In the unlikely event of damage, you\'ll receive full compensation. We carefully inspect and photograph each vehicle before loading to ensure proper documentation.',
  },
];

export default function HowToBuyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-blue-700 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              How to Buy
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              Your step-by-step guide to purchasing a Korean used car
            </p>
          </motion.div>
        </div>
      </div>

      {/* Steps */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Simple <span className="gradient-text">6-Step</span> Process
            </h2>
            <p className="mt-4 text-muted-foreground">
              We&apos;ve made importing your dream car as easy as possible
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
              >
                <div className="card-hover rounded-2xl bg-card border border-border p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-primary">
                        Step {step.number}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div>
              <h2 className="text-2xl font-bold">Ready to get started?</h2>
              <p className="mt-2 text-muted-foreground">
                Browse our inventory and find your perfect Korean vehicle today.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/cars"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-all hover:scale-105"
              >
                Browse Cars
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-medium transition-all hover:bg-border"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              Find answers to common questions about our services
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full rounded-xl bg-card border border-border p-4 text-left transition-all hover:border-primary"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  {openFaq === index && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 text-muted-foreground"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[var(--primary)] to-blue-700 p-8 lg:p-12">
            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white lg:text-3xl">
                  Still have questions?
                </h2>
                <p className="mt-2 text-blue-100">
                  Our team is here to help you with any questions about the
                  buying process.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://wa.me/821012345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-medium text-white transition-all hover:scale-105"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-primary transition-all hover:scale-105"
                >
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
