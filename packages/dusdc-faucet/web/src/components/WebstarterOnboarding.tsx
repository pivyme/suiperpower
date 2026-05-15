import { useState } from 'react'
import {
  BookOpen,
  Check,
  Code2,
  ExternalLink,
  Info,
  MousePointerClick,
  Moon,
  Sun,
  Terminal,
  Sparkles,
  TriangleAlert,
  X,
  Search,
  Mail,
  Lock,
  Bell,
  Wifi,
  Eye,
  Globe,
  User,
  Layers,
  Zap,
} from 'lucide-react'
import {
  Button,
  Switch,
  Checkbox,
  Chip,
  Slider,
  ProgressBar,
  Avatar,
  Tabs,
  Tab,
  TextField,
  Label,
  InputGroup,
  Tooltip,
  Popover,
} from '@heroui/react'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'
import AnimateComponent from './elements/AnimateComponent'
import ModularGrid from './art/ModularGrid'
import { config } from '@/config'
import { cnm } from '@/utils/style'
import { useTheme } from '@/providers/ThemeProvider'
import {
  EASE_OUT_QUINT,
  EASE_OUT_EXPO,
  EASE_SNAPPY_OUT,
} from '@/utils/motion'

function HeroArt() {
  return (
    <div
      className={cnm(
        'relative w-full h-64 sm:h-80 lg:h-full lg:min-h-[380px]',
        'border border-neutral-200 dark:border-neutral-800',
        'bg-neutral-100/50 dark:bg-neutral-800/30',
        'overflow-hidden'
      )}
    >
      <ModularGrid columns={10} rows={8} gap={4} />
      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-neutral-300 dark:text-neutral-700 tracking-wider">
        grid.01
      </div>
    </div>
  )
}

function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500" />
          <span className="text-sm font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
            KWEK/STARTER
          </span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-6">
            <a
              href="#start"
              className="text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Start
            </a>
            <a
              href="#stack"
              className="text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Stack
            </a>
            <a
              href={config.links.github || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Source
            </a>
          </nav>
          <button
            onClick={toggleTheme}
            className={cnm(
              'p-2 border border-neutral-200 dark:border-neutral-700',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors duration-150'
            )}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-neutral-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-6 pt-16 pb-16">
      <div className="grid grid-cols-12 gap-8 lg:gap-12">
        <div className="col-span-12 lg:col-span-6 flex flex-col justify-center order-2 lg:order-1">
          <AnimateComponent entry="fadeInUp" duration={500}>
            <p className="text-xs font-mono uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-4">
              Web Starter v2.0
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] text-neutral-900 dark:text-neutral-100">
              Start with
              <br />
              <span className="font-normal">solid foundation</span>
            </h1>
            <p className="mt-6 text-base text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md">
              Production-ready React template. Modern tooling. No boilerplate
              fatigue.
            </p>
          </AnimateComponent>
        </div>

        <div className="col-span-12 lg:col-span-6 order-1 lg:order-2">
          <AnimateComponent delay={100} entry="fadeInUp">
            <HeroArt />
          </AnimateComponent>
        </div>
      </div>

      <AnimateComponent delay={200}>
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { label: 'React', version: '19' },
              { label: 'TanStack', version: 'Start' },
              { label: 'Tailwind', version: '4' },
              { label: 'TypeScript', version: '5.x' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-2xl font-light text-neutral-900 dark:text-neutral-100">
                  {item.version}
                </p>
                <p className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimateComponent>
    </section>
  )
}

function LinksSection() {
  const links = [
    { label: 'Documentation', url: config.links.docs, icon: BookOpen },
    { label: 'GitHub', url: config.links.github, icon: Code2 },
    { label: 'Twitter', url: config.links.twitter, icon: ExternalLink },
    { label: 'Telegram', url: config.links.telegram, icon: ExternalLink },
  ]

  return (
    <AnimateComponent delay={300} onScroll threshold={0.1}>
      <div className="w-full max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={cnm(
                'inline-flex items-center gap-2 px-4 py-2',
                'border border-neutral-200 dark:border-neutral-800',
                'text-sm font-mono text-neutral-600 dark:text-neutral-400',
                'hover:border-neutral-400 dark:hover:border-neutral-600',
                'hover:text-neutral-900 dark:hover:text-neutral-100',
                'transition-colors duration-150',
                !link.url && 'opacity-30 pointer-events-none'
              )}
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </AnimateComponent>
  )
}

