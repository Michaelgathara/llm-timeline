// TODO: Think about storing this in a better manner
/**
 * JSON Database, potentially 
 * This already runs on Firebase so could use Firestore or really any NoSQL Document Database. 
 * Will probably move this to Firestore soon, will need to think about how to get contributors to add data to firestore
 */
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

  const getSortableMonth = (month?: number) => month ?? 6;

  export interface TimelineBranch {
    id: string;
    name: string;
    color: string;
  }

  const validateTimelineData = (nodes: TimelineNode[], branches: TimelineBranch[]) => {
    const branchIds = new Set(branches.map(branch => branch.id));
    const nodeById = new Map(nodes.map(node => [node.id, node]));
    const seenIds = new Set<string>();

    nodes.forEach(node => {
      if (seenIds.has(node.id)) {
        throw new Error(`Timeline node "${node.id}" is duplicated.`);
      }

      seenIds.add(node.id);

      if (node.month && (node.month < 1 || node.month > 12)) {
        throw new Error(`Timeline node "${node.id}" uses invalid month "${node.month}".`);
      }

      if (!branchIds.has(node.branch)) {
        throw new Error(`Timeline node "${node.id}" uses unknown branch "${node.branch}".`);
      }

      (node.parentIds || []).forEach(parentId => {
        const parent = nodeById.get(parentId);
        if (!parent) {
          throw new Error(`Timeline node "${node.id}" references missing parent "${parentId}".`);
        }

        const parentAfterChild =
          parent.year > node.year ||
          (parent.year === node.year && getSortableMonth(parent.month) > getSortableMonth(node.month));

        if (parentAfterChild) {
          throw new Error(
            `Timeline node "${node.id}" references parent "${parentId}" from a later date.`
          );
        }
      });
    });
  };
  
  export const timelineData: TimelineNode[] = [
    {
      id: "transformer",
      title: "\"Attention Is All You Need\"",
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
      month: 5,
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
      parentIds: ["gpt2"],
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
      month: 3,
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
      id: "chatgpt",
      title: "ChatGPT: Conversational Interface",
      year: 2022,
      month: 11,
      description: "OpenAI's ChatGPT brought conversational AI to the mainstream with an intuitive interface on top of GPT-3.5.",
      branch: "alignment",
      parentIds: ["instructgpt"],
      innovations: [
        "Conversation-based interface for non-experts",
        "Improved instruction following",
        "Human preference alignment",
        "Memory within conversation context"
      ],
      impact: "Became the fastest-growing consumer application in history, introducing AI to the general public.",
      link: "https://openai.com/blog/chatgpt"
    },
    {
      id: "constitutional-ai",
      title: "Constitutional AI",
      year: 2022,
      month: 12,
      description: "Anthropic's approach to alignment using AI feedback rather than direct human feedback.",
      branch: "alignment",
      parentIds: ["instructgpt"],
      innovations: [
        "Self-supervision for harmful queries",
        "Constitutional principles for alignment",
        "Reduced need for human labelers on sensitive content"
      ],
      impact: "Provided a scalable alternative to RLHF requiring less direct human feedback on harmful content.",
      link: "https://arxiv.org/abs/2212.08073"
    },
    {
      id: "mamba",
      title: "Mamba: State Space Models",
      year: 2023,
      month: 12,
      description: "A new architecture using selective state space models as an alternative to attention mechanisms.",
      branch: "foundation",
      parentIds: ["transformer"],
      innovations: [
        "Linear scaling with sequence length (vs. quadratic for attention)",
        "Selective state space sequence modeling",
        "Hardware-aware algorithm design"
      ],
      modelSize: "Various (2.8B for Mamba-2.8B)",
      impact: "Potentially more efficient handling of very long sequences compared to attention-based models.",
      link: "https://arxiv.org/abs/2312.00752"
    },
    {
      id: "dalle3",
      title: "DALL-E 3",
      year: 2023,
      month: 10,
      description: "OpenAI's third-generation text-to-image model with significantly improved prompt following.",
      branch: "multimodal",
      parentIds: ["gpt4"],
      innovations: [
        "GPT-4 integration for prompt interpretation",
        "High fidelity to complex text prompts",
        "Image consistency across multiple generations"
      ],
      impact: "Dramatically improved ability to follow detailed prompts and generate coherent scenes.",
      link: "https://openai.com/dall-e-3"
    },
    {
      id: "gemini-nano",
      title: "Gemini Nano: On-Device Models",
      year: 2023,
      month: 12,
      description: "Google's efficient on-device variant of Gemini designed for mobile and edge computing.",
      branch: "multimodal",
      parentIds: ["gemini"],
      innovations: [
        "Highly optimized for mobile hardware",
        "Privacy-preserving on-device inference",
        "Efficient multimodal understanding"
      ],
      modelSize: "1.8B and 3.25B parameters",
      impact: "Enabled powerful AI capabilities directly on smartphones without cloud dependency.",
      link: "https://deepmind.google/technologies/gemini/"
    },
    {
      id: "megatron",
      title: "Megatron-Turing NLG",
      year: 2021,
      month: 10,
      description: "Microsoft and NVIDIA's massive language model trained on supercomputing infrastructure.",
      branch: "decoder-only",
      parentIds: ["gpt3"],
      innovations: [
        "Scaled training infrastructure",
        "3D parallelism for efficient training",
        "Mixed-precision optimization"
      ],
      modelSize: "530B parameters",
      impact: "Pushed the boundaries of model scaling while improving training efficiency.",
      link: "https://developer.nvidia.com/blog/using-deepspeed-and-megatron-to-train-megatron-turing-nlg-530b-the-worlds-largest-and-most-powerful-generative-language-model/"
    },
    {
      id: "palm2",
      title: "PaLM 2",
      year: 2023,
      month: 5,
      description: "Google's more efficient follow-up to PaLM with improved multilingual and reasoning capabilities.",
      branch: "decoder-only",
      parentIds: ["palm"],
      innovations: [
        "Compute-optimal scaling",
        "Enhanced multilingual capabilities",
        "Improved reasoning across domains",
        "Better model efficiency"
      ],
      modelSize: "Undisclosed (smaller than PaLM but more capable)",
      impact: "Powered Google's Bard and formed the foundation for Google's AI services.",
      link: "https://ai.google/discover/palm2/"
    },
    {
      id: "claude1",
      title: "Claude 1",
      year: 2023,
      month: 3,
      description: "Anthropic's first commercial large language model using Constitutional AI approach.",
      branch: "decoder-only",
      parentIds: ["constitutional-ai"],
      innovations: [
        "Constitutional AI alignment",
        "Enhanced harmlessness while maintaining helpfulness",
        "Improved instruction following"
      ],
      modelSize: "Undisclosed",
      impact: "Established Anthropic as a major player in the AI safety-focused LLM space.",
      link: "https://www.anthropic.com/index/introducing-claude"
    },
    {
      id: "falcon",
      title: "Falcon LLM",
      year: 2023,
      month: 9,
      description: "UAE-based Technology Innovation Institute's open-weight models trained on clean web data.",
      branch: "open-source",
      parentIds: ["gpt3"],
      innovations: [
        "Multi-query attention for efficiency",
        "Clean web-scale training corpus",
        "Permissive licensing model"
      ],
      modelSize: "7B, 40B, and 180B parameters",
      impact: "Provided high-quality open models with more permissive licensing than alternatives.",
      link: "https://falconllm.tii.ae/"
    },
    {
      id: "midjourney",
      title: "Midjourney",
      year: 2022,
      month: 7,
      description: "Text-to-image generation system with a focus on artistic quality and creative outputs.",
      branch: "multimodal",
      parentIds: ["multimodal-foundation"],
      innovations: [
        "Discord-based interface for accessibility",
        "Artistic style optimization",
        "Community-driven prompt engineering"
      ],
      impact: "Popularized AI image generation among artists and creative professionals.",
      link: "https://www.midjourney.com/home/"
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
      parentIds: ["claude1"],
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
      title: "Llama 3",
      year: 2024,
      month: 4,
      description: "Meta's updated series launched stronger 8B and 70B open-weight models with major gains in instruction following and reasoning.",
      branch: "open-source",
      parentIds: ["llama2"],
      innovations: [
        "Enhanced tokenizer (128K vocabulary)",
        "Much larger training corpus (~15T tokens)",
        "Stronger post-training for assistant behavior"
      ],
      modelSize: "8B and 70B parameters",
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
      month: 5,
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
      title: "Claude 3.5 Sonnet",
      year: 2024,
      month: 6,
      description: "Anthropic's Claude 3.5 Sonnet improved reasoning, coding, and vision performance while keeping Sonnet-class latency and pricing.",
      branch: "decoder-only",
      parentIds: ["claude3"],
      innovations: [
        "Enhanced logical reasoning",
        "Improved tool use capabilities",
        "Extended context efficiency",
        "Better multimodal comprehension"
      ],
      modelSize: "Undisclosed",
      impact: "Raised the practical quality bar for coding and reasoning workloads without requiring a flagship-tier price point.",
      link: "https://www.anthropic.com/news/claude-3-5-sonnet"
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
      description: "Anthropic introduced the first widely deployed hybrid reasoning Claude model, combining instant responses with extended thinking in one system.",
      branch: "reasoning",
      parentIds: ["claude3_5"],
      innovations: [
        "Hybrid reasoning model with optional extended thinking",
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
      title: "Llama 4: Scout and Maverick",
      year: 2025,
      month: 4,
      description: "Meta's Llama 4 launch introduced Scout and Maverick, its first open-weight natively multimodal MoE models with ultra-long context.",
      branch: "mixture-of-experts",
      parentIds: ["llama3_3", "switch-transformer"],
      innovations: [
        "Mixture-of-Experts architecture for efficiency",
        "Native multimodality (text, image, speech)",
        "10M token context window (Scout)",
        "Interleaved attention without positional embeddings (iRoPE)"
      ],
      modelSize: "Scout: 17B active (109B total), Maverick: 17B active (400B total)",
      impact: "First widely available MoE LLM combining scale and efficiency.",
      link: "https://ai.meta.com/blog/llama-4-multimodal-intelligence/"
    },
    {
      id: "gemini1_5",
      title: "Gemini 1.5 Pro and Flash",
      year: 2024,
      month: 5,
      description: "Google expanded Gemini with long-context 1.5 Pro improvements and launched 1.5 Flash, its faster, lower-cost multimodal workhorse.",
      branch: "multimodal",
      parentIds: ["gemini"],
      innovations: [
        "1M-token multimodal context window in public preview",
        "Fast distilled Flash variant for high-volume workloads",
        "Broader long-context developer access through AI Studio and Vertex AI"
      ],
      impact: "Made long-context multimodal models practical for mainstream developer workflows.",
      link: "https://blog.google/innovation-and-ai/technology/developers-tools/gemini-gemma-developer-updates-may-2024/"
    },
    {
      id: "llama3_1",
      title: "Llama 3.1",
      year: 2024,
      month: 7,
      description: "Meta upgraded Llama 3 with 128K context, multilingual support, and the 405B model that pushed open weights into frontier territory.",
      branch: "open-source",
      parentIds: ["llama3"],
      innovations: [
        "405B frontier open-weight model",
        "128K context window",
        "Stronger tool use and multilingual capabilities"
      ],
      modelSize: "8B, 70B, and 405B parameters",
      impact: "Marked the first openly available model family broadly positioned against top frontier closed models.",
      link: "https://ai.meta.com/blog/meta-llama-3-1/"
    },
    {
      id: "o1_preview",
      title: "OpenAI o1-preview",
      year: 2024,
      month: 9,
      description: "OpenAI introduced its first public reasoning-series model, built to spend more time thinking before responding on hard STEM and coding tasks.",
      branch: "reasoning",
      parentIds: ["gpt4o"],
      innovations: [
        "Reasoning-first inference with deliberate multi-step problem solving",
        "Public launch of the o-series",
        "Strong gains on math, coding, and science benchmarks"
      ],
      impact: "Shifted the frontier conversation from pure next-token scaling toward explicit reasoning behavior.",
      link: "https://openai.com/index/introducing-openai-o1-preview/"
    },
    {
      id: "qwen2_5",
      title: "Qwen 2.5",
      year: 2024,
      month: 9,
      description: "Alibaba's Qwen 2.5 series expanded the open Qwen family across more sizes and stronger multilingual, coding, and instruction-following performance.",
      branch: "open-source",
      innovations: [
        "Broader open model size range",
        "Improved multilingual performance",
        "Stronger instruction following and coding"
      ],
      impact: "Established Qwen as a top-tier open model family rather than a niche regional alternative.",
      link: "https://github.com/QwenLM/Qwen3"
    },
    {
      id: "llama3_2",
      title: "Llama 3.2",
      year: 2024,
      month: 9,
      description: "Meta extended the Llama line with multimodal vision models and lightweight edge models designed for mobile and embedded deployment.",
      branch: "multimodal",
      parentIds: ["llama3_1"],
      innovations: [
        "Meta's first multimodal Llama models",
        "On-device 1B and 3B edge variants",
        "11B and 90B vision-capable open models"
      ],
      modelSize: "1B, 3B, 11B, and 90B parameters",
      impact: "Brought the Llama ecosystem decisively into multimodal and edge deployment use cases.",
      link: "https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/"
    },
    {
      id: "claude3_5_new",
      title: "Claude 3.5 Sonnet (New) and Computer Use",
      year: 2024,
      month: 10,
      description: "Anthropic upgraded Claude 3.5 Sonnet and paired it with computer use beta, pushing Claude from chat assistant toward action-taking agent workflows.",
      branch: "reasoning",
      parentIds: ["claude3_5"],
      innovations: [
        "Major coding improvement over the initial 3.5 Sonnet release",
        "Computer use beta for desktop-style task execution",
        "Stronger agentic interaction with external tools and interfaces"
      ],
      impact: "Helped normalize the idea of language models acting directly on software rather than only generating text.",
      link: "https://www.anthropic.com/news/3-5-models-and-computer-use"
    },
    {
      id: "claude3_5_haiku",
      title: "Claude 3.5 Haiku",
      year: 2024,
      month: 11,
      description: "Anthropic shipped a faster, cheaper Claude 3.5-tier model that brought strong coding and reasoning performance to a lightweight serving tier.",
      branch: "decoder-only",
      parentIds: ["claude3"],
      innovations: [
        "Haiku-tier speed with near-Opus-class benchmark results",
        "Stronger coding efficiency at low latency",
        "Lower-cost access to modern Claude 3.5 capabilities"
      ],
      impact: "Compressed the quality gap between premium and fast-serving model tiers.",
      link: "https://docs.anthropic.com/en/release-notes/api"
    },
    {
      id: "o1",
      title: "OpenAI o1",
      year: 2024,
      month: 12,
      description: "OpenAI moved its reasoning line beyond preview with a more capable o1 release that added vision, function calling, and structured developer tooling.",
      branch: "reasoning",
      parentIds: ["o1_preview"],
      innovations: [
        "Reasoning model with function calling and Structured Outputs",
        "Vision-enabled reasoning",
        "Developer messages and stronger API integration"
      ],
      impact: "Turned reasoning models from an experimental curiosity into something developers could build serious systems around.",
      link: "https://openai.com/index/o1-and-new-tools-for-developers/"
    },
    {
      id: "gemini2_0",
      title: "Gemini 2.0 Flash",
      year: 2024,
      month: 12,
      description: "Google launched Gemini 2.0 Flash as its first Gemini model explicitly framed for the agentic era, with native tool use and multimodal output.",
      branch: "multimodal",
      parentIds: ["gemini1_5"],
      innovations: [
        "Native tool use including Search and code execution",
        "Multimodal output with image generation and speech",
        "Agent-oriented low-latency workhorse model"
      ],
      impact: "Marked Google's shift from long-context assistants toward tool-using, agent-capable models.",
      link: "https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-ai-update-december-2024/"
    },
    {
      id: "llama3_3",
      title: "Llama 3.3 70B",
      year: 2024,
      month: 12,
      description: "Meta closed 2024 with a more efficient open text model that approached Llama 3.1 405B-level usefulness at far lower serving cost.",
      branch: "open-source",
      parentIds: ["llama3_2"],
      innovations: [
        "405B-class utility in a 70B serving footprint",
        "Stronger open text-only performance efficiency",
        "Lower-cost deployment for advanced open assistants"
      ],
      modelSize: "70B parameters",
      impact: "Reinforced the trend that better data and post-training could matter as much as raw parameter count.",
      link: "https://ai.meta.com/blog/future-of-ai-built-with-llama/"
    },
    {
      id: "deepseek_v3",
      title: "DeepSeek V3",
      year: 2024,
      month: 12,
      description: "DeepSeek released a large open Mixture-of-Experts model that closed much of the gap between open and closed frontier systems at far lower serving cost.",
      branch: "mixture-of-experts",
      parentIds: ["switch-transformer", "llama3_1"],
      innovations: [
        "671B-parameter MoE with 37B active parameters",
        "Strong frontier-class open performance",
        "High throughput with open weights and technical report"
      ],
      impact: "Reset expectations for how far an open MoE model could push general-purpose capability and cost efficiency.",
      link: "https://api-docs.deepseek.com/news/news1226"
    },
    {
      id: "deepseek_r1",
      title: "DeepSeek R1",
      year: 2025,
      month: 1,
      description: "DeepSeek followed V3 with an open reasoning model trained via large-scale reinforcement learning and positioned directly against OpenAI's o-series.",
      branch: "reasoning",
      parentIds: ["deepseek_v3", "o1"],
      innovations: [
        "Open reasoning model trained with large-scale RL",
        "MIT-licensed open weights and distilled variants",
        "Competitive math and coding performance against o1-class systems"
      ],
      impact: "Proved that frontier reasoning behavior was no longer confined to closed labs.",
      link: "https://api-docs.deepseek.com/news/news250120"
    },
    {
      id: "gpt4_5",
      title: "GPT-4.5",
      year: 2025,
      month: 2,
      description: "OpenAI released GPT-4.5 as a research preview focused on broader knowledge, stronger conversational quality, and more natural interaction.",
      branch: "decoder-only",
      parentIds: ["gpt4o"],
      innovations: [
        "Scaled-up GPT-series pretraining beyond GPT-4o",
        "Improved writing quality, nuance, and emotional intelligence",
        "Research preview for general-purpose chat quality"
      ],
      impact: "Showed that scaling general-purpose chat models still mattered even as reasoning models took center stage.",
      link: "https://openai.com/index/introducing-gpt-4-5/"
    },
    {
      id: "gemini2_5",
      title: "Gemini 2.5 Pro",
      year: 2025,
      month: 3,
      description: "Google introduced Gemini 2.5 Pro as a thinking model optimized for complex reasoning, coding, and long-context multimodal problem solving.",
      branch: "multimodal",
      parentIds: ["gemini2_0"],
      innovations: [
        "Thinking model with explicit reasoning behavior",
        "State-of-the-art long-context multimodal performance",
        "Stronger coding and agentic workflow support"
      ],
      impact: "Made reasoning a first-class capability inside Google's flagship multimodal line.",
      link: "https://deepmind.google/blog/gemini-25-our-world-leading-model-is-getting-even-better/"
    },
    {
      id: "gpt4_1",
      title: "GPT-4.1",
      year: 2025,
      month: 4,
      description: "OpenAI refreshed its GPT line with GPT-4.1, emphasizing stronger coding, better instruction following, and a 1M-token API context window.",
      branch: "decoder-only",
      parentIds: ["gpt4o"],
      innovations: [
        "1M-token API context window",
        "Major coding and instruction-following gains",
        "Mini and nano variants for broader deployment tiers"
      ],
      impact: "Reasserted the GPT family as a practical production line even while the o-series pushed reasoning.",
      link: "https://openai.com/index/gpt-4-1/"
    },
    {
      id: "o3_o4_mini",
      title: "OpenAI o3 and o4-mini",
      year: 2025,
      month: 4,
      description: "OpenAI expanded its reasoning line with o3 and o4-mini, pairing stronger deliberate reasoning with tool-rich, agentic use inside ChatGPT.",
      branch: "reasoning",
      parentIds: ["o1"],
      innovations: [
        "Stronger reasoning with full tool access",
        "Agentic use of web, code, files, and images",
        "Smaller o4-mini tier for cheaper reasoning workloads"
      ],
      impact: "Pushed reasoning models from benchmark specialists toward full-stack agent behavior.",
      link: "https://openai.com/index/introducing-o3-and-o4-mini/"
    },
    {
      id: "qwen3",
      title: "Qwen3",
      year: 2025,
      month: 4,
      description: "Alibaba's Qwen3 family fused dense and MoE open models with hybrid reasoning, tool use, and broad multilingual support.",
      branch: "open-source",
      parentIds: ["qwen2_5"],
      innovations: [
        "Hybrid reasoning modes across dense and MoE variants",
        "Native support for agent and tool-oriented workflows",
        "119-language open model release"
      ],
      impact: "Moved Qwen into the top tier of globally relevant open model ecosystems.",
      link: "https://github.com/QwenLM/Qwen3"
    },
    {
      id: "claude4",
      title: "Claude 4: Sonnet and Opus",
      year: 2025,
      month: 5,
      description: "Anthropic launched Claude 4 with Sonnet 4 and Opus 4, extending hybrid reasoning into stronger coding, agent workflows, and long-horizon execution.",
      branch: "reasoning",
      parentIds: ["claude3_7"],
      innovations: [
        "Next-generation hybrid reasoning for coding and agents",
        "Stronger long-running task reliability",
        "Frontier Claude split across practical Sonnet and flagship Opus tiers"
      ],
      impact: "Solidified Anthropic's position at the frontier of coding-focused agent models.",
      link: "https://www.anthropic.com/news/claude-4"
    },
    {
      id: "magistral",
      title: "Magistral",
      year: 2025,
      month: 6,
      description: "Mistral entered the reasoning-model race with Magistral, releasing both an open small model and a stronger enterprise variant.",
      branch: "reasoning",
      parentIds: ["mistral"],
      innovations: [
        "First dedicated Mistral reasoning model family",
        "Open small model paired with enterprise medium variant",
        "Transparent, multilingual reasoning focus"
      ],
      impact: "Showed that European frontier labs were moving from efficient base models into dedicated reasoning systems.",
      link: "https://mistral.ai/news/magistral"
    },
    {
      id: "gemini3_1_pro",
      title: "Gemini 3.1 Pro",
      year: 2026,
      month: 2,
      description: "Google advanced the Gemini line again with 3.1 Pro, a more capable multimodal reasoning model aimed at complex, agentic, and strategic tasks.",
      branch: "multimodal",
      parentIds: ["gemini2_5"],
      innovations: [
        "Stronger multimodal reasoning across large heterogeneous inputs",
        "Broader deployment across Gemini app, NotebookLM, and developer platforms",
        "Preview release focused on complex real-world problem solving"
      ],
      impact: "Extended Google's flagship line into the 2026 generation of agent-oriented multimodal reasoning systems.",
      link: "https://deepmind.google/blog/gemini-3-1-pro-a-smarter-model-for-your-most-complex-tasks/"
    },
    {
      id: "deepseek_v4",
      title: "DeepSeek V4 Preview",
      year: 2026,
      month: 4,
      description: "DeepSeek launched V4 Preview with 1M context, dual thinking modes, and new Pro/Flash variants aimed at cost-effective agentic performance.",
      branch: "reasoning",
      parentIds: ["deepseek_r1"],
      innovations: [
        "1M-token context window",
        "Thinking and non-thinking dual-mode inference",
        "Separate Pro and Flash variants with open-source release"
      ],
      impact: "Pushed open reasoning systems further into long-context, agent-ready territory at aggressive price points.",
      link: "https://api-docs.deepseek.com/news/news260424"
    },
    {
      id: "claude_opus_4_8",
      title: "Claude Opus 4.8",
      year: 2026,
      month: 5,
      description: "Anthropic upgraded its flagship Opus line again with Opus 4.8, improving consistency, agentic coding, and high-autonomy reasoning work.",
      branch: "reasoning",
      parentIds: ["claude4"],
      innovations: [
        "Improved long-horizon coding and agent reliability",
        "Adaptive thinking with a 1M-token context window",
        "Faster execution mode at premium throughput"
      ],
      impact: "Kept Anthropic's flagship line current in the 2026 generation of agent-oriented frontier models.",
      link: "https://www.anthropic.com/news/claude-opus-4-8"
    }
  ];
  
  // TODO: Look into more colors cause some of these are lowkey repeats on low contrast screens
  export const timelineBranches: TimelineBranch[] = [
    { id: "foundation", name: "Foundation", color: "#4285F4" }, // Google Blue
    { id: "decoder-only", name: "Decoder-Only Models", color: "#EA4335" }, // Red
    { id: "encoder-only", name: "Encoder-Only Models", color: "#FBBC05" }, // Yellow
    { id: "encoder-decoder", name: "Encoder-Decoder Models", color: "#34A853" }, // Green
    { id: "mixture-of-experts", name: "Mixture-of-Experts", color: "#8E44AD" }, // Purple
    { id: "open-source", name: "Open-Source Models", color: "#3498DB" }, // Blue
    { id: "alignment", name: "Alignment Techniques", color: "#E67E22" }, // Orange
    { id: "theory", name: "Theoretical Advances", color: "#1ABC9C" }, // Teal
    { id: "multimodal", name: "Multimodal Models", color: "#9B59B6" }, // Purple
    { id: "hybrid", name: "Hybrid Approaches", color: "#7F8C8D" }, // Gray
    { id: "reasoning", name: "Reasoning Models", color: "#C0392B" } // Dark red
  ];

  export const timelineStartYear = Math.min(...timelineData.map(node => node.year));
  export const timelineEndYear = Math.max(...timelineData.map(node => node.year));

  validateTimelineData(timelineData, timelineBranches);