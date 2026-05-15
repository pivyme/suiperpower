import { Modal as HeroModal, useOverlayState } from '@heroui/react'
import type { ReactNode } from 'react'

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'cover' | 'full'
type ModalPlacement = 'auto' | 'center' | 'top' | 'bottom'
type BackdropVariant = 'opaque' | 'blur' | 'transparent'
type ScrollBehavior = 'inside' | 'outside'

type ModalProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  size?: ModalSize
  placement?: ModalPlacement
  backdrop?: BackdropVariant
  scroll?: ScrollBehavior
  isDismissable?: boolean
  isKeyboardDismissDisabled?: boolean
  className?: string
  bodyClassName?: string
}

// Flat wrapper around HeroUI's Modal.Backdrop > Container > Dialog > Header/Body/Footer chain.
export function Modal({
  isOpen,
  onOpenChange,
  title,
  description,
  footer,
  children,
  size = 'md',
  placement = 'center',
  backdrop = 'opaque',
  scroll = 'inside',
  isDismissable = true,
  isKeyboardDismissDisabled,
  className,
  bodyClassName,
}: ModalProps) {
  const hasHeader = title != null || description != null
  return (
    <HeroModal.Backdrop
      variant={backdrop}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
    >
      <HeroModal.Container size={size} placement={placement} scroll={scroll}>
        <HeroModal.Dialog className={className}>
          {hasHeader && (
            <HeroModal.Header>
              {title != null && <HeroModal.Heading>{title}</HeroModal.Heading>}
              {description != null && (
                <p className="text-sm text-foreground-500 mt-1">{description}</p>
              )}
            </HeroModal.Header>
          )}
          {children != null && (
            <HeroModal.Body className={bodyClassName}>{children}</HeroModal.Body>
          )}
          {footer != null && <HeroModal.Footer>{footer}</HeroModal.Footer>}
        </HeroModal.Dialog>
      </HeroModal.Container>
    </HeroModal.Backdrop>
  )
}

export { useOverlayState }
