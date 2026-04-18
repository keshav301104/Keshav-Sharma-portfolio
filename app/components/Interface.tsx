'use client'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Github, Linkedin, Mail, ExternalLink, Download, Award, Server, Cpu, Brain, Briefcase, FileText, CheckCircle, Code, Layers, Database, Sparkles, FileCode, Terminal, Calendar, Building2, Rocket, Globe, Zap, Activity } from 'lucide-react'
import { brain } from '../data/brain'
import { useState, useRef, useEffect } from 'react'
import NeuralTimeline from './NeuralTimeline'
import AcademicNode from './AcademicNode'

export default function Interface() {
  const { profile, education, skills, projects, leadership, certs, experience } = brain

  // Animation Variants
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 space-y-32 text-white perspective-1000"
    >
      
      {/* 1. HERO SECTION */}
      <motion.section variants={item} className="min-h-[90vh] flex flex-col items-center justify-center text-center w-full">
        
        {/* Profile & Name Group */}
        <div className="flex flex-col items-center mb-12">
            <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative w-40 h-40 mb-8 rounded-full p-1 bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-500 shadow-[0_0_50px_rgba(59,130,246,0.5)]"
            >
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 relative z-10 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                    <img 
                        src="/me_3.jpeg" 
                        alt="Keshav Sharma" 
                        className="object-cover object-top w-full h-full relative z-20"
                    />
                </div>
            </motion.div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px] tracking-[0.2em] backdrop-blur-md uppercase">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                System Online // 2026
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 animate-gradient-x pb-2">
                {profile.name}
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-400 font-light tracking-wide mt-3">
                {profile.role}
            </h2>
        </div>

        {/* 2. THE SUMMARY (With Balanced, Continuous Glow) */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto text-left relative group"
        >
            {/* Background Glow Effect - UPDATED ANIMATION */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-2xl blur-xl opacity-30 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]" />

            <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
                
                {/* Header Line */}
                <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
                    <div className="relative w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#a855f7_50%,#10b981_100%)] animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-[2px] bg-black rounded-[10px] flex items-center justify-center z-10">
                             <Cpu size={18} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">System Context</div>
                        <div className="font-bold text-sm text-gray-200 tracking-wide">PROFESSIONAL SUMMARY</div>
                    </div>
                    <div className="ml-auto flex gap-1.5 opacity-30">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                </div>

                {/* The Content */}
                <p className="text-gray-400 leading-relaxed text-base md:text-lg">
  I engineer intelligence, not just wrappers. As a <strong className="text-white font-semibold">NASA Space Apps Global Winner</strong>, my focus is bridging the gap between experimental research and resilient, <strong className="text-white font-semibold">production-grade infrastructure</strong>. My work spans <span className="text-[#bb9af7]">autonomous multi-agent systems</span>, <span className="text-[#9ece6a]">semantic RAG pipelines</span>, and <span className="text-[#7aa2f7]">scalable backend design</span>. I specialize in translating ambiguous, real-world problems into deterministic architectures—prioritizing evaluation, reliability, and execution over industry hype.
</p>
            </div>
        </motion.div>

        {/* Resume Buttons - FIXED SOFTWARE LOGO */}
        <div className="flex flex-wrap justify-center gap-6 mt-16">
            <CyberResumeButton 
                href="/resume-ai.pdf" 
                label="AI ENGINEER" 
                sub="RESUME_V4.0" 
                color="purple" 
                icon={<Brain size={20}/>} 
            />
            <CyberResumeButton 
                href="/resume-ds.pdf" 
                label="DATA SCIENTIST" 
                sub="RESUME_V2.1" 
                color="emerald" 
                icon={<Cpu size={20}/>} 
            />
            {/* UPDATED: Changed Terminal to Code Icon */}
            <CyberResumeButton 
                href="/resume-sde.pdf" 
                label="SOFTWARE DEV" 
                sub="RESUME_V3.5" 
                color="blue" 
                icon={<Code size={20}/>} 
            />
        </div>
        
        <div className="flex gap-4 mt-12">
            <SocialBtn icon={Github} link={profile.urls.github} />
            <SocialBtn icon={Linkedin} link={profile.urls.linkedin} />
            <SocialBtn icon={Mail} link={profile.urls.email} />
        </div>
      </motion.section>


      {/* 2. OPERATIONAL TIMELINE (God-Level Experience) */}
      <NeuralTimeline />

      {/* 2.5. ACADEMIC AUTHORIZATION (God-Level Education Module) */}
      <AcademicNode />

      {/* 3. TECHNICAL ARSENAL */}
      <section>
        <motion.h3 variants={item} className="text-3xl font-bold mb-10 text-center">Technical Ecosystem</motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpotlightCard color="purple">
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <Brain className="text-purple-400" />
                <h4 className="text-xl font-bold text-gray-200">Generative AI</h4>
            </div>
            <div className="flex flex-wrap gap-2 relative z-10">
                {skills[0].tools.map((tool: string) => <TechBadge key={tool}>{tool}</TechBadge>)}
            </div>
          </SpotlightCard>

          <SpotlightCard color="emerald">
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <Cpu className="text-emerald-400" />
                <h4 className="text-xl font-bold text-gray-200">Data Science</h4>
            </div>
            <div className="flex flex-wrap gap-2 relative z-10">
                {skills[1].tools.map((tool: string) => <TechBadge key={tool}>{tool}</TechBadge>)}
            </div>
          </SpotlightCard>

          <SpotlightCard color="blue">
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <Server className="text-blue-400" />
                <h4 className="text-xl font-bold text-gray-200">Software Dev</h4>
            </div>
            <div className="flex flex-wrap gap-2 relative z-10">
                {skills[2].tools.map((tool: string) => <TechBadge key={tool}>{tool}</TechBadge>)}
            </div>
          </SpotlightCard>
        </div>
      </section>


      {/* 4. PROJECTS */}
      <section className="space-y-16">
        <motion.div variants={item} className="flex items-center gap-3 text-3xl font-bold">
            <Layers className="text-white" /> Mission Logs // Projects
        </motion.div>
        
        <div>
            <h4 className="text-xl font-mono text-purple-400 mb-6 flex items-center gap-2">
                <Sparkles size={18}/> // GENERATIVE AI & AGENTS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.ai.map((p: any) => <NeonProjectCard key={p.id} project={p} color="purple" />)}
            </div>
        </div>

        <div>
            <h4 className="text-xl font-mono text-emerald-400 mb-6 flex items-center gap-2">
                <Database size={18}/> // DATA SCIENCE & ANALYTICS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.ds.map((p: any) => <NeonProjectCard key={p.id} project={p} color="emerald" />)}
            </div>
        </div>

        <div>
            <h4 className="text-xl font-mono text-blue-400 mb-6 flex items-center gap-2">
                <Server size={18}/> // FULL STACK & SYSTEMS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.web.map((p: any) => <NeonProjectCard key={p.id} project={p} color="blue" />)}
            </div>
        </div>
      </section>

      {/* 5. CERTIFICATIONS */}
      <section className="space-y-8">
          <SpotlightCard color="green" className="p-8">
            <div className="flex items-center justify-center gap-3 mb-10">
                <CheckCircle className="text-green-400" size={24} />
                <h3 className="text-3xl font-bold text-white tracking-tight">Verified Credentials</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {certs.map((c: any, i: number) => (
                    <CertChip key={i} cert={c} />
                ))}
            </div>

            <div className="flex justify-center mt-10">
                <MagneticWrapper>
                    <a href="/certificates.pdf" download className="group flex items-center gap-3 px-8 py-3 bg-black/40 border border-white/10 rounded-full hover:bg-green-500/10 hover:border-green-500/50 transition-all cursor-pointer">
                        <FileText size={18} className="text-gray-400 group-hover:text-green-400 transition-colors" />
                        <span className="text-xs font-bold text-gray-300 group-hover:text-white tracking-widest uppercase">
                            DOWNLOAD VERIFIED DOSSIER
                        </span>
                        <Download size={16} className="text-gray-500 group-hover:text-green-400 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all" />
                    </a>
                </MagneticWrapper>
            </div>
          </SpotlightCard>
      </section>

      <footer className="pt-20 pb-10 border-t border-white/5 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center opacity-50 text-xs font-mono">
            <p>© 2026 KESHAV SHARMA</p>
            <div className="flex gap-6 mt-4 md:mt-0">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> SYSTEM ONLINE</span>
                <span>LATENCY: 12ms</span>
                <span>LOC: INDIA</span>
            </div>
        </div>
      </footer>
    </motion.div>
  )
}

