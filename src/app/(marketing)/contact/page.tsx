"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "General Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) return;
    setSubmitted(true);
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-300">
          💬 Support & Feedback
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Get in touch
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-slate-300">
          Have a question, feedback, feature request, or need help with your account? We reply to every message within 24 hours.
        </p>
      </header>

      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {/* Support Channels Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-xl text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              ✉️
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Direct Email
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              For support, billing queries, or account recovery.
            </p>
            <a
              href="mailto:support@bookstreak.com"
              className="mt-3 inline-block font-semibold text-brand-600 hover:underline dark:text-brand-400 text-sm"
            >
              support@bookstreak.com →
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-xl text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
              ⚡
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Response Time
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              We&apos;re an independent team. Most inquiries are answered in under 4 hours.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Support active
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              ❓
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Instant Answers
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Check our FAQ for instant answers about pricing, streaks, and imports.
            </p>
            <Link
              href="/faq"
              className="mt-3 inline-block font-semibold text-brand-600 hover:underline dark:text-brand-400 text-sm"
            >
              View FAQ →
            </Link>
          </div>
        </div>

        {/* Contact Form Container */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          {submitted ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-950 dark:text-emerald-300">
                🎉
              </div>
              <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                Message Received!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
                Thanks for reaching out! We&apos;ve received your message and will respond to <strong className="text-slate-900 dark:text-white">{form.email}</strong> shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Send a Message
              </h2>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-brand-400"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-brand-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Topic
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-brand-400"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Billing Support">Billing & Refund Support</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Goodreads Import">Goodreads Import Help</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-brand-400"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 active:scale-[0.99]"
              >
                Send Message →
              </button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}
