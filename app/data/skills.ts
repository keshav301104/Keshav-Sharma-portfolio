/* ------------------------------------------------------------------ *
 * Your skills, for Chapter V (Event Horizon).
 *
 * You are the black hole; each skill falls into it, one at a time,
 * in four groups of six.
 *   name    what you can do
 *   detail  how, in a few words
 *   seen    the projects / roles where you actually did it, so visitors
 *           get evidence, not buzzwords
 *
 * Edit freely, but keep six skills per group: the black hole's
 * choreography is timed for 4 × 6.
 * ------------------------------------------------------------------ */

export type Skill = { name: string; detail: string; seen?: string[] }

export type SkillGroup = {
  title: string
  tagline: string
  skills: Skill[]
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Agent Systems',
    tagline:
      'Agents built like software, not demos: typed state, checkpoints, human approval, and failure paths that degrade gracefully.',
    skills: [
      {
        name: 'LangGraph orchestration',
        detail: 'state machines · checkpoints · interrupts',
        seen: ['Flowline', 'Veritas', 'GovPreneurs', 'WebForge', 'AML Hub', 'CSQP', 'Tritone'],
      },
      { name: 'Human-in-the-loop', detail: 'pause, ask, resume the same run', seen: ['Flowline', 'GovPreneurs', 'AML Hub'] },
      { name: 'Tool use & sandboxes', detail: 'agents that act, safely isolated', seen: ['Veritas', 'Flowline', 'AML Hub'] },
      { name: 'Structured outputs', detail: 'Pydantic schemas, validated every call', seen: ['Flowline', 'Veritas', 'WebForge'] },
      { name: 'Model routing', detail: 'small models for speed, large for reasoning', seen: ['Veritas', 'Flowline'] },
      { name: 'Real-time voice agents', detail: 'full-duplex · sub-500 ms responses', seen: ['Vikara'] },
    ],
  },
  {
    title: 'Retrieval & Evaluation',
    tagline:
      'Answers you can audit: retrieval that cites its sources, and evaluation that catches hallucinations before users do.',
    skills: [
      { name: 'Hybrid RAG', detail: 'vector search + knowledge graphs', seen: ['GovPreneurs', 'AmbedkarGPT', 'Tritone'] },
      { name: 'GraphRAG', detail: 'entities · Louvain communities · global search', seen: ['AmbedkarGPT'] },
      { name: 'Re-ranking', detail: 'cross-encoders over first-pass retrieval', seen: ['AmbedkarGPT'] },
      { name: 'LLM-as-judge evals', detail: 'hallucination & relevance scoring', seen: ['NeuralAudit', 'GovPreneurs'] },
      { name: 'Grounded generation', detail: 'citations, refusals, nothing invented', seen: ['AmbedkarGPT', 'Flowline'] },
      { name: 'Cost & latency accounting', detail: 'tokens, dollars and ms per call', seen: ['NeuralAudit', 'Flowline'] },
    ],
  },
  {
    title: 'Models & Fine-tuning',
    tagline:
      "When an API call isn't enough: adapting open-weight and domain-specific models, and serving them efficiently.",
    skills: [
      { name: 'Fine-tuning', detail: 'QLoRA on open weights · domain models', seen: ['GENESIS'] },
      { name: 'Genomic foundation models', detail: 'HyenaDNA on DNA sequences', seen: ['GENESIS'] },
      { name: 'PyTorch → ONNX Runtime', detail: 'train in PyTorch, serve it fast', seen: ['GENESIS', 'CSQP'] },
      { name: 'Local & air-gapped LLMs', detail: 'Ollama · data never leaves the machine', seen: ['GovPreneurs', 'AmbedkarGPT'] },
      { name: 'Computer vision', detail: 'OpenCV tracking with occlusion handling', seen: ['CSQP'] },
      { name: 'Classical ML at scale', detail: 'XGBoost on 6.3M transactions', seen: ['Fraud Detection', 'Sabudh'] },
    ],
  },
  {
    title: 'Production Backend',
    tagline:
      'The half that makes AI dependable: fast APIs, streaming, retries, containers, logs, and tests that run on every change.',
    skills: [
      {
        name: 'FastAPI services',
        detail: 'async Python APIs, typed end to end',
        seen: ['Flowline', 'Veritas', 'GovPreneurs', 'WebForge', 'AmbedkarGPT', 'Vikara', 'Tritone'],
      },
      { name: 'Streaming', detail: 'Server-Sent Events · WebRTC', seen: ['Flowline', 'Vikara'] },
      { name: 'Resilience', detail: 'retries · backoff · circuit breakers', seen: ['Flowline'] },
      { name: 'Containers', detail: 'Docker · Swarm · self-healing services', seen: ['Eidolon', 'GENESIS', 'Veritas'] },
      { name: 'Observability', detail: 'ELK · run logs · real-time alerting', seen: ['Eidolon', 'Flowline'] },
      { name: 'Data pipelines', detail: 'ETL over multi-GB datasets', seen: ['Tritone', 'GovPreneurs'] },
    ],
  },
]

/** Every skill in order, with its group number: 24 in all. */
export const ALL_SKILLS = SKILL_GROUPS.flatMap((g, group) => g.skills.map((skill) => ({ ...skill, group })))