// === COMPONENT: CERT CHIP (Verified Badge Version) ===
function CertChip({ cert }: any) {
    return (
        <motion.div 
            whileHover={{ 
                y: -5, 
                borderColor: "rgba(34, 197, 94, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.08)"
            }}
            className="flex flex-col justify-between p-5 rounded-2xl border border-white/5 bg-white/5 transition-all duration-300 group cursor-default h-full"
        >
            <div className="flex flex-col gap-3 mb-4">
                <div className="self-start p-2.5 bg-black/40 rounded-xl text-green-400 border border-white/5 group-hover:text-white group-hover:bg-green-600 transition-all duration-300 shadow-lg">
                    <Award size={20} />
                </div>
                <div>
                    <h4 className="text-base font-bold text-gray-200 group-hover:text-white transition-colors leading-snug min-h-[40px]">
                        {cert.name}
                    </h4>
                    {/* Issuer Badge */}
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold tracking-wide text-gray-400 group-hover:bg-green-500/10 group-hover:text-green-400 group-hover:border-green-500/20 transition-all">
                        <Building2 size={10} />
                        <span>{cert.issuer.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-auto">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono group-hover:text-gray-300 transition-colors">
                    <Calendar size={10} />
                    <span>{cert.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono bg-black/30 px-2 py-1 rounded-md border border-white/5 text-gray-600 group-hover:text-green-400 group-hover:border-green-500/30 transition-all">
                    <Terminal size={9} />
                    <span className="tracking-wide">{cert.id}</span>
                </div>
            </div>
        </motion.div>
    )
}

// === COMPONENT: NEON PROJECT CARD ===
function NeonProjectCard({ project, color }: any) {
    const colorMap: any = {
        purple: "hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
        emerald: "hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
        blue: "hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
    }
    const badgeColor: any = {
        purple: "text-purple-300 border-purple-500/20 bg-purple-500/10",
        emerald: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10",
        blue: "text-blue-300 border-blue-500/20 bg-blue-500/10"
    }
    return (
        <motion.a 
          href={project.link}
          target="_blank"
          whileHover={{ y: -10, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative block glass-panel rounded-2xl overflow-hidden group border border-white/5 p-8 transition-all duration-300 ${colorMap[color]}`}
        >
             <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" 
                  style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
             />
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold text-white group-hover:text-white transition-colors flex items-center gap-2">
                        {project.label} <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                    </h4>
                    <span className="text-[10px] font-mono border border-white/10 px-2 py-1 rounded text-gray-500 group-hover:border-white/30 transition-colors">
                        {project.id}
                    </span>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed text-sm h-16 overflow-hidden group-hover:text-gray-200 transition-colors">
                    {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tech.map((t: string) => (
                        <span key={t} className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors ${badgeColor[color]}`}>
                            {t}
                        </span>
                    ))}
                </div>
             </div>
        </motion.a>
    )
}

