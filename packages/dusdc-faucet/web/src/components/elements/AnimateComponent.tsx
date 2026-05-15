import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { cnm } from '@/utils/style'

type EntryAnimation =
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'scaleIn'
  | 'slideUp'

type ExitAnimation =
  | 'fadeOut'
  | 'fadeOutUp'
  | 'fadeOutDown'
  | 'fadeOutLeft'
  | 'fadeOutRight'
  | 'scaleOut'
  | 'slideDown'

interface AnimateComponentProps {
  /** Entry animation style */
  entry?: EntryAnimation
  /** Exit animation style */
  exit?: ExitAnimation
  /** GSAP easing function */
  ease?: string
  /** Animation duration in milliseconds */
  duration?: number
  /** Animation delay in milliseconds */
  delay?: number
  /** Additional CSS classes */
  className?: string
  /** Child elements to animate */
  children: React.ReactNode
  /** Whether to trigger animation on scroll */
  onScroll?: boolean
  /** Intersection observer threshold (0 to 1) */
  threshold?: number
  /** Intersection observer root margin */
  rootMargin?: string
  /** Whether to reset animation when element leaves viewport */
  resetOnLeave?: boolean
  /** Whether to stagger children animations */
  stagger?: boolean
  /** Stagger delay between children */
  staggerDelay?: number
}

/**
 * AnimateComponent - GSAP-powered entrance and exit animations
 *
 * @example
 * // Basic usage
 * <AnimateComponent>
 *   <h1>Hello World</h1>
 * </AnimateComponent>
 *
 * @example
 * // Scroll-triggered animation
 * <AnimateComponent onScroll entry="fadeInUp" delay={200}>
 *   <Card />
 * </AnimateComponent>
 */
export default function AnimateComponent({
  entry = 'fadeInUp',
  exit = 'fadeOutDown',
  ease = 'power3.out',
  duration = 800,
  delay = 0,
  className,
  children,
  onScroll = false,
  threshold = 0.2,
  rootMargin = '-10%',
  resetOnLeave = false,
}: AnimateComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(!onScroll)
  const hasAnimated = useRef(false)

  // Convert ms to s for GSAP
  const durationInSec = duration / 1000
  const delayInSec = delay / 1000

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Immediately hide the element before it paints
    gsap.set(el, { autoAlpha: 0 })

    if (onScroll) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated.current) {
              setIsInView(true)
              if (!resetOnLeave) {
                hasAnimated.current = true
              }
            } else if (!entry.isIntersecting && resetOnLeave) {
              setIsInView(false)
              hasAnimated.current = false
            }
          })
        },
        {
          threshold,
          rootMargin,
        }
      )

      observer.observe(el)
      return () => observer.disconnect()
    }

    return undefined
  }, [onScroll, threshold, rootMargin, resetOnLeave])

  useEffect(() => {
    const el = containerRef.current
    if (!el || !isInView) return

    // Animate entry
    const [fromVars, toVars] = getEntryGSAPVars(entry)
    const tl = gsap.timeline()

    tl.fromTo(
      el,
      { ...fromVars, autoAlpha: 0 },
      {
        ...toVars,
        autoAlpha: 1,
        ease,
        duration: durationInSec,
        delay: delayInSec,
      }
    )

    // Cleanup animation on unmount
    return () => {
      if (onScroll && !resetOnLeave) return // Don't animate exit if scroll-triggered and not resetting

      const exitVars = getExitGSAPVars(exit)
      gsap.to(el, {
        ...exitVars,
        ease,
        duration: durationInSec,
        delay: delayInSec,
      })
    }
  }, [
    isInView,
    entry,
    exit,
    ease,
    durationInSec,
    delayInSec,
    onScroll,
    resetOnLeave,
  ])

  return (
    <div ref={containerRef} className={cnm(className)}>
      {children}
    </div>
  )
}

function getEntryGSAPVars(
  animation: EntryAnimation
): [gsap.TweenVars, gsap.TweenVars] {
  const animations: Record<EntryAnimation, [gsap.TweenVars, gsap.TweenVars]> = {
    fadeIn: [{ opacity: 0 }, { opacity: 1 }],
    fadeInUp: [{ y: 40, opacity: 0 }, { y: 0, opacity: 1 }],
    fadeInDown: [{ y: -40, opacity: 0 }, { y: 0, opacity: 1 }],
    fadeInLeft: [{ x: -40, opacity: 0 }, { x: 0, opacity: 1 }],
    fadeInRight: [{ x: 40, opacity: 0 }, { x: 0, opacity: 1 }],
    scaleIn: [{ scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1 }],
    slideUp: [{ y: 60, opacity: 0 }, { y: 0, opacity: 1 }],
  }

  return animations[animation] || animations.fadeInUp
}

function getExitGSAPVars(animation: ExitAnimation): gsap.TweenVars {
  const animations: Record<ExitAnimation, gsap.TweenVars> = {
    fadeOut: { opacity: 0 },
    fadeOutUp: { y: -40, opacity: 0 },
    fadeOutDown: { y: 40, opacity: 0 },
    fadeOutLeft: { x: -40, opacity: 0 },
    fadeOutRight: { x: 40, opacity: 0 },
    scaleOut: { scale: 0.9, opacity: 0 },
    slideDown: { y: 60, opacity: 0 },
  }

  return animations[animation] || animations.fadeOutDown
}
