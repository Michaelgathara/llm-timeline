"use client";

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GoogleAnalytics } from '@next/third-parties/google';
import Timeline from '../components/Timeline';

export default function Home() {
  return (
    <>
      <Head>
        <title>LLM Timeline</title>
        <meta
          name="description"
          content="LLM Timeline - a graph-first view of how large language models evolved over time."
        />
      </Head>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.16),_transparent_24%),linear-gradient(to_bottom,_#f8fafc,_#ffffff_38%,_#f8fafc_100%)]" />

        <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                LLM Timeline
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Graph-first timeline of model evolution
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Dense regions collapse into compact graph clusters so the timeline stays readable
                without a lot of extra interface.
              </p>
            </div>

            <Link
              href="/about"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              About
            </Link>
          </header>

          <div className="flex-1">
            <Timeline />
          </div>

          <GoogleAnalytics gaId="G-4ZCY75KKYB" />
        </div>
      </main>
    </>
  );
}