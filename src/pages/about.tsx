import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <>
      <head>
        <title>About - LLM Timeline</title>
        <meta name="description" content="About the LLM Timeline project - Exploring the evolution of large language models" />
      </head>
      <main className="flex min-h-screen flex-col">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 to-white"></div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
              &larr; Back to Timeline
            </Link>
            
            <h1 className="text-3xl font-bold mb-6">About LLM Timeline</h1>
            
            <div className="prose prose-lg">
              <p className="mb-4">
                Welcome to LLM Timeline, a visual exploration of the evolution of Large Language Models from the groundbreaking Transformer architecture in 2017 to today's cutting-edge models.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Project Purpose</h2>
              <p className="mb-4">
                This project aims to provide researchers, developers, and AI enthusiasts with a clear visualization of how large language models have evolved over time. By mapping the relationships between models and highlighting key innovations, we hope to make the complex history of LLMs more accessible.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Timeline Features</h2>
              <ul className="list-disc pl-5 mb-6 space-y-2">
                <li>Interactive visualization of LLM development history</li>
                <li>Color-coded branches representing different model architectures and approaches</li>
                <li>Detailed information about each model's innovations and impact</li>
                <li>Connection visualization showing how models build upon previous research</li>
                <li>Links to original research papers and resources</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Data Sources</h2>
              <p className="mb-4">
                The information in this timeline is compiled from academic papers, official model releases, and technical documentation from organizations like OpenAI, Google, Meta, Anthropic, and others. We strive to maintain accuracy and welcome corrections or additions.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">About the Creator</h2>
              <p className="mb-4">
                This project was created by <a href="https://michaelgathara.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Michael Gathara</a>, a CS and MBA student interested in the evolution and capabilities of large language models.
              </p>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Open Source</h2>
              <p className="mb-4">
                LLM Timeline is fully open source. You can view the code, suggest changes, or contribute to the project on <a href="https://michaelgathara.com/git/llm-timeline" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a>.
              </p>
            </div>
          </div>
        </div>
        
        <footer className="bg-gray-100 py-6 mt-auto">
          <div className="container mx-auto px-4">
            <p className="text-center text-gray-400 text-sm mt-2">
              &copy; {new Date().getFullYear()} <a className="underline" href='https://michaelgathara.com' target='_blank' rel="noopener noreferrer">Michael Gathara</a>
            </p>
            <p className="text-center text-gray-400 text-sm mt-2">
              Fully open source: <a className='underline' href='https://michaelgathara.com/git/llm-timeline' target='_blank' rel="noopener noreferrer">Michaelgathara/llm-timeline</a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}