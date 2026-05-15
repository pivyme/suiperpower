import { Card as HeroCard } from '@heroui/react'
import type { ReactNode } from 'react'

type CardVariant = 'transparent' | 'default' | 'secondary' | 'tertiary'

type CardProps = {
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  variant?: CardVariant
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
}

export function Card({
  title,
  description,
  footer,
  children,
  variant,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
}: CardProps) {
  const hasHeader = title != null || description != null
  return (
    <HeroCard variant={variant} className={className}>
      {hasHeader && (
        <HeroCard.Header className={headerClassName}>
          {title != null && <HeroCard.Title>{title}</HeroCard.Title>}
          {description != null && (
            <HeroCard.Description>{description}</HeroCard.Description>
          )}
        </HeroCard.Header>
      )}
      {children != null && (
        <HeroCard.Content className={contentClassName}>{children}</HeroCard.Content>
      )}
      {footer != null && <HeroCard.Footer className={footerClassName}>{footer}</HeroCard.Footer>}
    </HeroCard>
  )
}
