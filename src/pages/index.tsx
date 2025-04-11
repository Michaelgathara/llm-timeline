"use client";

import React, { useState } from 'react';
import Timeline from '../components/Timeline';
import CompanyTimeline from 'src/components/CompanyTimeline';
import dynamic from 'next/dynamic';
import { GoogleAnalytics } from '@next/third-parties/google'

const TimelineVisualization = dynamic(
  () => import('../components/TimelineVisualization'),
  { ssr: false }
);

export default function Home() {
  const [viewMode, setViewMode] = useState<'svg' | 'react'>('svg');

  return (
    <>
    <head>
      <title>LLM Timeline</title>
      <meta name="description" content='LLM Timeline - Explore the LLM landscape visually'/>
    </head>
    <main className="flex min-h-screen flex-col">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 to-white"></div>
      
      {/* <header className="sticky top-0 z-50 bg-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Large Language Model Evolution</h1>
            <div className="flex items-center space-x-4">
              <button 
                className={`px-4 py-2 rounded-md transition ${viewMode === 'svg' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setViewMode('svg')}
              >
                Full Timeline
              </button>
              <button 
                className={`px-4 py-2 rounded-md transition ${viewMode === 'react' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setViewMode('react')}
              >
                Interactive View
              </button>
            </div>
          </div>
        </div>
      </header> */}
      
      <div className="container mx-auto px-4 py-8">
        {viewMode === 'svg' ? (
          <Timeline />
          // <CompanyTimeline />
        ) : (
          <TimelineVisualization />
        )}
      </div>
      
      <footer className="bg-gray-100 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400 text-sm mt-2">
            &copy; {new Date().getFullYear()} <a className="underline" href='https://michaelgathara.com' target='_blank'>Michael Gathara</a>
          </p>
          <p className="text-center text-gray-400 text-sm mt-2">
            Fully open source: <a className='underline' href='https://michaelgathara.com/git/llm-timeline' target='_blank'>Michaelgathara/llm-timeline</a>
          </p>
        </div>
      </footer>
      <GoogleAnalytics gaId="G-4ZCY75KKYB" />
    </main>
    </>
  );
}