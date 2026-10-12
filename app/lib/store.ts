import { create } from 'zustand'

/**
 * The single shared "brain" of the scroll story.
 *
 * - progress: how far through each chapter the visitor is (0 = just entered, 1 = finished)
 * - active:   which chapter is on screen right now
 * - global:   how far through the whole page (0 → 1), used by the cosmic clock HUD
 *
 * The 3D scene reads these values every frame with `useCosmos.getState()`,
 * which does NOT trigger React re-renders, so the animation stays at 60fps.
 */
type CosmosState = {
  progress: Record<string, number>
  active: string
  global: number
  setProgress: (id: string, value: number) => void
  setActive: (id: string) => void
  setGlobal: (value: number) => void
}

export const useCosmos = create<CosmosState>((set) => ({
  progress: {},
  active: 'origin',
  global: 0,
  setProgress: (id, value) =>
    set((state) => ({ progress: { ...state.progress, [id]: value } })),
  setActive: (id) => set({ active: id }),
  setGlobal: (value) => set({ global: value }),
}))

/** Read one chapter's progress without subscribing (safe inside useFrame). */
export const getChapterProgress = (id: string) =>
  useCosmos.getState().progress[id] ?? 0