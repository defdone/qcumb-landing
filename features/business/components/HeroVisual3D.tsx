"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useAnimations, useGLTF } from "@react-three/drei"
import { useEffect, useMemo, useRef, useState, Suspense } from "react"
import * as THREE from "three"

type HeroVisual3DProps = {
  sectionRef: React.RefObject<HTMLElement>
  mode?: "scroll" | "auto"
}

function useScrollProgress(sectionRef: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0

    const update = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const viewHeight = window.innerHeight || 1
      const total = rect.height + viewHeight
      const current = viewHeight - rect.top
      const next = Math.min(1, Math.max(0, current / total))
      setProgress(next)
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [sectionRef])

  return progress
}

function HeroModel({ scroll, mode }: { scroll: number; mode: "scroll" | "auto" }) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF("/models/landing-hero.glb")
  const { actions, names, mixer } = useAnimations(animations, group)

  const clip = useMemo(() => {
    if (!names.length) return undefined
    const action = actions[names[0]]
    return action?.getClip()
  }, [actions, names])

  useEffect(() => {
    if (!names.length) return
    const action = actions[names[0]]
    if (!action) return
    action.reset()
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.clampWhenFinished = false
    action.play()
    action.paused = mode === "scroll"
    action.enabled = true
  }, [actions, names, mode])

  useFrame((_, delta) => {
    const target = group.current
    if (!target) return
    if (clip) {
      if (mode === "auto") {
        mixer.update(delta)
      } else {
        mixer.setTime(scroll * clip.duration)
      }
      return
    }
    // Fallback: simple transform when GLB has no embedded animation
    if (mode === "auto") {
      target.rotation.y += delta * 0.6
      target.position.y = Math.sin(performance.now() * 0.001) * 0.05
      return
    }
    target.rotation.y = scroll * Math.PI * 2
    target.position.y = scroll * 0.2
  })

  return <primitive ref={group} object={scene} />
}

export default function HeroVisual3D({ sectionRef, mode = "auto" }: HeroVisual3DProps) {
  const scroll = useScrollProgress(sectionRef)

  return (
    <div className="landing-hero-visual-canvas">
      <Canvas camera={{ position: [0, 0, 4], fov: 35 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 4, 4]} intensity={1} />
        <Suspense fallback={null}>
          <HeroModel scroll={scroll} mode={mode} />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload("/models/landing-hero.glb")