function SpotlightCard({ children, color = "white", className = "" }: any) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove({ currentTarget, clientX, clientY }: any) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }
  const colorMap: any = {
    purple: "rgba(168, 85, 247, 0.15)",
    emerald: "rgba(16, 185, 129, 0.15)",
    blue: "rgba(59, 130, 246, 0.15)",
    green: "rgba(34, 197, 94, 0.15)",
    yellow: "rgba(234, 179, 8, 0.15)",
    white: "rgba(255, 255, 255, 0.1)"
  }
  return (
    <div
      className={`group relative border border-white/10 bg-black/50 overflow-hidden rounded-3xl ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${colorMap[color]},
              transparent 80%
            )
          `,
        }}
      />
      <div className="p-8">{children}</div>
    </div>
  );
}

function MagneticWrapper({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null); 
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouse = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.1, y: middleY * 0.1 });
    }
    const reset = () => setPosition({ x: 0, y: 0 });
    return (
        <motion.div
            ref={ref} 
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {children}
        </motion.div>
    )
}

function CyberResumeButton({ href, label, sub, color, icon }: any) {
    const colorClasses: any = {
        purple: "hover:border-purple-500/80 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
        emerald: "hover:border-emerald-500/80 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
        blue: "hover:border-blue-500/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
    }
    return (
        <motion.a 
            href={href} 
            download 
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`
                group relative flex flex-col items-start p-5 min-w-[240px]
                bg-black/40 backdrop-blur-md border border-white/10 
                rounded-xl transition-all duration-300
                ${colorClasses[color]}
            `}
        >
            <div className="flex justify-between w-full mb-3 opacity-50 group-hover:opacity-100 transition-opacity">
                {icon}
                <FileCode size={16} />
            </div>
            <div className="text-xs font-mono text-gray-500 mb-1">{sub}</div>
            <div className="font-bold text-sm tracking-wider">{label}</div>
            
            <div className="absolute inset-0 w-full h-full overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none">
                 <div className="absolute top-0 w-full h-[2px] bg-white/20 animate-scan" />
            </div>
            
            <div className="mt-3 text-[10px] font-mono opacity-0 group-hover:opacity-100 text-green-400 flex items-center gap-1">
                <Download size={10} /> CLICK TO DOWNLOAD
            </div>
        </motion.a>
    )
}

function TechBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-3 py-1 text-xs font-mono bg-black/40 border border-white/10 rounded-md text-gray-400 group-hover:text-white group-hover:border-white/30 transition-colors">
            {children}
        </span>
    )
}

function SocialBtn({ icon: Icon, link }: { icon: any, link: string }) {
    return (
        <MagneticWrapper>
            <a href={link} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white/5 rounded-full hover:bg-white hover:text-black transition-all border border-white/10">
                <Icon size={20} />
            </a>
        </MagneticWrapper>
    )
}