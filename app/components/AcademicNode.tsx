'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crosshair, Fingerprint, LocateFixed, Network } from 'lucide-react'

// --- Hexadecimal Memory Stream (Optimized) ---
const HexStream = ({ active }: { active: boolean }) => {
  const [hex, setHex] = useState("0x0000")
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setHex(`0x${Math.floor(Math.random() * 16777215).toString(16).padStart(4, '0').toUpperCase()}`)
    }, 150)
    return () => clearInterval(interval)
  }, [active])
  return <span className="text-[#565f89] font-mono text-[10px] w-12 inline-block">{hex}</span>
}

// --- GPU-Accelerated Tensor Graph ---
const ActiveGraph = ({ active }: { active: boolean }) => {
  return (
    <div className="flex items-end gap-[2px] h-8 opacity-70">
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          // OPTIMIZATION: Using scaleY instead of height for GPU acceleration
          animate={{ scaleY: active ? [0.2, 1, 0.2] : 0.2 }}
          transition={{ 
            // OPTIMIZATION: Removed Math.random() inside render to prevent memory thrashing
            duration: 1 + (i % 3) * 0.4, 
            repeat: Infinity, 
            delay: (i % 4) * 0.2, 
            ease: "easeInOut" 
          }}
          className="w-1.5 bg-[#7aa2f7] rounded-t-sm origin-bottom"
          style={{ 
            backgroundColor: i % 4 === 0 ? '#bb9af7' : i % 3 === 0 ? '#9ece6a' : '#7aa2f7',
            willChange: "transform" 
          }}
        />
      ))}
    </div>
  )
}

// --- Rapid Flashing Data Matrix ---
const DataMatrix = ({ active }: { active: boolean }) => {
  const [blocks, setBlocks] = useState<boolean[]>(Array(12).fill(false))
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setBlocks(prev => prev.map(() => Math.random() > 0.5))
    }, 150)
    return () => clearInterval(interval)
  }, [active])

  return (
    <div className="grid grid-cols-4 gap-1 w-16">
      {blocks.map((isActive, i) => (
        <div key={i} className={`h-1.5 w-full transition-colors duration-75 ${isActive ? 'bg-[#00f0ff] shadow-[0_0_5px_#00f0ff]' : 'bg-[#00f0ff]/10'}`} />
      ))}
    </div>
  )
}

