// pages/timeline.js
import React, { useState } from "react";
import { Chrono } from "react-chrono";

const proprietaryTimeline = [
  {
    title: "2018",
    cardTitle: "GPT-1",
    cardSubtitle: "Generative Pre-Training",
    cardDetailedText: "OpenAI introduced GPT-1: a decoder-only Transformer using unsupervised pre-training followed by fine-tuning, setting the stage for large-scale LM transfer learning."
  },
  {
    title: "2019",
    cardTitle: "GPT-2",
    cardSubtitle: "Scaling and Unsupervised Multitasking",
    cardDetailedText: "GPT-2 scaled up to 1.5B parameters on WebText and demonstrated unsupervised multitask learning, sparking debate on responsible releases."
  },
  {
    title: "2020",
    cardTitle: "GPT-3",
    cardSubtitle: "Few-Shot Learning",
    cardDetailedText: "GPT-3 (175B) amazed the community with its ability to perform tasks in few-shot or even zero-shot setups, showing that scaling produces emergent behaviors."
  },
  {
    title: "2023",
    cardTitle: "GPT-4",
    cardSubtitle: "Multimodality and Advanced Reasoning",
    cardDetailedText: "GPT-4 built upon its predecessors with multimodal (image + text) inputs and improved reasoning, though details about its size remain undisclosed."
  },
  {
    title: "2023",
    cardTitle: "Claude 2",
    cardSubtitle: "Extended Context",
    cardDetailedText: "Anthropic’s Claude 2 featured an expanded context window (up to 100k tokens) and used Constitutional AI for safer alignment."
  }
];

const openSourceTimeline = [
  {
    title: "2017",
    cardTitle: "Attention Is All You Need",
    cardSubtitle: "Transformer Architecture",
    cardDetailedText: "Vaswani et al. introduced the Transformer model, a milestone that eliminated recurrence and used self-attention for parallelizable training."
  },
  {
    title: "2022",
    cardTitle: "Meta OPT & BigScience BLOOM",
    cardSubtitle: "Community Open Models",
    cardDetailedText: "Meta’s OPT-175B and BigScience’s BLOOM (176B) showcased that large LMs could be released to researchers, spurring open innovation."
  },
  {
    title: "2023",
    cardTitle: "LLaMA",
    cardSubtitle: "Efficient Open Foundation Models",
    cardDetailedText: "Meta’s LLaMA series provided competitive performance (at 7–65B parameters) and led to derivative models like Alpaca and Vicuna."
  },
  {
    title: "2023",
    cardTitle: "LLaMA 2",
    cardSubtitle: "Open-Source Chat Models",
    cardDetailedText: "LLaMA 2 improved on previous iterations with built-in RLHF tuning, becoming a gold standard for open research in LLMs."
  }
];

const academicTimeline = [
  {
    title: "2018",
    cardTitle: "BERT",
    cardSubtitle: "Bidirectional Encoder",
    cardDetailedText: "Google’s BERT introduced masked language modeling, enabling deep bidirectional representation learning and improving many NLP benchmarks."
  },
  {
    title: "2020",
    cardTitle: "Retrieval-Augmented Generation (RAG)",
    cardSubtitle: "External Knowledge Integration",
    cardDetailedText: "RAG integrated external knowledge sources into generation, allowing models to provide more factual and up-to-date information."
  },
  {
    title: "2021",
    cardTitle: "Switch Transformer",
    cardSubtitle: "Mixture-of-Experts",
    cardDetailedText: "Google's Switch Transformer demonstrated how Mixture-of-Experts (MoE) can scale models to trillion-plus parameters while keeping inference manageable."
  },
  {
    title: "2022",
    cardTitle: "InstructGPT / RLHF",
    cardSubtitle: "Alignment via Human Feedback",
    cardDetailedText: "InstructGPT showed that fine-tuning language models with human instruction and feedback (via RLHF) improves adherence to desired outputs and safety."
  },
  {
    title: "2025",
    cardTitle: "LLaMA 4",
    cardSubtitle: "Modern MoE LLM",
    cardDetailedText: "LLaMA 4 from Meta combines MoE architecture with multimodal inputs in an open model, representing a next-generation shift by allowing high effective capacity with efficient inference."
  }
];

const tabStyles = {
  container: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "2rem",
    gap: "1rem"
  },
  button: (active) => ({
    padding: "0.5rem 1rem",
    border: "none",
    borderBottom: active ? "2px solid #0070f3" : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    fontSize: "1rem",
    outline: "none"
  })
};

export default function TimelinePage() {
  const [activeTab, setActiveTab] = useState("Proprietary");

  let timelineItems = [];
  if (activeTab === "Proprietary") {
    timelineItems = proprietaryTimeline;
  } else if (activeTab === "Open-Source") {
    timelineItems = openSourceTimeline;
  } else if (activeTab === "Academic") {
    timelineItems = academicTimeline;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Evolution of LLM Architectures</h1>
      <div style={tabStyles.container}>
        {["Proprietary", "Open-Source", "Academic"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={tabStyles.button(activeTab === tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ width: "100%", height: "600px" }}>
        <Chrono 
          items={timelineItems}
          mode="HORIZONTAL"
          cardPositionHorizontal="top"
          theme={{
            primary: "#0070f3",
            secondary: "#d2e5f3",
            cardBgColor: "#fff",
            cardForeColor: "#000",
            titleColor: "#0070f3"
          }}
          style={{ padding: "2rem" }}
        />
      </div>
    </div>
  );
}
