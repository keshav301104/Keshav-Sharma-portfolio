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
import Resolution from './Resolution'
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
        dpr={[1, 1.75]} // sharp on retina screens, capped so phones don't overheat
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#000004']} />
        <Resolution />
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
      </Canvas>
    </div>
  )
}