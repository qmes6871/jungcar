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
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative flex items-center justify-center py-32 sm:py-40">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Jungcar/images/hero-banner.jpg"
            alt="How to Buy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a4d0e]/90 via-[#0a4d0e]/75 to-[#0a4d0e]/50" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/40 bg-[#D4A843]/10 px-4 py-1.5 text-sm font-medium text-[#D4A843] backdrop-blur-sm">
              Buying Guide
            </span>
            <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              How to <span className="text-[#D4A843]">Buy</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
              Your step-by-step guide to purchasing a premium vehicle
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== STEPS ===== */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              Process
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e] sm:text-4xl">
              Simple <span className="text-[#D4A843]">6-Step</span> Process
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#0a4d0e]/60">
              We&apos;ve made importing your dream car as easy as possible
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group rounded-2xl border border-[#0a4d0e]/10 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-[#0a4d0e]/20 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[#0a4d0e]/10 transition-colors group-hover:bg-[#0a4d0e]">
                    <step.icon className="h-6 w-6 text-[#0a4d0e] group-hover:text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#D4A843]">
                      Step {step.number}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-[#0a4d0e]">{step.title}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#0a4d0e]/60">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 sm:py-28 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[#0a4d0e]/10 bg-white p-8 shadow-lg sm:p-12 lg:p-16">
            <div className="absolute right-0 top-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-[#0a4d0e]/5" />
            <div className="absolute left-0 bottom-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-[#D4A843]/5" />

            <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div>
                <h2 className="text-2xl font-bold text-[#0a4d0e] sm:text-3xl">
                  Ready to get started?
                </h2>
                <p className="mt-2 text-[#0a4d0e]/60">
                  Browse our inventory and find your perfect Korean vehicle today.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/cars"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#0a4d0e] px-6 py-3.5 font-semibold text-white transition-all hover:bg-[#0d6611] hover:shadow-lg"
                >
                  Browse Cars
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0a4d0e]/20 px-6 py-3.5 font-semibold text-[#0a4d0e] transition-all hover:border-[#0a4d0e]/40 hover:bg-[#0a4d0e]/5"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-[#0a4d0e]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0a4d0e]">
              FAQ
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[#0a4d0e] sm:text-4xl">
              Frequently Asked <span className="text-[#D4A843]">Questions</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#0a4d0e]/60">
              Find answers to common questions about our services
            </p>
          </motion.div>

          <div className="mt-12 space-y-3">
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
                  className={`w-full rounded-xl border bg-white p-5 text-left shadow-sm transition-all ${
                    openFaq === index
                      ? 'border-[#0a4d0e]/30 shadow-md'
                      : 'border-[#0a4d0e]/10 hover:border-[#0a4d0e]/20 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-[#0a4d0e]">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-[#0a4d0e]/40 transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180 text-[#0a4d0e]' : ''
                      }`}
                    />
                  </div>
                  {openFaq === index && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 text-sm leading-relaxed text-[#0a4d0e]/60"
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

      {/* ===== BOTTOM CTA ===== */}
      <section className="py-20 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#0a4d0e] p-8 sm:p-12 lg:p-16">
            <div className="absolute right-0 top-0 -mt-20 -mr-20 h-72 w-72 rounded-full bg-[#D4A843]/10" />
            <div className="absolute left-0 bottom-0 -mb-16 -ml-16 h-56 w-56 rounded-full bg-[#D4A843]/10" />

            <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Still have questions?
                </h2>
                <p className="mt-2 text-white/60">
                  Our team is here to help you with any questions about the buying process.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://wa.me/821012345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4A843] px-6 py-3.5 font-semibold text-[#0a4d0e] transition-all hover:bg-[#e0b84f] hover:shadow-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3.5 font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
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