export default function AcademicNode() {
  const [hasEntered, setHasEntered] = useState(false)
  const [isScanned, setIsScanned] = useState(false)

  useEffect(() => {
    if (!hasEntered) return;
    const timer = setTimeout(() => setIsScanned(true), 1200) 
    return () => clearTimeout(timer)
  }, [hasEntered])

  const clipPathStyle = {
    clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)"
  }

  return (
    <section className="relative w-full max-w-5xl mx-auto py-16 px-4 md:px-8 font-sans">
      
      <motion.div 
        onViewportEnter={() => setHasEntered(true)}
        viewport={{ once: true, amount: 0.4 }} 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="p-[1px] bg-gradient-to-br from-[#00f0ff]/40 via-transparent to-[#00f0ff]/20 relative"
        style={clipPathStyle}
      >
        <div className="w-full bg-[#050914] relative overflow-hidden flex flex-col md:flex-row h-auto min-h-[320px]" style={clipPathStyle}>
          
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

          {/* GPU ACCELERATED SCANNER LINE */}
          <AnimatePresence>
            {hasEntered && !isScanned && (
              <motion.div 
                // OPTIMIZATION: Using 'x' (translate) instead of 'left'
                initial={{ x: "-100%" }}
                animate={{ x: "1000%" }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="absolute top-0 bottom-0 w-48 bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent z-50 skew-x-[-20deg]"
                style={{ willChange: "transform" }}
              />
            )}
          </AnimatePresence>

          {/* LEFT: THE NEURAL REACTOR */}
          <div className="w-full md:w-[35%] border-b md:border-b-0 md:border-r border-[#00f0ff]/10 p-8 flex flex-col items-center justify-center relative bg-gradient-to-br from-[#00f0ff]/5 to-transparent">
            <div className="relative w-48 h-48 flex items-center justify-center">
              
              <motion.svg animate={{ rotate: hasEntered ? 360 : 0 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 w-full h-full opacity-30" style={{ willChange: "transform" }}>
                <circle cx="96" cy="96" r="90" stroke="#00f0ff" strokeWidth="1" strokeDasharray="4 8" fill="none" />
              </motion.svg>
              
              <motion.svg animate={{ rotate: hasEntered ? -360 : 0 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-2 w-[11rem] h-[11rem] opacity-60" style={{ willChange: "transform" }}>
                <circle cx="88" cy="88" r="80" stroke="#00f0ff" strokeWidth="2" strokeDasharray="60 20 10 20" fill="none" />
                <circle cx="88" cy="88" r="70" stroke="#bb9af7" strokeWidth="1" strokeDasharray="100 200" fill="none" />
              </motion.svg>

              <svg className="absolute inset-4 w-[10rem] h-[10rem] transform -rotate-90">
                <circle cx="80" cy="80" r="65" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.1" fill="none" />
                <motion.circle 
                  cx="80" cy="80" r="65" stroke="#00f0ff" strokeWidth="4" fill="none" 
                  strokeDasharray={2 * Math.PI * 65}
                  initial={{ strokeDashoffset: 2 * Math.PI * 65 }}
                  animate={{ strokeDashoffset: hasEntered ? (2 * Math.PI * 65) - ((2 * Math.PI * 65) * 0.82) : 2 * Math.PI * 65 }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                  // OPTIMIZATION: Removed CSS drop-shadow filter on moving SVG stroke
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono text-[#00f0ff] tracking-[0.2em] uppercase mb-1 opacity-80">CGPA</span>
                <span className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">8.2</span>
              </div>
            </div>

            <div className="mt-8 text-center flex flex-col items-center">
              <LocateFixed size={16} className="text-[#00f0ff] mb-2" />
              <div className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-1">Target Sector</div>
              <div className="text-sm font-bold text-white tracking-widest uppercase shadow-[#00f0ff]">DATA ANALYTICS</div>
            </div>
          </div>

          {/* RIGHT: THE DATABANK */}
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-between relative">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <Fingerprint size={16} className="text-[#00f0ff]" />
                  <span className="text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest">Credential Identified</span>
                </div>
                <DataMatrix active={hasEntered} />
              </div>

              <motion.h2 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isScanned ? 1 : 0, x: isScanned ? 0 : 20 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-3"
              >
                Computer<br/>Science <span className="text-[#00f0ff]">B.Tech</span>
              </motion.h2>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isScanned ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3 text-lg font-mono text-gray-400"
              >
                <Network size={18} className="text-[#bb9af7]" /> VIT-AP University Node
              </motion.div>
            </div>

            <div className="mt-12">
              <div className="flex justify-between items-end mb-3">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">T-Minus // 2023 - 2027</div>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: hasEntered ? 1 : 0 }} transition={{ delay: 1, repeat: Infinity, duration: 2, repeatType: "reverse" }}
                  className="text-[10px] font-mono text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/30 px-2 py-1"
                >
                  [ PHASE: FINAL_YEAR ]
                </motion.div>
              </div>

              <div className="flex gap-1 h-3 w-full">
                {[...Array(20)].map((_, i) => {
                  const isFilled = i < 16;
                  return (
                    <motion.div 
                      key={i}
                      // OPTIMIZATION: Hardware accelerated scaleY and will-change
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: hasEntered ? 1 : 0, scaleY: hasEntered ? 1 : 0 }}
                      transition={{ duration: 0.2, delay: 0.5 + (i * 0.05) }}
                      className={`flex-1 origin-bottom ${isFilled ? 'bg-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.4)]' : 'bg-white/5 border border-white/10'}`}
                      style={{ clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)", willChange: "transform, opacity" }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-500">
                <span>MEM: <HexStream active={hasEntered} /></span>
                <ActiveGraph active={hasEntered} />
              </div>
            </div>
          </div>

          <Crosshair size={12} className="absolute top-4 right-4 text-[#00f0ff]/50" />
          <Crosshair size={12} className="absolute bottom-4 left-4 text-[#00f0ff]/50" />
        </div>
      </motion.div>
    </section>
  )
}