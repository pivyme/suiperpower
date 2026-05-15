import { createFileRoute } from '@tanstack/react-router'
import WebstarterOnboarding from '@/components/WebstarterOnboarding'

export const Route = createFileRoute('/')({ component: IndexPage })

function IndexPage() {
  return <WebstarterOnboarding />
}
