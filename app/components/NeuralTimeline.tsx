'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'framer-motion'
import { Terminal, Code2, Database, ChevronRight, FileJson, FileCode2, Play, Search, ShieldCheck, FileText, ExternalLink } from 'lucide-react'

// --- SCRAMBLE TEXT COMPONENT ---
const chars = "!<>-_\\/[]{}—=+*^?#________"
const ScrambleText = ({ text, start }: { text: string, start: boolean }) => {
  const [displayText, setDisplayText] = useState(text)

  useEffect(() => {
    if (!start) {
      setDisplayText(text.replace(/[a-zA-Z0-9]/g, '_'))
      return;
    }
    let iteration = 0;
    let interval: any = null;

    clearInterval(interval);
    interval = setInterval(() => {
      setDisplayText(text.split("").map((letter, index) => {
        if(index < iteration) return text[index];
        return chars[Math.floor(Math.random() * chars.length)]
      }).join(""))
      
      if(iteration >= text.length) clearInterval(interval);
      iteration += 1 / 2; 
    }, 30);

    return () => clearInterval(interval);
  }, [text, start])

  return <span>{displayText}</span>
}

// --- DATA PAYLOAD ---
const experiences = {
  tritone: {
    id: "tritone",
    filename: "tritone_analytics.py",
    icon: <FileCode2 size={16} className="text-[#7aa2f7]" />,
    role: "AI / Data Engineer Intern",
    date: "Mar 2026 - Present",
    command: "python deploy_agents.py --env production",
    output: "Success. 4 Agents deployed. RAG Pipeline Active. Latency: 12ms.",
    attachment: {
      file: "tritone-lor.pdf",
      label: "tritone_lor_signed.pdf",
      size: "1.2 MB // RSA-2048 Encrypted"
    },
    lines: [
      <><span className="text-[#bb9af7]">class</span> <span className="text-[#7aa2f7] drop-shadow-[0_0_8px_rgba(122,162,247,0.4)]">TritoneAnalytics</span>(<span className="text-[#e0af68]">Experience</span>):</>,
      <>{'    '}<span className="text-[#bb9af7]">def</span> <span className="text-[#7aa2f7]">__init__</span>(<span className="text-[#f7768e]">self</span>):</>,
      <>{'        '}<span className="text-[#f7768e]">self</span>.role = <span className="text-[#9ece6a]">"AI/Data Engineer Intern"</span></>,
      <>{'        '}<span className="text-[#f7768e]">self</span>.stack = [<span className="text-[#9ece6a]">"LangGraph"</span>, <span className="text-[#9ece6a]">"FastAPI"</span>, <span className="text-[#9ece6a]">"VectorDBs"</span>, <span className="text-[#9ece6a]">"OpenAI"</span>]</>,
      <></>,
      <>{'    '}<span className="text-[#bb9af7]">def</span> <span className="text-[#7aa2f7]">execute_pipeline</span>(<span className="text-[#f7768e]">self</span>):</>,
      <>{'        '}<span className="text-[#bb9af7]">return</span> [</>,
      <>{'            '}<span className="text-[#9ece6a]">"Architected enterprise LLM pipelines to normalize massive unstructured datasets."</span>,</>,
      <>{'            '}<span className="text-[#9ece6a]">"Deployed autonomous agent workflows, drastically reducing manual validation."</span>,</>,
      <>{'            '}<span className="text-[#9ece6a]">"Integrated advanced RAG architecture with Vector DBs for low-latency search."</span>,</>,
      <>{'            '}<span className="text-[#9ece6a]">"Engineered highly scalable FastAPI endpoints for high-volume data ingestion."</span></>,
      <>{'        '}]</>
    ]
  },
  sabudh: {
    id: "sabudh",
    filename: "sabudh_foundation.json",
    icon: <FileJson size={16} className="text-[#9ece6a]" />,
    role: "AI / Data Science Intern",
    date: "Jan 2025 - Apr 2025",
    command: "cat sabudh_foundation.json | jq '.metrics'",
    output: "Aggregating 100K+ rows... Feature engineering complete. Pipeline optimized.",
    attachment: null,
    lines: [
      <>{'{'}</>,
      <>{'  '}<span className="text-[#7aa2f7]">"role"</span>: <span className="text-[#9ece6a]">"AI/Data Science Intern"</span>,</>,
      <>{'  '}<span className="text-[#7aa2f7]">"organization"</span>: <span className="text-[#9ece6a]">"Sabudh Foundation"</span>,</>,
      <>{'  '}<span className="text-[#7aa2f7]">"stack"</span>: [<span className="text-[#9ece6a]">"TensorFlow"</span>, <span className="text-[#9ece6a]">"Python"</span>, <span className="text-[#9ece6a]">"Pandas"</span>, <span className="text-[#9ece6a]">"Scikit-Learn"</span>],</>,
      <>{'  '}<span className="text-[#7aa2f7]">"metrics"</span>: {'{'} <span className="text-[#7aa2f7]">"dataset"</span>: <span className="text-[#e0af68]">"100K+"</span>, <span className="text-[#7aa2f7]">"effort_reduction"</span>: <span className="text-[#e0af68]">"30%"</span> {'}'},</>,
      <>{'  '}<span className="text-[#7aa2f7]">"impact"</span>: [</>,
      <>{'    '}<span className="text-[#9ece6a]">"Engineered end-to-end ML pipelines for real-world predictive modeling."</span>,</>,
      <>{'    '}<span className="text-[#9ece6a]">"Executed comprehensive feature engineering on high-dimensional datasets."</span>,</>,
      <>{'    '}<span className="text-[#9ece6a]">"Designed automated analytics dashboards, cutting manual analysis by 30%."</span></>,
      <>{'  '}]</>,
      <>{'}'}</>
    ]
  },
  seds: {
    id: "seds",
    filename: "seds_aurora.sh",
    icon: <Terminal size={16} className="text-[#bb9af7]" />,
    role: "President",
    date: "Jul 2025 - Present",
    command: "./seds_aurora.sh --init-leadership-protocol",
    output: "Success. Cross-functional teams synced. Innovation protocols engaged.",
    attachment: null,
    lines: [
      <><span className="text-[#565f89]">#!/bin/bash</span></>,
      <></>,
      <><span className="text-[#e0af68]">ROLE</span>=<span className="text-[#9ece6a]">"President"</span></>,
      <><span className="text-[#e0af68]">ORG</span>=<span className="text-[#9ece6a]">"SEDS VIT-AP"</span></>,
      <></>,
      <><span className="text-[#bb9af7]">function</span> <span className="text-[#7aa2f7] drop-shadow-[0_0_8px_rgba(122,162,247,0.4)]">execute_directives</span>() {'{'}</>,
      <>{'  '}sys.deploy --initiative <span className="text-[#9ece6a]">"Cross-Functional Innovation"</span></>,
      <>{'  '}<span className="text-[#bb9af7]">for</span> team <span className="text-[#bb9af7]">in</span> <span className="text-[#9ece6a]">"Research"</span> <span className="text-[#9ece6a]">"Tech"</span> <span className="text-[#9ece6a]">"Outreach"</span> <span className="text-[#9ece6a]">"Design"</span>; <span className="text-[#bb9af7]">do</span></>,
      <>{'    '}manager.sync --team $<span className="text-[#e0af68]">team</span> --status <span className="text-[#9ece6a]">"Optimized"</span></>,
      <>{'  '}<span className="text-[#bb9af7]">done</span></>,
      <>{'  '}<span className="text-[#7dcfff]">echo</span> <span className="text-[#9ece6a]">"Orchestrated large-scale engineering workshops and hackathons."</span></>,
      <>{'}'}</>,
      <>execute_directives</>
    ]
  }
}

