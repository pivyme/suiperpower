import { motion } from 'motion/react'
import { GrainGradient } from '@paper-design/shaders-react'

// Full-bleed animated backdrop. Sits behind the page body, fades in once.
export function GrainBackdrop() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.9 }}
      transition={{ duration: 1.2, delay: 1.5, ease: 'easeOut' }}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden
    >
      <GrainGradient
        width="100%"
        height="100%"
        colors={['#155dfc', '#bedbff']}
        colorBack="#000000"
        softness={0.5}
        intensity={0.1}
        noise={0.07}
        shape="wave"
        speed={0.2}
        scale={1.5}
        offsetY={0.3}
        offsetX={1}
        className="w-full h-full"
      />
    </motion.div>
  )
}
