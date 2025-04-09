export interface TimelineNode {
    id: string;
    title: string;
    year: number;
    month?: number; // Optional month for more precise positioning
    description: string;
    branch: string; // Which technological branch this belongs to
    innovations: string[];
    impact?: string;
    modelSize?: string; // Parameter size if applicable
    link?: string; // Optional link to more information
    parentIds?: string[]; // IDs of parent nodes (for branching)
  }
  
  export const timelineData: TimelineNode[] = [
    {
      id: "transformer",
      title: "Transformer: \"Attention Is All You Need\"",
      year: 2017,
      month: 6,
      description: "The Transformer architecture introduced by Vaswani et al. replaced recurrent networks with self-attention mechanisms, enabling better parallelization and sequence modeling.",
      branch: "foundation",
      innovations: [
        "Self-attention mechanism",
        "Multi-head attention",
        "Positional encoding",
        "Encoder-decoder architecture without recurrence or convolution"
      ],
      impact: "Formed the backbone for almost all later LLMs. Enabled parallel training on unprecedented data volumes.",
      link: "https://arxiv.org/abs/1706.03762"
    },
    {
      id: "gpt1",
      title: "GPT-1: Generative Pre-Training",
      year: 2018,
      month: 6,
      description: "OpenAI's first Generative Pre-trained Transformer introduced unsupervised pre-training plus supervised fine-tuning for NLP.",
      branch: "decoder-only",
      parentIds: ["transformer"],
      innovations: [
        "Decoder-only Transformer for language modeling",
        "Two-stage training: unsupervised pre-training + supervised fine-tuning",
        "Transfer learning paradigm for NLP"
      ],
      modelSize: "117M parameters",
      impact: "Showed substantial gains in low-data regimes via transfer learning.",
      link: "https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf"
    },
    {
      id: "bert",
      title: "BERT: Bidirectional Encoder Representations",
      year: 2018,
      month: 10,
      description: "Google's BERT used bidirectional self-attention for deep language understanding.",
      branch: "encoder-only",
      parentIds: ["transformer"],
      innovations: [
        "Masked Language Model (MLM) pre-training objective",
        "Next Sentence Prediction (NSP)",
        "Bidirectional context understanding"
      ],
      modelSize: "340M parameters (BERT-Large)",
      impact: "BERT's bidirectional embeddings improved accuracy across many NLP tasks.",
      link: "https://arxiv.org/abs/1810.04805"
    },
    {
      id: "gpt2",
      title: "GPT-2: Scaling Up",
      year: 2019,
      month: 2,
      description: "GPT-2 demonstrated the power of scale with 10x GPT-1's size, trained on high-quality web pages.",
      branch: "decoder-only",
      parentIds: ["gpt1"],
      innovations: [
        "Scale-driven capabilities (10x parameters of GPT-1)",
        "Unsupervised multitask learning",
        "Zero-shot task transfer"
      ],
      modelSize: "1.5B parameters",
      impact: "Showed that model size + data diversity = emergent abilities."
    },
    {
      id: "t5",
      title: "T5: Text-to-Text Transfer Transformer",
      year: 2019,
      month: 10,
      description: "Google's T5 unified all NLP tasks as text-to-text problems with a single model.",
      branch: "encoder-decoder",
      parentIds: ["transformer"],
      innovations: [
        "Text-to-text framework for all NLP tasks",
        "Unified approach to transfer learning"
      ],
      modelSize: "Up to 11B parameters",
      link: "https://arxiv.org/abs/1910.10683"
    },
    {
      id: "gpt3",
      title: "GPT-3: Few-Shot Learning",
      year: 2020,
      month: 5,
      description: "OpenAI's GPT-3 scaled to 175B parameters and demonstrated remarkable few-shot learning abilities.",
      branch: "decoder-only",
      parentIds: ["gpt2"],
      innovations: [
        "Few-shot learning via in-context examples",
        "Massive scale (100× GPT-2)",
        "Emergent abilities across diverse tasks"
      ],
      modelSize: "175B parameters",
      impact: "Confirmed that performance improves predictably with model size and data.",
      link: "https://arxiv.org/abs/2005.14165"
    },
    {
      id: "rag",
      title: "Retrieval-Augmented Generation (RAG)",
      year: 2020,
      month: 9,
      description: "RAG combined parametric knowledge with non-parametric retrieval to enhance factual accuracy.",
      branch: "hybrid",
      parentIds: ["transformer"],
      innovations: [
        "Non-parametric memory via external knowledge retrieval",
        "Combined generation with retrieval for better factuality"
      ],
      impact: "Influenced many 'LLM + search' systems and addressed knowledge cutoff issues.",
      link: "https://arxiv.org/abs/2005.11401"
    },
    {
      id: "scaling-laws",
      title: "Scaling Laws for Neural Language Models",
      year: 2020,
      month: 1,
      description: "Kaplan et al. formalized empirical scaling laws showing predictable improvements with model size, data, and compute.",
      branch: "theory",
      parentIds: ["gpt3"],
      innovations: [
        "Power-law relationships between model performance and resources",
        "Optimal allocation of compute budgets"
      ],
      impact: "Guided later model design decisions about model size vs. training data tradeoffs.",
      link: "https://arxiv.org/abs/2001.08361"
    },
    {
      id: "switch-transformer",
      title: "Switch Transformer (MoE)",
      year: 2021,
      month: 1,
      description: "Google introduced a simplified Mixture-of-Experts architecture reaching trillion-plus parameters with sparse activation.",
      branch: "mixture-of-experts",
      parentIds: ["transformer"],
      innovations: [
        "Sparse scaling via Mixture-of-Experts",
        "Efficient parameter scaling without proportional computation increase"
      ],
      modelSize: "Up to 1.6T parameters (sparsely activated)",
      impact: "Demonstrated that extremely large sparse models can be trained efficiently.",
      link: "https://arxiv.org/abs/2101.03961"
    },
    {
      id: "flan",
      title: "FLAN: Instruction Tuning",
      year: 2021,
      month: 10,
      description: "Google showed that fine-tuning on tasks described via natural language instructions improved zero-shot generalization.",
      branch: "alignment",
      parentIds: ["gpt3"],
      innovations: [
        "Instruction tuning across varied tasks",
        "Improved zero-shot performance on unseen tasks"
      ],
      impact: "Finetuned models became better zero-shot learners, reducing need for prompt engineering.",
      link: "https://arxiv.org/abs/2109.01652"
    },
    {
      id: "instructgpt",
      title: "InstructGPT: RLHF Alignment",
      year: 2022,
      month: 1,
      description: "OpenAI used Reinforcement Learning from Human Feedback to align language models with human preferences.",
      branch: "alignment",
      parentIds: ["gpt3"],
      innovations: [
        "RLHF pipeline for alignment",
        "Reward modeling from human preferences",
        "Improved instruction following"
      ],
      impact: "A 1.3B InstructGPT model outputs were preferred over the original 175B GPT-3. Led to ChatGPT.",
      link: "https://arxiv.org/abs/2203.02155"
    },
    {
      id: "chinchilla",
      title: "Chinchilla: Compute-Optimal Training",
      year: 2022,
      month: 3,
      description: "DeepMind revisited scaling laws, showing smaller models trained on more data outperform larger under-trained ones.",
      branch: "theory",
      parentIds: ["scaling-laws"],
      innovations: [
        "Optimal tokens-to-parameters ratio (~20:1)",
        "More efficient allocation of compute resources"
      ],
      modelSize: "70B parameters",
      impact: "Shifted industry focus from just increasing parameters to better data utilization.",
      link: "https://arxiv.org/abs/2203.15556"
    },
    {
      id: "opt",
      title: "Meta's OPT: First Major Open Model",
      year: 2022,
      month: 5,
      description: "Meta released OPT-175B, a GPT-3 equivalent model, to researchers with full weights.",
      branch: "open-source",
      parentIds: ["gpt3"],
      innovations: [
        "Open release of full weights for research",
        "Democratized access to large models"
      ],
      modelSize: "175B parameters",
      link: "https://arxiv.org/abs/2205.01068"
    },
    {
      id: "palm",
      title: "Google's PaLM",
      year: 2022,
      month: 4,
      description: "Pathways Language Model pushed dense model size to 540B parameters with strong multilingual abilities.",
      branch: "decoder-only",
      parentIds: ["gpt3"],
      innovations: [
        "Pathways system for efficient distributed training",
        "Improved reasoning and code capabilities"
      ],
      modelSize: "540B parameters",
      link: "https://arxiv.org/abs/2204.02311"
    },
    {
      id: "llama1",
      title: "LLaMA 1: Meta's Open Research LLM",
      year: 2023,
      month: 2,
      description: "Meta released LLaMA (7B-65B) models openly to researchers, triggering an open-source renaissance.",
      branch: "open-source",
      parentIds: ["opt", "chinchilla"],
      innovations: [
        "Improved training efficiency following Chinchilla ratios",
        "Strong performance at smaller scales",
        "Pre-normalization and rotary positional embeddings"
      ],
      modelSize: "7B to 65B parameters",
      impact: "Catalyzed open-source LLM development ecosystem.",
      link: "https://arxiv.org/abs/2302.13971"
    },
    {
      id: "alpaca",
      title: "Stanford Alpaca",
      year: 2023,
      month: 3,
      description: "Fine-tuned LLaMA-7B on instruction data, showing even small models can exhibit strong interactive abilities.",
      branch: "open-source",
      parentIds: ["llama1", "instructgpt"],
      innovations: [
        "Low-cost fine-tuning approach",
        "Self-instruct data generation"
      ],
      modelSize: "7B parameters",
      impact: "Demonstrated ChatGPT-like behavior could be achieved at smaller scales.",
      link: "https://crfm.stanford.edu/2023/03/13/alpaca.html"
    },
    {
      id: "gpt4",
      title: "GPT-4: Multimodal Capabilities",
      year: 2023,
      month: 3,
      description: "OpenAI's GPT-4 added vision input and demonstrated improved reasoning and knowledge.",
      branch: "multimodal",
      parentIds: ["instructgpt", "gpt3"],
      innovations: [
        "Multimodal input (text and images)",
        "Significantly improved reasoning",
        "Extended context window (32K tokens)"
      ],
      modelSize: "Undisclosed (est. 0.5-1T parameters)",
      impact: "Set new high scores on many human exams and benchmarks.",
      link: "https://arxiv.org/abs/2303.08774"
    },
    {
      id: "claude2",
      title: "Anthropic Claude 2",
      year: 2023,
      month: 7,
      description: "Anthropic launched Claude 2 with 100K token context window and Constitutional AI alignment.",
      branch: "decoder-only",
      parentIds: ["instructgpt"],
      innovations: [
        "Constitutional AI alignment approach",
        "Expanded 100K token context window"
      ],
      impact: "Demonstrated the importance of context length for real-world use cases.",
      link: "https://www.anthropic.com/news/claude-2"
    },
    {
      id: "llama2",
      title: "LLaMA 2: Commercial Open-Source",
      year: 2023,
      month: 7,
      description: "Meta's follow-up, released with an open commercial license, included models up to 70B parameters.",
      branch: "open-source",
      parentIds: ["llama1"],
      innovations: [
        "Built-in RLHF for chat models",
        "Grouped-Query Attention for efficiency",
        "Commercial license for wider adoption"
      ],
      modelSize: "7B, 13B, and 70B parameters",
      impact: "Became the open standard for commercial LLM research and applications.",
      link: "https://arxiv.org/abs/2307.09288"
    },
    {
      id: "gemini",
      title: "Google's Gemini",
      year: 2023,
      month: 12,
      description: "Google DeepMind's natively multimodal model aimed at advanced planning and tool use.",
      branch: "multimodal",
      parentIds: ["palm"],
      innovations: [
        "Native multimodality (trained on multiple modalities from scratch)",
        "Improved planning capabilities"
      ],
      modelSize: "Undisclosed (\"Ultra\" >1T parameters)",
      link: "https://deepmind.google/technologies/gemini/"
    },
    {
      id: "llama3",
      title: "LLaMA 3: Continued Scaling",
      year: 2024,
      month: 4,
      description: "Meta's updated series included a 405B parameter model approaching GPT-4's performance.",
      branch: "open-source",
      parentIds: ["llama2"],
      innovations: [
        "Enhanced tokenizer (128K vocabulary)",
        "Improved multilingual capabilities",
        "More training data (~15T tokens)"
      ],
      modelSize: "8B, 70B, and 405B parameters",
      link: "https://ai.meta.com/blog/meta-llama-3/"
    },
    {
      id: "claude3",
      title: "Claude 3 Family: Opus, Sonnet, Haiku",
      year: 2024,
      month: 3,
      description: "Anthropic released the Claude 3 family with three models balancing performance and efficiency.",
      branch: "decoder-only",
      parentIds: ["claude2"],
      innovations: [
        "Significantly improved reasoning capabilities",
        "Enhanced multimodal understanding",
        "Better function calling and tool use",
        "Tiered model offerings for different use cases"
      ],
      modelSize: "Undisclosed (estimated 100B-1T+ parameters)",
      impact: "Set new benchmarks in reasoning and multimodal tasks while providing varied price-performance options.",
      link: "https://www.anthropic.com/news/claude-3-family"
    },
    {
      id: "gpt4o",
      title: "GPT-4o: Omni Model",
      year: 2024,
      month: 8,
      description: "OpenAI's GPT-4o ('omni') combined text, vision, and audio in a faster, cheaper model matching GPT-4 Turbo performance.",
      branch: "multimodal",
      parentIds: ["gpt4"],
      innovations: [
        "Real-time responsiveness",
        "Native audio input/output",
        "Improved vision capabilities",
        "Cost-efficient multimodal processing"
      ],
      modelSize: "Undisclosed",
      impact: "Democratized multimodal AI by bringing high capabilities at lower cost and latency.",
      link: "https://openai.com/index/gpt-4o-system-card/"
    },
    {
      id: "claude3_5",
      title: "Claude 3.5: Sonnet and Haiku",
      year: 2024,
      month: 8,
      description: "Anthropic's mid-cycle update adding significant reasoning improvements and extended context handling.",
      branch: "decoder-only",
      parentIds: ["claude3"],
      innovations: [
        "Enhanced logical reasoning",
        "Improved tool use capabilities",
        "Extended context efficiency",
        "Better multimodal comprehension"
      ],
      modelSize: "Undisclosed",
      impact: "Established new SOTA on various reasoning benchmarks while maintaining competitive pricing.",
      link: "https://www.anthropic.com/claude/haiku"
    },
    {
      id: "gpt4_turbo",
      title: "GPT-4 Turbo with Vision",
      year: 2023,
      month: 11,
      description: "OpenAI's optimized GPT-4 with vision capabilities, reduced costs, and extended context window.",
      branch: "multimodal",
      parentIds: ["gpt4"],
      innovations: [
        "128K token context window",
        "Reduced latency and pricing",
        "Knowledge cutoff moved to April 2023",
        "JSON mode for structured outputs"
      ],
      modelSize: "Undisclosed",
      impact: "Made powerful multimodal AI more accessible and affordable for developers.",
      link: "https://openai.com/blog/new-models-and-developer-products-announced-at-devday"
    },
    {
      id: "mistral",
      title: "Mistral AI Models",
      year: 2023,
      month: 9,
      description: "French startup Mistral AI released efficient open-weight models rivaling much larger competitors.",
      branch: "open-source",
      parentIds: ["llama2"],
      innovations: [
        "Grouped-query attention",
        "Sliding window attention",
        "Mixture-of-Experts efficiency (for Mixtral)",
        "Strong performance at smaller parameter counts"
      ],
      modelSize: "7B and Mixtral 8x7B (MoE)",
      impact: "Demonstrated that smaller, efficient models could rival much larger ones on many tasks.",
      link: "https://mistral.ai/news/announcing-mistral-7b/"
    },
    {
      id: "phi",
      title: "Microsoft Phi Series",
      year: 2023,
      month: 9,
      description: "Microsoft Research's small but mighty models trained primarily on synthetic data.",
      branch: "open-source",
      parentIds: ["llama1"],
      innovations: [
        "Synthetic data focused training",
        "Extraordinary performance at extremely small scales",
        "Textbook-quality data curation"
      ],
      modelSize: "1.3B to 3.8B parameters",
      impact: "Showed that high-quality data curation can compensate for smaller model sizes.",
      link: "https://arxiv.org/abs/2309.05463"
    },
    {
      id: "claude3_7",
      title: "Claude 3.7 Sonnet",
      year: 2025,
      month: 2,
      description: "Anthropic's latest model with specialized 'reasoning mode' for complex problem-solving.",
      branch: "decoder-only",
      parentIds: ["claude3_5"],
      innovations: [
        "Dedicated reasoning mode for extended thinking",
        "Improved mathematical and coding capabilities",
        "Enhanced multimodal understanding",
        "Better tool use and function calling"
      ],
      modelSize: "Undisclosed",
      impact: "Set new benchmarks on complex reasoning tasks while maintaining competitive pricing.",
      link: "https://www.anthropic.com/news/claude-3-7-sonnet"
    },
    {
      id: "multimodal-foundation",
      title: "CLIP: Contrastive Language-Image Pre-training",
      year: 2021,
      month: 2,
      description: "OpenAI's CLIP connected text and images through contrastive learning, laying groundwork for multimodal models.",
      branch: "multimodal",
      parentIds: ["gpt3"],
      innovations: [
        "Contrastive learning between text and images",
        "Zero-shot transfer to visual tasks",
        "Learning from natural language supervision"
      ],
      impact: "Established foundation for later multimodal models by bridging language and vision.",
      link: "https://arxiv.org/abs/2103.00020"
    },
    {
      id: "sora",
      title: "OpenAI Sora: World Simulation",
      year: 2024,
      month: 2,
      description: "OpenAI's text-to-video model capable of generating physically plausible, high-fidelity videos up to 60 seconds.",
      branch: "multimodal",
      parentIds: ["gpt4"],
      innovations: [
        "Diffusion-based video generation",
        "Physical world modeling from text descriptions",
        "Temporal consistency across long sequences",
        "Camera movement simulation"
      ],
      impact: "Demonstrated potential for AI to simulate coherent, physically plausible worlds from text.",
      link: "https://openai.com/sora"
    },
    {
      id: "llama4",
      title: "LLaMA 4: Mixture-of-Experts",
      year: 2025,
      month: 4,
      description: "Meta's latest series incorporates Mixture-of-Experts at scale with native multimodality.",
      branch: "mixture-of-experts",
      parentIds: ["llama3", "switch-transformer"],
      innovations: [
        "Mixture-of-Experts architecture for efficiency",
        "Native multimodality (text, image, speech)",
        "10M token context window (Scout)",
        "Interleaved attention without positional embeddings (iRoPE)"
      ],
      modelSize: "Scout: 17B active (109B total), Maverick: 17B active (400B total)",
      impact: "First widely available MoE LLM combining scale and efficiency.",
      link: "https://ai.meta.com/blog/llama-4-multimodal-intelligence/"
    }
  ];
  
  // TODO: Look into more colors cause some of these are lowkey repeats on low contrast screens
  export const timelineBranches = [
    { id: "foundation", name: "Foundation", color: "#4285F4" }, // Google Blue
    { id: "decoder-only", name: "Decoder-Only Models", color: "#EA4335" }, // Red
    { id: "encoder-only", name: "Encoder-Only Models", color: "#FBBC05" }, // Yellow
    { id: "encoder-decoder", name: "Encoder-Decoder Models", color: "#34A853" }, // Green
    { id: "mixture-of-experts", name: "Mixture-of-Experts", color: "#8E44AD" }, // Purple
    { id: "open-source", name: "Open-Source Models", color: "#3498DB" }, // Blue
    { id: "alignment", name: "Alignment Techniques", color: "#E67E22" }, // Orange
    { id: "theory", name: "Theoretical Advances", color: "#1ABC9C" }, // Teal
    { id: "multimodal", name: "Multimodal Models", color: "#9B59B6" }, // Purple
    { id: "hybrid", name: "Hybrid Approaches", color: "#7F8C8D" } // Gray
  ];