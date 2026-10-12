'use client'
import { Canvas } from '@react-three/fiber'
import BigBang from './BigBang'
import PrimordialPlasma from './PrimordialPlasma'
import Starfield from './Starfield'
import MilkyWay from './MilkyWay'
import Director from './Director'
import DustDisc from './DustDisc'
import World from './World'
import Moons from './Moons'
import BlackHole from './BlackHole'
import Wormhole from './Wormhole'
import Warmup from './Warmup'
import Galaxy from './Galaxy'
import Effects from './Effects'

/**
 * The universe. One full-screen WebGL canvas fixed behind the page.
 * The page scrolls over it, and each scene inside reads scroll
 * progress from the store to decide what to show.
 *
 * Drawing order: the Milky Way → distant stars → the Big Bang → the young star system
 * → the galaxy → the black hole (covers the screen in Chapter V) → the wormhole (Chapters VII–VIII)
 * → plasma fog → lens effects.
 * Director moves the camera from Chapter III on.
 */
export default function CosmosCanvas() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 50, near: 0.1, far: 250 }}
        // Sharp on retina screens, capped so the ray-traced chapters stay smooth. The setting never
        // changes while you scroll (changing it mid-scroll rebuilds the whole picture, which stutters).
        dpr={[1, 1.5]}
        onCreated={({ size, setDpr }) => size.width < 768 && setDpr(1.25)} // phones: a little lighter
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#000004']} />
        <Director />
        <MilkyWay />
        <Starfield />
        <BigBang />
        <DustDisc />
        <World />
        <Moons />
        <Galaxy />
        <BlackHole />
        <Wormhole />
        <PrimordialPlasma />
        <Effects />
        <Warmup />
      </Canvas>
    </div>
  )
}