function CodeSnippet({ children }: { children: string }) {
  return (
    <code className="px-1.5 py-0.5 text-sm font-mono bg-neutral-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-400">
      {children}
    </code>
  )
}

function StartSection() {
  const steps = [
    {
      num: '01',
      title: 'Configure',
      desc: (
        <>
          Set up your links in <CodeSnippet>src/config.ts</CodeSnippet> — single
          source of truth for app config.
        </>
      ),
    },
    {
      num: '02',
      title: 'Animate',
      desc: (
        <>
          Use <CodeSnippet>AnimateComponent</CodeSnippet> for scroll-triggered
          animations. GSAP-powered, zero config.
        </>
      ),
    },
    {
      num: '03',
      title: 'Extend',
      desc: (
        <>
          Componentize sections:{' '}
          <CodeSnippet>{'<HeroSection />'}</CodeSnippet>,{' '}
          <CodeSnippet>{'<Features />'}</CodeSnippet>,{' '}
          <CodeSnippet>{'<Footer />'}</CodeSnippet>
        </>
      ),
    },
    {
      num: '04',
      title: 'Deploy',
      desc: (
        <>
          Update meta in <CodeSnippet>__root.tsx</CodeSnippet>, then push to
          Vercel. That's it.
        </>
      ),
    },
  ]

  const resources = [
    { name: 'Magic UI', url: 'https://magicui.design/' },
    { name: 'React Bits', url: 'https://www.reactbits.dev/' },
    { name: 'Aceternity', url: 'https://www.aceternity.com/' },
    { name: 'UIverse', url: 'https://uiverse.io/' },
    { name: '21st.dev', url: 'https://21st.dev/' },
  ]

  return (
    <AnimateComponent delay={100} onScroll threshold={0.1}>
      <section
        id="start"
        className="w-full bg-neutral-100/50 dark:bg-neutral-800/20 border-y border-neutral-200 dark:border-neutral-800"
      >
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                  Getting Started
                </h2>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Four steps to production. No ceremony.
              </p>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="space-y-8">
                {steps.map((step) => (
                  <div
                    key={step.num}
                    className="grid grid-cols-12 gap-4 group"
                  >
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-xs font-mono text-neutral-300 dark:text-neutral-600 group-hover:text-amber-500 transition-colors">
                        {step.num}
                      </span>
                    </div>
                    <div className="col-span-10 sm:col-span-11 space-y-1">
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {step.title}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4">
                  Resources
                </p>
                <div className="flex flex-wrap gap-2">
                  {resources.map((resource) => (
                    <a
                      key={resource.name}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cnm(
                        'px-3 py-1.5 text-xs font-mono',
                        'border border-neutral-200 dark:border-neutral-700',
                        'text-neutral-500 dark:text-neutral-400',
                        'hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-500',
                        'transition-colors duration-150'
                      )}
                    >
                      {resource.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AnimateComponent>
  )
}

function AnimationShowcase() {
  const items: {
    label: string
    tag: string
    demo: React.ReactNode
  }[] = [
    {
      label: 'SPRING_SMOOTH',
      tag: 'spring',
      demo: (
        <motion.div
          className="w-4 h-4 bg-amber-500"
          animate={{ x: [0, 72, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8, ease: [...EASE_OUT_QUINT] }}
        />
      ),
    },
    {
      label: 'SPRING_BOUNCE',
      tag: 'spring',
      demo: (
        <motion.div
          className="w-4 h-4 bg-amber-500"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        />
      ),
    },
    {
      label: 'SPRING_SNAPPY',
      tag: 'spring',
      demo: (
        <motion.div
          className="w-4 h-4 bg-neutral-500 dark:bg-neutral-400"
          animate={{ x: [0, 72, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1, ease: [...EASE_SNAPPY_OUT] }}
        />
      ),
    },
    {
      label: 'SPRING_SLIDE',
      tag: 'spring',
      demo: (
        <motion.div
          className="w-4 h-4 bg-amber-500"
          animate={{ x: [0, 72, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8, ease: [...EASE_OUT_EXPO] }}
        />
      ),
    },
    {
      label: 'fadeInUp',
      tag: 'variant',
      demo: (
        <motion.div
          className="w-4 h-4 bg-amber-500"
          animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -6] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.6, ease: [...EASE_OUT_QUINT] }}
        />
      ),
    },
    {
      label: 'scaleIn',
      tag: 'variant',
      demo: (
        <motion.div
          className="w-4 h-4 bg-neutral-500 dark:bg-neutral-400"
          animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.6, ease: [...EASE_OUT_EXPO] }}
        />
      ),
    },
    {
      label: 'EASE_OUT_EXPO',
      tag: 'easing',
      demo: (
        <motion.div
          className="w-4 h-4 bg-amber-500"
          animate={{ x: [0, 72, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.8, ease: [...EASE_OUT_EXPO] }}
        />
      ),
    },
    {
      label: 'staggerChildren',
      tag: 'variant',
      demo: (
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-amber-500/80"
              animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -4] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                repeatDelay: 1,
                delay: i * 0.12,
                ease: [...EASE_OUT_QUINT],
              }}
            />
          ))}
        </div>
      ),
    },
  ]

  return (
    <AnimateComponent delay={100} onScroll threshold={0.1}>
      <section
        id="animations"
        className="w-full bg-neutral-100/50 dark:bg-neutral-800/20 border-y border-neutral-200 dark:border-neutral-800"
      >
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                  Motion Presets
                </h2>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Springs, easings, and variants ready to use.
                Import from <code className="px-1.5 py-0.5 text-sm font-mono bg-neutral-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-400">@/utils/motion</code> and go.
              </p>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {items.map((item) => (
                  <div
                    key={item.label}
                    className={cnm(
                      'px-4 py-3 h-28',
                      'border border-neutral-200 dark:border-neutral-800',
                      'bg-neutral-50 dark:bg-neutral-900',
                      'flex flex-col justify-between'
                    )}
                  >
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-amber-500 mb-0.5">
                        {item.tag}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-300 truncate">
                        {item.label}
                      </p>
                    </div>
                    <div className="flex items-center h-6 overflow-hidden">
                      {item.demo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AnimateComponent>
  )
}

function ComponentsShowcase() {
  const [sliderValue, setSliderValue] = useState([40])

  return (
    <AnimateComponent delay={100} onScroll threshold={0.1}>
      <section id="components" className="w-full max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <MousePointerClick className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                Components
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              HeroUI v3 components, ready to use. Interactive demos below.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-10">
            {/* Tabs */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                Tabs
              </p>
              <Tabs>
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Sections">
                    <Tab id="overview">Overview<Tabs.Indicator /></Tab>
                    <Tab id="settings">Settings<Tabs.Indicator /></Tab>
                    <Tab id="members">Members<Tabs.Indicator /></Tab>
                  </Tabs.List>
                </Tabs.ListContainer>
                <Tabs.Panel id="overview">
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      A production-ready starter with sensible defaults. No config ceremony.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Chip size="sm" variant="soft" color="accent">
                        <Chip.Label>React 19</Chip.Label>
                      </Chip>
                      <Chip size="sm" variant="secondary">
                        <Chip.Label>TypeScript</Chip.Label>
                      </Chip>
                      <Chip size="sm" variant="secondary">
                        <Chip.Label>Vite 7</Chip.Label>
                      </Chip>
                    </div>
                  </div>
                </Tabs.Panel>
                <Tabs.Panel id="settings">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm">Notifications</span>
                      </div>
                      <Switch defaultSelected size="sm">
                        <Switch.Control><Switch.Thumb /></Switch.Control>
                      </Switch>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm">Auto-sync</span>
                      </div>
                      <Switch size="sm">
                        <Switch.Control><Switch.Thumb /></Switch.Control>
                      </Switch>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm">Public profile</span>
                      </div>
                      <Switch defaultSelected size="sm">
                        <Switch.Control><Switch.Thumb /></Switch.Control>
                      </Switch>
                    </div>
                  </div>
                </Tabs.Panel>
                <Tabs.Panel id="members">
                  <div className="space-y-3">
                    {[
                      { name: 'Alex Chen', role: 'Admin', initials: 'AC', color: 'warning' as const },
                      { name: 'Jordan Lee', role: 'Editor', initials: 'JL', color: 'accent' as const },
                      { name: 'Sam Rivera', role: 'Viewer', initials: 'SR', color: 'success' as const },
                    ].map((member) => (
                      <div key={member.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" variant="soft" color={member.color}>
                            <Avatar.Fallback>{member.initials}</Avatar.Fallback>
                          </Avatar>
                          <span className="text-sm">{member.name}</span>
                        </div>
                        <Chip size="sm" variant="tertiary">
                          <Chip.Label>{member.role}</Chip.Label>
                        </Chip>
                      </div>
                    ))}
                  </div>
                </Tabs.Panel>
              </Tabs>
            </div>

            {/* Inputs */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                Inputs
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField>
                  <Label>Email</Label>
                  <InputGroup>
                    <InputGroup.Prefix><Mail className="w-4 h-4 text-neutral-400" /></InputGroup.Prefix>
                    <InputGroup.Input placeholder="you@example.com" />
                  </InputGroup>
                </TextField>
                <TextField>
                  <Label>Password</Label>
                  <InputGroup>
                    <InputGroup.Prefix><Lock className="w-4 h-4 text-neutral-400" /></InputGroup.Prefix>
                    <InputGroup.Input type="password" placeholder="Enter password" />
                  </InputGroup>
                </TextField>
                <TextField>
                  <Label>Search</Label>
                  <InputGroup>
                    <InputGroup.Prefix><Search className="w-4 h-4 text-neutral-400" /></InputGroup.Prefix>
                    <InputGroup.Input placeholder="Search components..." />
                  </InputGroup>
                </TextField>
                <TextField>
                  <Label>Website</Label>
                  <InputGroup>
                    <InputGroup.Prefix><Globe className="w-4 h-4 text-neutral-400" /></InputGroup.Prefix>
                    <InputGroup.Input placeholder="https://example.com" />
                  </InputGroup>
                </TextField>
              </div>
              <div className="mt-3">
                <TextField>
                  <Label>Message</Label>
                  <InputGroup>
                    <InputGroup.TextArea placeholder="Write something..." rows={2} />
                  </InputGroup>
                </TextField>
              </div>
            </div>

            {/* Switches & Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                  Switches
                </p>
                <div className="flex flex-col gap-3">
                  <Switch defaultSelected size="sm">
                    <Switch.Control><Switch.Thumb /></Switch.Control>
                    <Switch.Content><span className="text-sm">Dark mode</span></Switch.Content>
                  </Switch>
                  <Switch size="sm">
                    <Switch.Control><Switch.Thumb /></Switch.Control>
                    <Switch.Content><span className="text-sm">Analytics</span></Switch.Content>
                  </Switch>
                  <Switch defaultSelected size="sm" isDisabled>
                    <Switch.Control><Switch.Thumb /></Switch.Control>
                    <Switch.Content><span className="text-sm text-neutral-400">Required (locked)</span></Switch.Content>
                  </Switch>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                  Checkboxes
                </p>
                <div className="flex flex-col gap-3">
                  <Checkbox defaultSelected>
                    <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                    <Checkbox.Content><span className="text-sm">Terms of service</span></Checkbox.Content>
                  </Checkbox>
                  <Checkbox>
                    <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                    <Checkbox.Content><span className="text-sm">Newsletter</span></Checkbox.Content>
                  </Checkbox>
                  <Checkbox defaultSelected isDisabled>
                    <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                    <Checkbox.Content><span className="text-sm text-neutral-400">Privacy policy (required)</span></Checkbox.Content>
                  </Checkbox>
                </div>
              </div>
            </div>

            {/* Chips */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                Chips
              </p>
              <div className="flex flex-wrap gap-2">
                <Chip size="sm" variant="soft" color="warning">
                  <Chip.Label className="flex items-center gap-1"><Zap className="w-3 h-3" /> Active</Chip.Label>
                </Chip>
                <Chip size="sm" variant="soft" color="success">
                  <Chip.Label className="flex items-center gap-1"><Check className="w-3 h-3" /> Deployed</Chip.Label>
                </Chip>
                <Chip size="sm" variant="soft" color="accent">
                  <Chip.Label className="flex items-center gap-1"><Layers className="w-3 h-3" /> v2.0</Chip.Label>
                </Chip>
                <Chip size="sm" variant="soft" color="danger">
                  <Chip.Label className="flex items-center gap-1"><X className="w-3 h-3" /> Deprecated</Chip.Label>
                </Chip>
                <Chip size="sm" variant="primary" color="accent">
                  <Chip.Label className="flex items-center gap-1"><Zap className="w-3 h-3" /> Primary</Chip.Label>
                </Chip>
                <Chip size="sm" variant="tertiary">
                  <Chip.Label>Pending</Chip.Label>
                </Chip>
              </div>
            </div>

            {/* Slider & Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-4">
                  Slider
                </p>
                <Slider
                  value={sliderValue}
                  onChange={(v) => setSliderValue(v as number[])}
                  minValue={0}
                  maxValue={100}
                  step={1}
                  aria-label="Volume"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Volume</span>
                    <Slider.Output className="text-sm tabular-nums" />
                  </div>
                  <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                  </Slider.Track>
                </Slider>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-4">
                  Progress
                </p>
                <div className="space-y-4">
                  <ProgressBar value={72} aria-label="Build progress">
                    <Label>Build</Label>
                    <ProgressBar.Output />
                    <ProgressBar.Track>
                      <ProgressBar.Fill />
                    </ProgressBar.Track>
                  </ProgressBar>
                  <ProgressBar value={45} color="success" aria-label="Tests progress">
                    <Label>Tests</Label>
                    <ProgressBar.Output />
                    <ProgressBar.Track>
                      <ProgressBar.Fill />
                    </ProgressBar.Track>
                  </ProgressBar>
                  <ProgressBar isIndeterminate aria-label="Deploying" color="accent">
                    <Label>Deploying</Label>
                    <ProgressBar.Track>
                      <ProgressBar.Fill />
                    </ProgressBar.Track>
                  </ProgressBar>
                </div>
              </div>
            </div>

            {/* Toast & Buttons */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                Toast triggers
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-none font-mono text-xs bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900"
                  onPress={() =>
                    toast.success('Action completed', { id: 'demo-success' })
                  }
                >
                  <Check className="w-3.5 h-3.5" />
                  Success
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none font-mono text-xs border-red-500/40 text-red-600 dark:text-red-400"
                  onPress={() =>
                    toast.error('Something went wrong', { id: 'demo-error' })
                  }
                >
                  <X className="w-3.5 h-3.5" />
                  Error
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none font-mono text-xs border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                  onPress={() =>
                    toast('Heads up, something happened.', { id: 'demo-info' })
                  }
                >
                  <Info className="w-3.5 h-3.5" />
                  Info
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none font-mono text-xs border-amber-500/40 text-amber-600 dark:text-amber-400"
                  onPress={() =>
                    toast('Check your input before continuing.', {
                      id: 'demo-warning',
                      icon: '⚠️',
                    })
                  }
                >
                  <TriangleAlert className="w-3.5 h-3.5" />
                  Warning
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none font-mono text-xs border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                  onPress={() =>
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: 'Loading...',
                        success: 'Data loaded',
                        error: 'Failed to load',
                      },
                      { id: 'demo-promise' }
                    )
                  }
                >
                  Promise
                </Button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                Button variants
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-none font-mono text-xs bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900"
                >
                  Solid
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none font-mono text-xs border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                >
                  Outline
                </Button>
                <Button
                  size="sm"
                  variant="tertiary"
                  className="rounded-none font-mono text-xs text-neutral-700 dark:text-neutral-300"
                >
                  Tertiary
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-none font-mono text-xs"
                >
                  Ghost
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-none font-mono text-xs"
                >
                  Secondary
                </Button>
                <Button
                  size="sm"
                  isDisabled
                  className="rounded-none font-mono text-xs"
                >
                  Disabled
                </Button>
              </div>
            </div>

            {/* Avatars */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                Avatars
              </p>
              <div className="flex items-center gap-3">
                {[
                  { initials: 'AC', color: 'warning' as const },
                  { initials: 'JL', color: 'accent' as const },
                  { initials: 'SR', color: 'success' as const },
                  { initials: 'MK', color: 'danger' as const },
                ].map((person) => (
                  <Avatar key={person.initials} size="md" variant="soft" color={person.color}>
                    <Avatar.Fallback>{person.initials}</Avatar.Fallback>
                  </Avatar>
                ))}
                <Avatar size="md">
                  <Avatar.Fallback><User className="w-4 h-4" /></Avatar.Fallback>
                </Avatar>
              </div>
            </div>

            {/* Tooltip & Popover */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                Tooltip & Popover
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Tooltip delay={0}>
                  <Button size="sm" variant="secondary">Hover me</Button>
                  <Tooltip.Content>
                    <p>Simple tooltip</p>
                  </Tooltip.Content>
                </Tooltip>

                <Tooltip delay={0}>
                  <Button size="sm" variant="secondary">With arrow</Button>
                  <Tooltip.Content showArrow>
                    <Tooltip.Arrow />
                    <p>Tooltip with arrow indicator</p>
                  </Tooltip.Content>
                </Tooltip>

                <Popover>
                  <Button size="sm" variant="outline">Click for popover</Button>
                  <Popover.Content className="max-w-64">
                    <Popover.Dialog>
                      <Popover.Arrow />
                      <Popover.Heading>Popover Title</Popover.Heading>
                      <p className="mt-2 text-sm text-muted">
                        Rich content in a portal, triggered by a button.
                      </p>
                    </Popover.Dialog>
                  </Popover.Content>
                </Popover>

                <Popover>
                  <Button size="sm" variant="outline">User card</Button>
                  <Popover.Content className="w-[280px]">
                    <Popover.Dialog>
                      <Popover.Arrow />
                      <Popover.Heading>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" variant="soft" color="accent">
                            <Avatar.Fallback>JD</Avatar.Fallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">Jane Doe</p>
                            <p className="text-xs text-muted">@janedoe</p>
                          </div>
                        </div>
                      </Popover.Heading>
                      <p className="mt-3 text-sm text-muted">
                        Product designer building beautiful experiences.
                      </p>
                      <div className="mt-3 flex gap-4 text-sm">
                        <span><strong>142</strong> <span className="text-muted">Following</span></span>
                        <span><strong>2.8K</strong> <span className="text-muted">Followers</span></span>
                      </div>
                    </Popover.Dialog>
                  </Popover.Content>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AnimateComponent>
  )
}

function StackSection() {
  const stack = [
    'React 19',
    'TanStack Start',
    'TanStack Router',
    'TanStack Query',
    'Tailwind CSS 4',
    'HeroUI',
    'GSAP',
    'Lenis',
    'TypeScript',
    'Vite 7',
  ]

  return (
    <AnimateComponent delay={100} onScroll threshold={0.1}>
      <section id="stack" className="w-full max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-4">
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
              Technology
            </p>
            <h2 className="text-2xl font-light text-neutral-900 dark:text-neutral-100">
              Modern stack
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stack.map((name) => (
                <div
                  key={name}
                  className="px-4 py-3 border border-neutral-200 dark:border-neutral-800"
                >
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                    {name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AnimateComponent>
  )
}

function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-mono text-neutral-400">
          Built by{' '}
          <a
            href="https://kweklabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
          >
            Kwek Labs
          </a>
        </p>
        <p className="text-xs font-mono text-neutral-300 dark:text-neutral-700">
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}

export default function WebstarterOnboarding() {
  return (
    <div
      className={cnm(
        'relative min-h-screen w-full flex flex-col',
        'bg-neutral-50 dark:bg-neutral-900',
        'transition-colors duration-200'
      )}
    >
      <Header />
      <div className="flex flex-col min-h-screen pt-14">
        <main className="flex-1">
          <HeroSection />
          <LinksSection />
          <StartSection />
          <AnimationShowcase />
          <ComponentsShowcase />
          <StackSection />
        </main>
        <Footer />
      </div>
    </div>
  )
}
