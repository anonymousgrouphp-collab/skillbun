/**
 * Phase 2: Data & AI Pillar Questions
 * Differentiates between Data Science, Data Engineering, ML/AI, NLP, Computer Vision, GenAI, MLOps, LLMOps, etc.
 */

module.exports = [
  {
    id: 201,
    phase: 2,
    pillar: "data_ai",
    q: "In the Data & AI landscape, which specific domain of data engineering or artificial intelligence attracts you most?",
    options: [
      { l: "A", t: "Machine Learning & Deep Learning: Training predictive models, classification, regression, and PyTorch experiments.", tags: ["ai_ml_engineer", "data_science"], i: "Core ML Engineer, {name}! Building and fine-tuning predictive neural networks is your passion." },
      { l: "B", t: "Generative AI & LLMs: Building RAG apps, prompt workflows, fine-tuning open LLMs, and AI agent frameworks.", tags: ["generative_ai_app_developer", "prompt_engineer", "llmops_engineer"], i: "GenAI Pioneer, {name}! LLMs, RAG pipelines, and autonomous AI agents are the future you want to build." },
      { l: "C", t: "Data Engineering & Pipelines: Building scalable ETL/ELT pipelines with Apache Spark, Kafka, and Snowflake/BigQuery.", tags: ["data_engineering", "analytics_engineer"], i: "Data Pipeline Architect, {name}! High-volume data flows and warehouse transformations are your domain." },
      { l: "D", t: "Computer Vision or Speech AI: Processing images, video feeds, OCR, object detection, or speech-to-text models.", tags: ["computer_vision_engineer", "speech_ai_engineer"], i: "Perceptual AI Specialist, {name}! Teaching computers to see and hear world inputs is fascinating." }
    ]
  },
  {
    id: 202,
    phase: 2,
    pillar: "data_ai",
    q: "How do you prefer working with datasets and AI models day-to-day?",
    options: [
      { l: "A", t: "Data Analytics & Storytelling: Querying SQL, analyzing trends in Pandas, and building executive dashboards.", tags: ["data_analyst", "bi_developer", "data_visualization_specialist"], i: "Data Analyst & Storyteller, {name}! Translating raw business numbers into strategic insights is powerful." },
      { l: "B", t: "Statistical Modeling & Research: Formulating hypotheses, feature engineering, and testing advanced math models.", tags: ["data_science", "ai_research_engineer", "reinforcement_learning_engineer"], i: "Data Scientist, {name}! Rigorous statistics and algorithmic experimentation drive your career." },
      { l: "C", t: "MLOps & Model Deployment: Containerizing models, CI/CD for AI, monitoring drift, and serving inference APIs.", tags: ["mlops_engineer", "llmops_engineer"], i: "MLOps Engineer, {name}! Taking ML models out of Jupyter notebooks into production APIs is key." },
      { l: "D", t: "Natural Language Processing (NLP): Text classification, sentiment extraction, tokenization, and BERT/Transformer models.", tags: ["nlp_engineer", "ai_ml_engineer"], i: "NLP Specialist, {name}! Teaching machines to understand and generate human language is your expertise." }
    ]
  },
  {
    id: 203,
    phase: 2,
    pillar: "data_ai",
    q: "If an Indian enterprise wants to harness its customer data for strategic growth, where would you step in?",
    options: [
      { l: "A", t: "Build a Personalized Recommendation Engine: Ranking product recommendations using collaborative filtering.", tags: ["recommendation_systems_engineer", "ai_ml_engineer"], i: "Recommendation Specialist, {name}! E-commerce ranking and discovery algorithms create massive value." },
      { l: "B", t: "Build a Unified Data Governance & Catalog System: Ensuring data quality, lineage, privacy, and compliance.", tags: ["data_governance_specialist", "analytics_engineer"], i: "Data Steward & Architect, {name}! Reliable data quality and governance are the baseline of enterprise trust." },
      { l: "C", t: "Build a Geospatial & Location Intelligence System: Analyzing satellite imagery, delivery routes, and maps.", tags: ["geospatial_data_scientist", "data_science"], i: "Geospatial Data Scientist, {name}! Spatial data and location analytics power modern logistics and urban tech." },
      { l: "D", t: "Build an Enterprise RAG Search Assistant: Connecting company PDFs and databases to an internal chatbot.", tags: ["generative_ai_app_developer", "llmops_engineer"], i: "Enterprise GenAI Developer, {name}! Grounding LLMs on custom enterprise knowledge transforms business efficiency." }
    ]
  }
];