const typeWriterVariant = {
  hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
  visible: { 
    clipPath: "inset(0 0% 0 0)", 
    opacity: 1, 
    transition: { duration: 0.3, ease: "linear" as const } 
  }
}

export default function NeuralTimeline() {
  const [activeTab, setActiveTab] = useState<keyof typeof experiences>('tritone')
  const [terminalState, setTerminalState] = useState(0) 
  const [hasEntered, setHasEntered] = useState(false) 
  
  const activeData = experiences[activeTab]
  const containerRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"])
  
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"])
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255, 255, 255, 0.08), transparent 40%)`

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    x.set((e.clientX - rect.left) / width - 0.5)
    y.set((e.clientY - rect.top) / height - 0.5)
  }

  const handleMouseLeave = () => { x.set(0); y.set(0) }

  useEffect(() => {
    if (!hasEntered) return;
    setTerminalState(0)
    const t1 = setTimeout(() => setTerminalState(1), 300) 
    const t2 = setTimeout(() => setTerminalState(2), 600) 
    const t3 = setTimeout(() => setTerminalState(3), 900) 
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }
  }, [activeTab, hasEntered])

  return (
    <section className="relative w-full max-w-6xl mx-auto py-24 px-4 md:px-8 font-sans selection:bg-[#364A82] perspective-[2000px]">
      
      <div className="mb-10 pl-4 md:pl-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight flex items-center gap-4">
          <Code2 className="text-[#7aa2f7]" size={36} />
          Experience<span className="text-[#565f89]">.ts</span>
        </h2>
        <p className="text-[#7dcfff] font-mono text-sm mt-3 flex items-center gap-2">
          <ChevronRight size={14}/> ~/keshav301104/career/history
        </p>
      </div>

      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onViewportEnter={() => setHasEntered(true)} 
        viewport={{ once: true, amount: 0.3 }} 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full flex justify-center items-center relative z-10"
      >
        <div 
          className="w-full max-w-5xl bg-[#1a1b26]/95 backdrop-blur-3xl border border-[#292e42] rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8),_0_0_40px_rgba(122,162,247,0.1)] flex flex-col h-[650px] relative"
          style={{ transform: "translateZ(40px)" }} 
        >
          <motion.div style={{ background: glareBackground }} className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay" />
          
          <div className="h-10 bg-[#111116] border-b border-[#292e42] flex items-center px-4 shrink-0 z-20">
            <div className="flex gap-2 w-20">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_5px_#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_5px_#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_5px_#27c93f]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 bg-[#1a1b26] border border-[#292e42] px-3 py-1 rounded-md text-[10px] text-[#565f89] font-mono">
                <Search size={10} /> keshav-portfolio — {activeData.filename}
              </div>
            </div>
            <div className="w-20" /> 
          </div>

          <div className="flex flex-1 overflow-hidden relative">
            
            {/* SIDEBAR */}
            <div className="w-full md:w-56 bg-[#16161e]/90 border-r border-[#292e42] flex flex-col shrink-0 z-20">
              <div className="px-4 py-3 text-[10px] font-mono text-[#565f89] uppercase tracking-widest border-b border-[#292e42]">
                Explorer
              </div>
              <div className="flex flex-col py-2 relative">
                {(Object.keys(experiences) as Array<keyof typeof experiences>).map((key) => {
                  const exp = experiences[key]
                  const isActive = activeTab === key
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-xs font-mono text-left relative z-10 transition-colors ${
                        isActive ? 'text-[#c0caf5]' : 'text-[#565f89] hover:text-[#a9b1d6]'
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="sidebar-active" 
                          className="absolute inset-0 bg-gradient-to-r from-[#7aa2f7]/10 to-transparent border-l-2 border-[#7aa2f7] z-[-1]" 
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      {exp.icon}
                      <span className="truncate">{exp.filename}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative bg-transparent">
              {/* File Tabs */}
              <div className="flex bg-[#16161e]/90 border-b border-[#292e42] justify-between items-center pr-4 shrink-0">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1b26]/90 border-t-2 border-[#7aa2f7] text-xs font-mono text-[#c0caf5]">
                  {activeData.icon}
                  {activeData.filename}
                </div>
                <div className="flex items-center gap-2 text-[#565f89] hover:text-[#9ece6a] cursor-pointer transition-colors hidden md:flex">
                  <Play size={12} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Run</span>
                </div>
              </div>
              
              {/* Breadcrumbs */}
              <div className="px-4 py-1.5 border-b border-[#292e42] flex items-center text-[10px] font-mono text-[#565f89] bg-[#1a1b26]/50 shrink-0">
                keshav-portfolio <ChevronRight size={10} className="mx-1"/> {activeData.filename} <ChevronRight size={10} className="mx-1"/> {activeData.id}
              </div>

              {/* --- NEW: THE SLEEK IDE NOTIFICATION BANNER FOR THE LOR --- */}
              <AnimatePresence mode="wait">
                {activeData.attachment && hasEntered && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-2 border-b border-[#292e42] bg-[#7aa2f7]/5 flex items-center justify-between text-xs font-mono shrink-0 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-[#9ece6a]">
                      <ShieldCheck size={14}/>
                      <span className="text-[#565f89]">
                        System verified external asset: <span className="text-[#c0caf5] font-bold">{activeData.attachment.label}</span>
                      </span>
                    </div>
                    <a 
                      href={`/${activeData.attachment.file}`} 
                      target="_blank"
                      className="flex items-center gap-2 px-3 py-1 bg-[#7aa2f7]/10 text-[#7aa2f7] hover:bg-[#7aa2f7]/20 hover:text-white rounded border border-[#7aa2f7]/20 transition-colors"
                    >
                      <FileText size={12}/>
                      DECRYPT & VIEW
                      <ExternalLink size={12}/>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* -------------------------------------------------------- */}

              <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 p-4 md:p-6 font-mono text-sm leading-relaxed relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-[#292e42] flex flex-col items-end py-4 md:py-6 pr-3 text-[#3b4261] select-none text-xs hidden md:flex">
                    {[...Array(18)].map((_, i) => <div key={i}>{i + 1}</div>)}
                  </div>

                  <div className="md:ml-12 pl-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeData.id}
                        initial="hidden"
                        animate={hasEntered ? "visible" : "hidden"} 
                        exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.15 } }}
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                      >
                        {/* Clean Header Reverted back to Original */}
                        <div className="mb-4 pb-4 border-b border-[#292e42]/50">
                          <h3 className="text-2xl font-bold text-[#c0caf5] tracking-tight drop-shadow-md">
                            <ScrambleText text={activeData.role} start={hasEntered} />
                          </h3>
                          <div className="text-[#565f89] text-xs mt-1">{activeData.date}</div>
                        </div>
                        
                        <div className="text-[#c0caf5] text-[13px] leading-relaxed relative">
                          {activeData.lines.map((line, i) => (
                            <motion.div key={i} variants={typeWriterVariant} className="whitespace-pre-wrap">
                              {line || <br/>}
                            </motion.div>
                          ))}
                          <motion.span 
                            animate={{ opacity: [1, 0, 1] }} 
                            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                            className="inline-block w-2 h-4 bg-[#7aa2f7] ml-1 align-middle shadow-[0_0_8px_#7aa2f7]"
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="hidden lg:block w-16 bg-[#16161e]/50 border-l border-[#292e42] p-2 opacity-50 select-none overflow-hidden shrink-0">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeData.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-[3px]">
                      {[...Array(22)].map((_, i) => {
                        const pseudoRandomWidth = Math.max(20, (Math.abs(Math.sin(i * 12.9898)) * 100));
                        return (
                          <div 
                            key={i} 
                            className="h-[2px] rounded-full" 
                            style={{ 
                              width: `${pseudoRandomWidth}%`, 
                              backgroundColor: i % 3 === 0 ? '#7aa2f7' : i % 4 === 0 ? '#9ece6a' : '#3b4261' 
                            }} 
                          />
                        )
                      })}
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute top-4 left-0 right-0 h-20 bg-[#7aa2f7]/10 border border-[#7aa2f7]/30 rounded-sm" />
                </div>
              </div>

              <div className="h-28 bg-[#111116] border-t border-[#292e42] p-3 font-mono text-xs flex flex-col justify-center shrink-0 relative z-20">
                <AnimatePresence mode="wait">
                  <motion.div key={activeData.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-[#a9b1d6] flex items-center gap-2 mb-1">
                      <span className="text-[#9ece6a]">keshav@sys</span>:<span className="text-[#7aa2f7]">~</span>$ 
                      <motion.span 
                        initial={{ clipPath: "inset(0 100% 0 0)" }}
                        animate={{ clipPath: hasEntered ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                        transition={{ duration: 0.3, ease: "linear" }}
                        className="text-[#c0caf5] ml-1"
                      >
                        {activeData.command}
                      </motion.span>
                    </div>

                    <div className="flex items-start gap-2 h-8">
                      <ChevronRight size={10} className="text-[#565f89] mt-0.5 shrink-0" />
                      
                      {terminalState === 0 && <span className="text-[#565f89]">Waiting for execution...</span>}
                      {terminalState === 1 && <span className="text-[#e0af68]">Initializing deployment environment...</span>}
                      {terminalState === 2 && <span className="text-[#7dcfff]">Resolving dependencies [||||||||||] 100%</span>}
                      {terminalState === 3 && (
                        <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-[#9ece6a]">
                          {activeData.output}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="h-6 bg-[#7aa2f7] flex items-center justify-between px-3 text-[10px] font-mono text-[#111116] font-bold shrink-0 z-20">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Database size={10}/> main*</span>
                  <span className="hidden md:inline uppercase">{activeData.id}_ENV</span>
                </div>
                <div className="flex items-center gap-4 hidden md:flex">
                  <span className="flex items-center gap-1">Ln 1, Col 1</span>
                  <span>UTF-8</span>
                  <span>Prettier: ✓</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}