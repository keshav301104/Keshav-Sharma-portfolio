import Interface from './components/Interface'

export default function Home() {
  return (
    <main className="relative w-full min-h-screen">
      
      {/* 1. BACKGROUND VIDEO */}
      <div className="fixed top-0 left-0 w-full h-full z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-50 grayscale"
        >
          {/* MAKE SURE YOU PUT A VIDEO FILE NAMED 'background.mp4' IN 'public/' FOLDER */}
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* 2. THE INTERFACE */}
      <Interface />
      
    </main>
  )
}