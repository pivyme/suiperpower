import { motion } from 'motion/react'
import { GrainGradient } from '@paper-design/shaders-react'
import { cnm } from '@/utils/style'

// Full-bleed animated backdrop. The caller owns placement so it can be used as a panel texture.
export function GrainBackdrop({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.9 }}
      transition={{ duration: 1.2, delay: 1.5, ease: 'easeOut' }}
      className={cnm('pointer-events-none absolute inset-0', className)}
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
