import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content='LLM Timeline - Explore the LLM landscape visually'/>
        <meta name="keywords" content="LLMs, LLM Visualization, LLM Graph, LLM Progress" />
        <meta name="author" content="Michael Gathara" />
        <title>LLM Timeline</title>
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
