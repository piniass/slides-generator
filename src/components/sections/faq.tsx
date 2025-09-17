"use client";

import { useState } from "react";

export default function FAQ() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const faqs = [
    {
      question: "What's included in the template?",
      answer:
        "Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui components, Supabase integration, and Stripe payments.",
    },
    {
      question: "How do I customize it?",
      answer:
        "You can customize colors, fonts, and components through Tailwind CSS and shadcn/ui. All components are well-documented.",
    },
    {
      question: "How do I deploy this?",
      answer:
        "The template works with Vercel, Netlify, or any platform that supports Next.js.",
    },
    {
      question: "What about support?",
      answer:
        "We provide documentation and community support. Email support is available for paid plans.",
    },
    {
      question: "Can I get a refund?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about our template and how to get
            started
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group bg-emerald-900/20 rounded-2xl border border-emerald-800/30 hover:border-emerald-700/50 hover:shadow-lg transition-all duration-300 overflow-hidden backdrop-blur-sm"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
                >
                  <h3 className="text-xl font-semibold text-zinc-100 pr-6 group-hover:text-white transition-colors">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-800/30 flex items-center justify-center group-hover:bg-emerald-700/40 transition-colors">
                    {openItem === index ? (
                      <svg
                        className="w-4 h-4 text-white/80 transform rotate-180 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-600 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openItem === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-8 pb-6">
                    <div className="border-t border-gray-100 pt-6">
                      <p className="text-white/80 leading-relaxed text-lg">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="text-center mt-16">
          <p className="text-white/80 mb-4">Still have questions?</p>
          <a
            href={`mailto:${
              process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@example.com"
            }`}
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
