import { Tooltip as HeroTooltip } from '@heroui/react'
import type { ReactNode } from 'react'

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
type TooltipTrigger = 'hover' | 'focus'

type TooltipProps = {
  content: ReactNode
  children: ReactNode
  placement?: TooltipPlacement
  showArrow?: boolean
  offset?: number
  delay?: number
  closeDelay?: number
  trigger?: TooltipTrigger
  isDisabled?: boolean
  className?: string
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  showArrow = false,
  offset,
  delay,
  closeDelay,
  trigger,
  isDisabled,
  className,
}: TooltipProps) {
  return (
    <HeroTooltip
      delay={delay}
      closeDelay={closeDelay}
      trigger={trigger}
      isDisabled={isDisabled}
    >
      {children}
      <HeroTooltip.Content
        placement={placement}
        showArrow={showArrow}
        offset={offset}
        className={className}
      >
        {showArrow && <HeroTooltip.Arrow />}
        {content}
      </HeroTooltip.Content>
    </HeroTooltip>
  )
}
