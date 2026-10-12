/* ------------------------------------------------------------------ *
 * Your projects, for Chapter VI (Observations).
 *
 * They appear in this order (your priority order), each one an
 * "observation plate" on a horizontal track.
 *
 * Everything here was taken from each repo's README. Edit freely.
 * `image` is a path inside the GitHub repo; it is loaded straight from
 * GitHub and resized by Next.js (see next.config.ts).
 * ------------------------------------------------------------------ */

export type GroupId = 'agents' | 'truth' | 'frontier'

export type Project = {
  id: string
  name: string
  group: GroupId
  pitch: string
  highlights: string[]
  stats?: { value: string; label: string }[]
  stack: string[]
  credit?: string
  repo: string
  demo?: string
  image?: { path: string; caption: string }
}

/** The three kinds of work, shown as a tag on each plate. */
export const GROUPS: Record<GroupId, { name: string; colour: string }> = {
  agents: { name: 'Agents that run real work', colour: '#f5c27a' },
  truth: { name: 'Systems that check what is true', colour: '#9cc4ff' },
  frontier: { name: 'AI at the edges', colour: '#ff9aa8' },
}

const GH = 'https://github.com/keshav301104'

export const PROJECTS: Project[] = [
  {
    id: 'flowline',
    name: 'Flowline',
    group: 'agents',
    pitch: 'Write a business workflow as a row in Excel. Flowline turns it into a working AI agent.',
    highlights: [
      'One LangGraph engine runs every workflow: an 11th workflow needs zero new Python',
      'Pauses to ask a person when data is missing, then resumes the same run',
      'The LLM handles language; Python does the maths, so every threshold is exact',
    ],
    stats: [
      { value: '10', label: 'workflows' },
      { value: '32', label: 'shared tools' },
      { value: '76', label: 'tests' },
    ],
    stack: ['LangGraph', 'FastAPI', 'Server-Sent Events', 'OpenAI · Gemini · Groq · Anthropic'],
    repo: `${GH}/workbook-to-workforce`,
    image: { path: 'workbook-to-workforce/main/docs/02-live-run.png', caption: 'Live run with simulated API faults' },
  },
  {
    id: 'genesis',
    name: 'GENESIS',
    group: 'frontier',
    pitch: 'A flight simulator for synthetic biology: predicts how E. coli will behave before anything touches a lab.',
    highlights: [
      'I owned the AI engine: fine-tuning HyenaDNA, a genomic foundation model',
      'A gene-expression model and RBS calculator feed a metabolic simulation (COBRApy)',
      'Grounded in real biology data: RegulonDB, BRENDA and iGEM parts',
    ],
    stack: ['PyTorch', 'HyenaDNA', 'ONNX Runtime', 'COBRApy', 'FastAPI'],
    credit: 'Team project with Arpit Makkar',
    repo: `${GH}/GENESIS-flight-simulator-for-synthetic-biology`,
  },
  {
    id: 'csqp',
    name: 'CSQP',
    group: 'frontier',
    pitch: 'Tracks brain shift during surgery from the live microscope feed: a low-cost companion to intraoperative MRI.',
    highlights: [
      'Locks onto tissue with OpenCV tracking and ignores tools entering the frame',
      'A LangGraph supervisor raises a CRITICAL SHIFT alert when strain crosses safe limits',
      'Hybrid quantum-classical network (PennyLane, Qiskit). A research proof-of-concept',
    ],
    stack: ['OpenCV', 'PyTorch', 'PennyLane', 'LangGraph'],
    repo: `${GH}/CSQP`,
    image: { path: 'CSQP/main/data/screenshot.png', caption: 'The clinical HUD' },
  },
  {
    id: 'veritas',
    name: 'Veritas Engine',
    group: 'truth',
    pitch: "A peer-review swarm that doesn't just read a paper: it writes and runs code to test the claims.",
    highlights: [
      'Reads PDFs and screenshots, then a fast model distils the core claim and variables',
      'A sandbox agent writes Python (SciPy, SymPy) and runs it in isolation',
      'An adversarial "Reviewer 2" returns VERIFIED, DEBUNKED or UNVERIFIABLE',
    ],
    stats: [
      { value: '4', label: 'agent nodes' },
      { value: '~90%', label: 'fewer tokens' },
    ],
    stack: ['LangGraph', 'Groq · Llama 3', 'FastAPI', 'Next.js', 'Tesseract OCR'],
    repo: `${GH}/veritas-engine`,
    image: { path: 'veritas-engine/main/docs/sandbox_telemetry.png', caption: 'Live sandbox telemetry' },
  },
  {
    id: 'webforge',
    name: 'WebForge AI',
    group: 'agents',
    pitch: 'Rewrites a landing page to match an ad campaign: three variants, without breaking a single layout.',
    highlights: [
      'Deep DOM tracking: tags every node, rewrites it as strict JSON, re-injects it 1:1',
      'A vision agent reads the ad creative and re-themes the page in its colours',
      'Generates Urgency, Trust and Logical variants for A/B/C testing',
    ],
    stack: ['LangGraph', 'Gemini', 'FastAPI', 'BeautifulSoup', 'Next.js 16'],
    repo: `${GH}/WebFordge-AI`,
    demo: 'https://web-fordge-ai.vercel.app',
    image: { path: 'WebFordge-AI/main/backend/images/output_pages.png', caption: 'Three generated variants' },
  },
  {
    id: 'eidolon',
    name: 'Project Eidolon',
    group: 'frontier',
    pitch: '50 self-healing honeypots that lure attackers in, study them, and ban them.',
    highlights: [
      'An LLM invents a unique, convincing fake page for every attacker',
      'Every probe is logged, classified, geolocated and scored for threat',
      'eBPF stealth makes 50 containers look like 50 different machines',
    ],
    stats: [
      { value: '50', label: 'honeypots' },
      { value: '<2s', label: 'AI response' },
      { value: '≤60s', label: 'to alert' },
    ],
    stack: ['Docker Swarm', 'Groq · Llama 3.3', 'ELK Stack', 'Fail2Ban', 'eBPF'],
    credit: 'Team project with Arpit Makkar',
    repo: `${GH}/project-eidolon`,
    image: { path: 'project-eidolon/main/Images/KibanaDashboard.png', caption: 'Kibana war room' },
  },
  {
    id: 'vikara',
    name: 'Vikara.AI',
    group: 'agents',
    pitch: 'A voice agent that runs screening interviews and books them straight into the calendar.',
    highlights: [
      'Full-duplex voice that handles being interrupted mid-sentence',
      'Checks live Google Calendar availability and creates Meet invites',
      'Reschedules and cancels from plain-language requests',
    ],
    stats: [{ value: '<500ms', label: 'response' }],
    stack: ['Retell AI', 'Groq · Llama 3.1', 'FastAPI', 'Google Calendar API', 'Next.js'],
    repo: `${GH}/VikaraAI-Interview-Scheculing-Agent`,
    demo: 'https://vikara-ai-interview-scheculing-agent-h04hzdqyv.vercel.app/',
    image: { path: 'VikaraAI-Interview-Scheculing-Agent/main/docs/interface.png', caption: 'The interview interface' },
  },
  {
    id: 'govpreneurs',
    name: 'GovPreneurs',
    group: 'agents',
    pitch: 'Drafts government contract proposals, then makes an AI auditor tear them apart before a human sees them.',
    highlights: [
      'Maker/checker loop: drafter and auditor agents iterate until the draft scores 90+',
      'Hybrid retrieval: FAISS vectors plus a knowledge graph of past performance',
      'Fully air-gapped: local Llama 3 via Ollama, so company data never leaves the machine',
    ],
    stack: ['LangGraph', 'FAISS', 'NetworkX', 'Ollama', 'FastAPI', 'Next.js'],
    repo: `${GH}/GovPreneurs_Agentic_AI`,
    image: { path: 'GovPreneurs_Agentic_AI/main/docs/processing.png', caption: 'The agent pipeline at work' },
  },
  {
    id: 'ambedkar',
    name: 'AmbedkarGPT 2.0',
    group: 'truth',
    pitch: 'Ask questions of Dr. B.R. Ambedkar’s “Castes in India” and see the evidence behind every answer.',
    highlights: [
      'Builds a knowledge graph from the text, with themes found by Louvain clustering',
      'Local search for facts, global search for themes, cross-encoder re-ranking',
      'Cites every claim, and refuses questions outside the book',
    ],
    stack: ['NetworkX', 'Sentence-Transformers', 'Mistral · Ollama', 'FastAPI', 'React'],
    repo: `${GH}/AmbedkarGPT-2.0`,
    image: { path: 'AmbedkarGPT-2.0/main/frontend/public/search.png', caption: 'The graph zooms in on the question' },
  },
  {
    id: 'neuralaudit',
    name: 'NeuralAudit',
    group: 'truth',
    pitch: 'Audits RAG chatbots: catches hallucinations and measures relevance, cost and latency.',
    highlights: [
      'A deterministic layer counts tokens, cost and latency exactly',
      'An LLM judge (Gemini 2.5 Flash) checks every answer against its source context',
      'A radar-chart dashboard gives a reliability score at a glance',
    ],
    stack: ['FastAPI', 'LangChain', 'Gemini', 'tiktoken', 'Chart.js'],
    repo: `${GH}/Neural_Audit`,
    image: { path: 'Neural_Audit/main/NeuralAudit_Dashboard.png', caption: 'An evaluated conversation' },
  },
  {
    id: 'aml',
    name: 'AML Investigation Hub',
    group: 'agents',
    pitch: 'An AI analyst that investigates suspicious bank accounts, and leaves the final call to a human.',
    highlights: [
      'An agent gathers KYC, transactions, sanctions matches and adverse news',
      'A second agent writes a five-part investigation brief with a risk rating',
      'Analysts ask follow-ups and decide; every case is archived for audit',
    ],
    stack: ['LangGraph', 'Gemini', 'Tavily', 'Streamlit', 'pandas'],
    repo: `${GH}/AML_Agentic_AI`,
    image: { path: 'AML_Agentic_AI/main/screenshots/post_investigation.png', caption: 'A finished investigation report' },
  },
]

export const projectById = (id: string) => PROJECTS.find((p) => p.id === id)!