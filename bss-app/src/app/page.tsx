'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ComparisonGrid } from '@/components/ui/comparison-grid'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FAQItem } from '@/components/ui/faq-item'
import { FeatureCard } from '@/components/ui/feature-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { PricingCard } from '@/components/ui/pricing-card'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { StatBlock } from '@/components/ui/stat-block'
import { StatusPill } from '@/components/ui/status-pill'
import { TerminalBlock } from '@/components/ui/terminal-block'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  IconFlashlight,
  IconKey,
  IconShieldCheck,
  IconLock,
  IconCloseCircle,
  IconDatabase,
  IconTable,
  IconRefresh,
  IconSwap,
  IconWebhook,
  IconStack,
  IconArrowRight,
  IconChevronRight,
  IconExternalLink,
  IconCornerDown,
  IconFlowChart,
  IconCheckCircle,
  IconErrorWarning,
  IconClock,
  IconCode,
  IconGitMerge,
  IconFileList,
  IconMail,
  IconUser,
  IconSend,
  IconBarChart,
  IconUpload,
} from '@/components/ui/icons'

function ColorSwatch({
  bg,
  name,
  hex,
  description,
  border,
}: {
  bg: string
  name: string
  hex: string
  description: string
  border?: boolean
}) {
  return (
    <div className="flex flex-col overflow-hidden border border-border">
      <div
        className="h-14 shrink-0"
        style={{ background: bg, border: border ? '1px solid #555' : undefined }}
      />
      <div className="flex flex-1 flex-col bg-card px-3 py-2.5">
        <span className="block font-mono text-[11px] font-medium text-foreground">{name}</span>
        <span className="block font-mono text-[10px] text-muted-foreground">{hex}</span>
        <span className="mt-1 block text-[11px] leading-snug text-muted-foreground/70">
          {description}
        </span>
      </div>
    </div>
  )
}

function SwatchGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {children}
      </div>
    </div>
  )
}

function TypographyRow({
  label,
  meta,
  children,
}: {
  label: string
  meta: string[]
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-6 py-6 border-b border-border last:border-0 items-start">
      <div className="font-mono text-[11px] leading-[1.9] text-muted-foreground">
        <strong className="block font-medium text-foreground mb-1">{label}</strong>
        {meta.map((line, i) => (
          <span key={i} className="block">{line}</span>
        ))}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Section({
  label,
  title,
  children,
}: {
  label?: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="py-8">
      {label && (
        <div className="mb-3 flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-muted-foreground before:text-[12px] before:text-[#7a6a58] before:content-['//']">
          {label}
        </div>
      )}
      <h2 className="mb-6 border-b border-border pb-3 font-display text-2xl font-bold leading-tight tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

const ICONS_DATA = [
  { Icon: IconFlashlight, name: 'Flashlight', id: 'flashlight-line', usage: 'RAM-only processing — fast, stateless', inUse: true },
  { Icon: IconKey, name: 'Key', id: 'key-2-line', usage: 'Mapping rules — the schema, not the data', inUse: true },
  { Icon: IconShieldCheck, name: 'Shield Check', id: 'shield-check-line', usage: 'Zero data residency / GDPR compliance', inUse: true },
  { Icon: IconLock, name: 'Lock', id: 'lock-2-line', usage: 'OAuth2 isolation, founding rate lock, pricing lock', inUse: true },
  { Icon: IconCloseCircle, name: 'Close Circle', id: 'close-circle-line', usage: 'Problem/before states, error cards', inUse: true },
  { Icon: IconDatabase, name: 'Database', id: 'database-2-line', usage: 'Data source references, credit pool' },
  { Icon: IconTable, name: 'Table', id: 'table-2', usage: 'Google Sheets references, row data' },
  { Icon: IconRefresh, name: 'Refresh', id: 'refresh-line', usage: 'Monthly credit reset, sync operations' },
  { Icon: IconSwap, name: 'Swap', id: 'swap-line', usage: 'Bi-directional data flow, module toggle' },
  { Icon: IconWebhook, name: 'Webhook', id: 'webhook-line', usage: 'Outbound webhook endpoints' },
  { Icon: IconStack, name: 'Stack', id: 'stack-line', usage: 'Batch / bulk payload concept' },
  { Icon: IconArrowRight, name: 'Arrow Right', id: 'arrow-right-line', usage: 'CTA buttons, directional flow' },
  { Icon: IconChevronRight, name: 'Chevron Right', id: 'arrow-right-s-line', usage: 'Inline lists, breadcrumbs' },
  { Icon: IconExternalLink, name: 'External Link', id: 'external-link-line', usage: 'Docs, Zapier marketplace links' },
  { Icon: IconCornerDown, name: 'Corner Down', id: 'corner-right-down-line', usage: 'Pipeline flow diagrams, step connectors' },
  { Icon: IconFlowChart, name: 'Flow Chart', id: 'flow-chart', usage: 'Zapier workflow diagrams' },
  { Icon: IconCheckCircle, name: 'Check Circle', id: 'checkbox-circle-line', usage: 'Success state, confirmed writes' },
  { Icon: IconErrorWarning, name: 'Error Warning', id: 'error-warning-line', usage: 'Failed batch, API error state' },
  { Icon: IconClock, name: 'Clock', id: 'time-line', usage: 'Polling delay (15-min problem callout)' },
  { Icon: IconCode, name: 'Code', id: 'code-s-slash-line', usage: 'API docs, code block labels' },
  { Icon: IconGitMerge, name: 'Git Merge', id: 'git-merge-line', usage: 'Array merge / mapping concept' },
  { Icon: IconFileList, name: 'File List', id: 'file-list-2-line', usage: 'Mapping profile reference, config docs' },
  { Icon: IconMail, name: 'Mail', id: 'mail-line', usage: 'Email share, waitlist confirmation' },
  { Icon: IconUser, name: 'User', id: 'user-line', usage: 'Account, dashboard nav' },
  { Icon: IconSend, name: 'Send', id: 'send-plane-line', usage: 'Outbound push action button' },
  { Icon: IconBarChart, name: 'Bar Chart', id: 'bar-chart-2-line', usage: 'ROI calculator, savings metrics' },
  { Icon: IconUpload, name: 'Upload', id: 'upload-2-line', usage: 'Push to webhook action' },
]

const ZAPIER_TIERS = [
  { name: 'Free',         tasks: 100,    mo: 0,   yr: 0    },
  { name: 'Starter',      tasks: 750,    mo: 20,  yr: 240  },
  { name: 'Professional', tasks: 2000,   mo: 49,  yr: 588  },
  { name: 'Team',         tasks: 50000,  mo: 149, yr: 1788 },
  { name: 'Enterprise',   tasks: 100000, mo: 599, yr: 7188 },
]

function ROICalculator() {
  const [rows, setRows] = useState(25000)
  const tier = ZAPIER_TIERS.find(t => rows <= t.tasks) ?? ZAPIER_TIERS[ZAPIER_TIERS.length - 1]
  const bss = rows <= 10000 ? 19 : 49
  const bssLabel = rows <= 10000 ? 'PAYG $19' : 'Full Suite $49/yr founding'
  const save = tier.yr - bss
  const days = save > 0 ? Math.ceil((bss / Math.max(tier.yr, 1)) * 365) : 0

  return (
    <div className="border border-border overflow-hidden">
      <div className="p-9">
        <div className="flex justify-between items-baseline mb-3.5">
          <span className="font-mono text-[11px] text-muted-foreground">Rows processed per month</span>
          <span className="font-display text-2xl font-bold text-primary">{rows.toLocaleString()} rows</span>
        </div>
        <input
          type="range"
          min="1000"
          max="500000"
          step="1000"
          value={rows}
          onChange={e => setRows(Number(e.target.value))}
          className="w-full cursor-pointer"
        />
        <div className="grid grid-cols-3 gap-px mt-9 bg-border border border-border overflow-hidden">
          <div className="bg-card p-5">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[.09em] mb-2.5">Zapier tasks consumed</p>
            <p className="font-display text-[28px] font-bold leading-none text-destructive">{rows.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">1 per row (Loop)</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[.09em] mb-2.5">Required Zapier tier</p>
            <p className="font-display text-[28px] font-bold leading-none text-destructive">{tier.name}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">{tier.mo === 0 ? 'Free tier' : `$${tier.mo}/mo · $${tier.yr}/yr`}</p>
          </div>
          <div className="bg-card p-5">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[.09em] mb-2.5">Annual savings</p>
            <p className={`font-display text-[28px] font-bold leading-none ${save > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
              {save > 0 ? `$${save.toLocaleString()}` : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5">vs. {bssLabel}</p>
          </div>
        </div>
        {save > 0 && (
          <div className="mt-5 px-4 py-3.5 bg-primary/10 border border-primary/[0.28] font-mono text-[11px] text-primary leading-[1.7]">
            ▸ <span className="text-foreground">Verdict:</span> At {rows.toLocaleString()} rows/mo you need{' '}
            <strong className="text-destructive">{tier.name}</strong> at ${tier.mo}/mo. BSS {bssLabel}.
            Break even in <strong className="text-primary">{days} days</strong>.
          </div>
        )}
      </div>
    </div>
  )
}

const LAUNCH_STEPS: { status: 'done' | 'active' | 'planned'; title: string; desc: string; date: string }[] = [
  { status: 'done',    title: 'Core inbound API — array processing engine',      desc: 'RAM-only JSON → Sheets mapping. 10k rows per call.',                     date: 'Shipped'                    },
  { status: 'done',    title: 'Visual Mapper dashboard',                          desc: 'Drag-and-drop JSON key → Sheet column UI.',                             date: 'Shipped'                    },
  { status: 'done',    title: 'Zapier custom action — published',                 desc: 'Available as a Zapier custom action.',                                  date: 'Shipped'                    },
  { status: 'active',  title: 'Google Workspace Add-on — marketplace review',    desc: '"Push to Webhook" sidebar. Review: 2–3 weeks.',                         date: 'In progress · Est. May 2025' },
  { status: 'planned', title: 'Billing + credit management',                      desc: 'PAYG credit tracking, subscription management.',                        date: 'Target: Jun 2025'           },
  { status: 'planned', title: 'Public launch',                                    desc: 'Waitlist notified first. Founding member pricing activated.',           date: 'Target: Q3 2025'            },
]

export default function ShowcasePage() {
  return (
    <TooltipProvider>
      <div className="relative min-h-screen">
        {/* Sticky topbar */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card px-7 h-11.5">
          <span className="font-mono text-[11px] tracking-[0.07em] text-muted-foreground">
            BulkSheetsSync · Component Library
          </span>
          <ThemeToggle />
        </header>

        <main className="max-w-260 mx-auto px-6 py-12 space-y-2">
        <div className="mb-10">
          <StatusPill status="Building now" timeline="Q3 2025" spotsRemaining={253} />
          <h1 className="font-display text-4xl font-bold mt-4">
            BSS <span className="text-primary">Component</span> Library
          </h1>
          <p className="text-muted-foreground font-sans mt-2">
            Design token showcase — dark mode, Base UI primitives, no Radix.
          </p>
        </div>

        <Section label="tokens" title="Color Tokens">
          <SwatchGroup label="Ground · backgrounds &amp; text">
            <ColorSwatch bg="#1a1510" name="--bg (dark)" hex="#1a1510" description="Rich warm charcoal. Brown undertone." />
            <ColorSwatch bg="#231c14" name="--surface (dark)" hex="#231c14" description="Cards, panels, inputs." />
            <ColorSwatch bg="#2c2418" name="--surface-2 (dark)" hex="#2c2418" description="Nested surfaces, menus." />
            <ColorSwatch bg="#f2ede4" name="--bg (light)" hex="#f2ede4" description="Warm parchment. Aged paper." border />
            <ColorSwatch bg="#e8e1d6" name="--surface (light)" hex="#e8e1d6" description="Cards on light theme." border />
            <ColorSwatch bg="#ded6c8" name="--surface-2 (light)" hex="#ded6c8" description="Nested surfaces." border />
            <ColorSwatch bg="#e8dfd0" name="--text (dark)" hex="#e8dfd0" description="Warm cream. Vault body text." border />
            <ColorSwatch bg="#1e1510" name="--text (light)" hex="#1e1510" description="Warm near-black." border />
          </SwatchGroup>
          <SwatchGroup label="Primary · gold (vault link color)">
            <ColorSwatch bg="#c98d1a" name="--gold (dark)" hex="#c98d1a" description="CTAs, key data, active states." />
            <ColorSwatch bg="#8a6010" name="--gold (light)" hex="#8a6010" description="Darkened 20% for parchment." />
            <ColorSwatch bg="rgba(201,141,26,0.28)" name="--gold-border" hex="rgba(201,141,26,.28)" description="Featured card borders." />
            <ColorSwatch bg="rgba(201,141,26,0.10)" name="--gold-dim" hex="rgba(201,141,26,.10)" description="Tag fills, spotlight surfaces." />
            <ColorSwatch bg="rgba(201,141,26,0.055)" name="--gold-glow" hex="rgba(201,141,26,.055)" description="Gradient card background." />
          </SwatchGroup>
          <SwatchGroup label="Destructive · rust (vault section headers)">
            <ColorSwatch bg="#cc6030" name="--rust (dark)" hex="#cc6030" description="Problem states, cost callouts." />
            <ColorSwatch bg="#a83e18" name="--rust (light)" hex="#a83e18" description="Darkened for parchment." />
            <ColorSwatch bg="rgba(204,96,48,0.26)" name="--rust-border" hex="rgba(204,96,48,.26)" description="Error card borders." />
            <ColorSwatch bg="rgba(204,96,48,0.10)" name="--rust-dim" hex="rgba(204,96,48,.10)" description="Error card fills." />
          </SwatchGroup>
          <SwatchGroup label="Success · teal (vault content links)">
            <ColorSwatch bg="#5a9e80" name="--teal (dark)" hex="#5a9e80" description={'Confirmation, success, "after".'} />
            <ColorSwatch bg="#2a6a4c" name="--teal (light)" hex="#2a6a4c" description="Darkened for parchment." />
            <ColorSwatch bg="rgba(90,158,128,0.26)" name="--teal-border" hex="rgba(90,158,128,.26)" description="Success card borders." />
            <ColorSwatch bg="rgba(90,158,128,0.10)" name="--teal-dim" hex="rgba(90,158,128,.10)" description="Success card fills." />
          </SwatchGroup>
          <SwatchGroup label="Borders &amp; muted">
            <ColorSwatch bg="#3a3020" name="--border (dark)" hex="#3a3020" description="All dividers and outlines." />
            <ColorSwatch bg="#4e4030" name="--input (dark)" hex="#4e4030" description="Input borders on focus." />
            <ColorSwatch bg="#907e68" name="--muted-fg (dark)" hex="#907e68" description="Primary muted text." />
            <ColorSwatch bg="#7a6a58" name="--dim-muted (dark)" hex="#7a6a58" description="Deemphasized, // labels." />
            <ColorSwatch bg="#ccc0ac" name="--border (light)" hex="#ccc0ac" description="All dividers and outlines." border />
            <ColorSwatch bg="#6a5a48" name="--muted-fg (light)" hex="#6a5a48" description="Primary muted text." border />
          </SwatchGroup>
        </Section>

        <Separator />

        <Section label="type" title="Typography Scale">
          <TypographyRow
            label="Hero H1"
            meta={['Bricolage Grotesque', '64–88px · 800w', '−0.04em · lh 0.97', 'One key word/phrase in gold.']}
          >
            <p className="font-display text-[64px] font-extrabold leading-[0.97] tracking-[-0.04em]">
              500 rows.<br /><span className="text-primary">1 task.</span>
            </p>
          </TypographyRow>
          <TypographyRow
            label="Section H2"
            meta={['Bricolage Grotesque', '40–46px · 700w', '−0.03em', 'Em highlights one key phrase.']}
          >
            <p className="font-display text-[40px] font-bold leading-[1.06] tracking-[-0.03em]">
              You&apos;re paying for<br /><span className="text-primary">iteration.</span>
            </p>
          </TypographyRow>
          <TypographyRow
            label="Feature / Card Title"
            meta={['Bricolage Grotesque', '22px · 600w', '−0.02em', 'No color emphasis — size alone.']}
          >
            <p className="font-display text-[22px] font-semibold leading-[1.1] tracking-[-0.02em]">
              Inbound Visual Mapper
            </p>
          </TypographyRow>
          <TypographyRow
            label="Data / Metric"
            meta={['Martian Mono', '32px · 600w', 'color: --gold', 'Stats, prices, savings.']}
          >
            <p className="font-mono text-[32px] font-semibold text-primary leading-none">
              $1,739&nbsp;&nbsp;500×&nbsp;&nbsp;&lt;1s
            </p>
          </TypographyRow>
          <TypographyRow
            label="Mono Body"
            meta={['Martian Mono', '12px · 400w', 'Code, terminal, values,', 'buttons, nav items.']}
          >
            <pre className="font-mono text-[12px] leading-[2.1]">{`tasks_billed: 1 // not 500\nrows_written: 500\ndata_stored:  0`}</pre>
          </TypographyRow>
          <TypographyRow
            label="Section Label"
            meta={['Martian Mono', '10px · 500w · CAPS', '0.14em tracking', 'Precedes every section. Never in gold.']}
          >
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {'// Enterprise Security'}&nbsp;&nbsp;&nbsp;{'02 · Features'}
            </p>
          </TypographyRow>
          <TypographyRow
            label="Body Copy"
            meta={['Barlow', '15px · 300w', 'color: --muted', 'Light weight creates hierarchy contrast.']}
          >
            <p className="font-sans text-[15px] font-light text-muted-foreground leading-[1.72]">
              Stateless transit — your spreadsheet data never touches a database, never gets logged, never creates GDPR liability for you or us.
            </p>
          </TypographyRow>
        </Section>

        <Separator />

        <Section title="Stat Blocks">
          <div className="flex gap-9 flex-wrap">
            <StatBlock value="12,400+" label="Sheets synced" accent="gold" />
            <StatBlock value="99.9%" label="Uptime" accent="teal" />
            <StatBlock value="0" label="Data breaches" accent="rust" />
          </div>
        </Section>

        <Separator />

        <Section title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="outline-destructive">Outline Destructive</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Separator />

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">▶ Building Now</Badge>
            <Badge variant="default">Module 01</Badge>
            <Badge variant="destructive">✕ Native Zapier</Badge>
            <Badge variant="success">✓ BulkSheetsSync</Badge>
            <Badge variant="muted">// Label</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="secondary">Secondary</Badge>
          </div>
        </Section>

        <Separator />

        <Section title="Form Fields">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email-err" error>
                Email (error)
              </Label>
              <Input id="email-err" type="email" placeholder="bad@email" error />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name-ok">Name (success)</Label>
              <Input id="name-ok" type="text" defaultValue="Kyle Brodeur" success />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" placeholder="Enter a message…" />
            </div>
          </div>
        </Section>

        <Separator />

        <Section label="ui" title="Cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Plain surface, no accent.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans">Standard card body — bg-card, border-border, no gradient.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">Cancel</Button>
                <Button size="sm">Confirm</Button>
              </CardFooter>
            </Card>
            <Card accent="gold">
              <CardHeader>
                <CardTitle>Gold Emphasis</CardTitle>
                <CardDescription>Featured or primary action.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans">Gold left border + subtle gradient fill from top-left.</p>
              </CardContent>
            </Card>
            <Card accent="rust">
              <CardHeader>
                <CardTitle>Rust / Problem</CardTitle>
                <CardDescription>Error state or cost callout.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans">Rust left border + rust-tinted gradient fill.</p>
              </CardContent>
            </Card>
            <Card accent="teal">
              <CardHeader>
                <CardTitle>Teal / Success</CardTitle>
                <CardDescription>Synced or verified state.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans">Teal left border + teal-tinted gradient fill.</p>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Separator />

        <Section label="ui" title="Cards (Icon Slot Variants)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="text-primary mb-2.5"><IconFlashlight size={20} /></div>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Border transitions to gold on hover. Consistent across both themes.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans">Plain surface — bg-card, border-border, no gradient.</p>
              </CardContent>
            </Card>
            <Card accent="gold">
              <CardHeader>
                <div className="text-primary mb-2.5"><IconLock size={20} /></div>
                <CardTitle>Gold Emphasis</CardTitle>
                <CardDescription>Founding member callouts, featured pricing tier, active CTAs.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans">Gold left border + subtle gradient fill from top-left.</p>
              </CardContent>
            </Card>
            <Card accent="rust">
              <CardHeader>
                <div className="text-destructive mb-2.5"><IconCloseCircle size={20} /></div>
                <CardTitle>Rust / Problem</CardTitle>
                <CardDescription>&ldquo;Before&rdquo; comparisons, Zapier cost callouts, error surfaces.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans">Rust left border + rust-tinted gradient fill.</p>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Separator />

        <Section title="Dialog">
          <Dialog>
            <DialogTrigger className={buttonVariants({ variant: 'outline' })}>
              Open Dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm sync</DialogTitle>
                <DialogDescription>
                  This will overwrite your existing sheet data. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose className={buttonVariants({ variant: 'outline' })}>Cancel</DialogClose>
                <Button variant="destructive">Overwrite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        <Separator />

        <Section title="Dropdown Menu">
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: 'outline' })}>
              Open Menu
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sync Now</DropdownMenuItem>
              <DropdownMenuItem>Edit Mapping</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Delete Sheet</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Separator />

        <Section title="Select">
          <div className="w-64">
            <Select>
              <SelectTrigger />
              <SelectContent>
                <SelectItem value="daily">Daily sync</SelectItem>
                <SelectItem value="hourly">Hourly sync</SelectItem>
                <SelectItem value="manual">Manual only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Separator />

        <Section title="Accordion">
          <Accordion>
            <AccordionItem value="a1">
              <AccordionTrigger>What is BulkSheetsSync?</AccordionTrigger>
              <AccordionContent>
                BulkSheetsSync lets you sync Google Sheets with external data sources at scale
                without any code.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="a2">
              <AccordionTrigger>How does billing work?</AccordionTrigger>
              <AccordionContent>
                Monthly billing based on sheets synced. No contracts. Cancel anytime.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        <Separator />

        <Section title="Tooltip & Popover">
          <div className="flex gap-4 flex-wrap">
            <Tooltip>
              <TooltipTrigger className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Hover me
              </TooltipTrigger>
              <TooltipContent>Sync your sheets automatically</TooltipContent>
            </Tooltip>
            <Popover>
              <PopoverTrigger className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Popover
              </PopoverTrigger>
              <PopoverContent>
                <PopoverTitle>Sync settings</PopoverTitle>
                <PopoverDescription>
                  Configure how often your sheet syncs and what triggers an update.
                </PopoverDescription>
              </PopoverContent>
            </Popover>
          </div>
        </Section>

        <Separator />

        <Section title="Terminal Block">
          <TerminalBlock
            title="sync.log"
            lines={[
              { content: '# BulkSheetsSync v2.1.0', variant: 'comment' },
              { content: 'Connecting to Google Sheets API...', variant: 'dim' },
              { content: '✓ Authenticated', variant: 'string' },
              { content: 'Syncing 47 sheets...', variant: 'default' },
              { content: '✓ All sheets synced successfully', variant: 'string' },
            ]}
          />
        </Section>

        <Separator />

        <Section label="pricing" title="Pricing Cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PricingCard
              plan="Starter"
              priceMonthly={0}
              description="For individuals exploring automation."
              features={[
                { text: '5 sheets', included: true },
                { text: 'Daily sync', included: true },
                { text: 'API access', included: false },
              ]}
              ctaLabel="Start free"
            />
            <PricingCard
              plan="Pro"
              badge="Most popular"
              priceMonthly={29}
              priceOriginal={49}
              description="For teams that run on data."
              features={[
                { text: 'Unlimited sheets', included: true },
                { text: 'Hourly sync', included: true },
                { text: 'API access', included: true },
              ]}
              ctaLabel="Start Pro"
              featured
            />
            <PricingCard
              plan="Enterprise"
              priceMonthly={99}
              description="Custom volume, SLA guarantees."
              features={[
                { text: 'Unlimited sheets', included: true },
                { text: 'Real-time sync', included: true },
                { text: 'Priority support', included: true },
              ]}
              ctaLabel="Contact sales"
            />
            <PricingCard
              plan="Agency Master"
              badge="Agency LTD"
              badgeVariant="teal"
              priceMonthly={349}
              priceOriginal={699}
              description="One-time license. Unlimited clients."
              features={[
                { text: 'Unlimited clients', included: true },
                { text: 'White-label reports', included: true },
                { text: 'Priority onboarding', included: true },
              ]}
              ctaLabel="Claim LTD"
              featuredTeal
            />
          </div>
        </Section>

        <Separator />

        <Section label="features" title="Feature Cards">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              title="Automatic import pipeline"
              flowSteps={[
                { label: 'Source' },
                { label: 'Transform', active: true },
                { label: 'Validate' },
                { label: 'Sheet' },
              ]}
              features={[
                { title: 'Column mapping', description: 'drag & drop field alignment' },
                { title: 'Type coercion', description: 'auto-cast dates and numbers' },
              ]}
            />
            <FeatureCard
              title="Real-time conflict resolution"
              flowSteps={[
                { label: 'Edit' },
                { label: 'Detect', active: true },
                { label: 'Merge' },
              ]}
              features={[
                { title: 'Last-write wins', description: 'configurable per column' },
                { title: 'Audit log', description: 'every change tracked' },
              ]}
            />
          </div>
        </Section>

        <Separator />

        <Section label="compare" title="Comparison Grid">
          <ComparisonGrid
            beforeLabel="Manual workflow"
            afterLabel="With BulkSheetsSync"
            rows={[
              {
                key: 'Syncing',
                before: 'Export CSV, copy-paste rows, reformat every week',
                after: 'Sheets update automatically on schedule',
              },
              {
                key: 'Errors',
                before: 'One broken formula breaks the entire report',
                after: 'Validation layer catches errors before they land',
              },
              {
                key: 'Scale',
                before: 'Each new sheet is another manual step',
                after: 'Array-aware — entire payload in one call',
              },
            ]}
          />
        </Section>

        <Separator />

        <Section label="compare" title="Pros / Cons Trap Grid">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-border overflow-hidden">
            <div className="p-[30px] bg-destructive/[0.04] md:border-r border-border">
              <div className="mb-5"><Badge variant="destructive">✕ Native Zapier</Badge></div>
              {[
                { key: 'Architecture',          val: 'Loop action — one task per row, always' },
                { key: '500 Shopify orders',    val: '= 500 tasks consumed' },
                { key: 'Starter cap (750 tasks)',val: 'Blown in a single webhook' },
                { key: 'Required tier for bulk', val: 'Professional ($149/mo) minimum' },
                { key: 'Outbound latency',       val: 'Polling only. Up to 15-min delay.' },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-border last:border-0 font-mono text-[11px] leading-[1.55]">
                  <span className="text-destructive shrink-0">✕</span>
                  <div>
                    <span className="text-muted-foreground text-[9px] uppercase tracking-[.07em] block mb-0.5">{row.key}</span>
                    <span className="text-destructive">{row.val}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-[30px] bg-primary/[0.04]">
              <div className="mb-5"><Badge variant="success">✓ BulkSheetsSync</Badge></div>
              {[
                { key: 'Architecture',          val: 'Array-aware — entire payload, one API call' },
                { key: '500 Shopify orders',    val: '= 1 task consumed' },
                { key: 'Starter cap (750 tasks)',val: '749 tasks remaining after that webhook' },
                { key: 'Required tier for bulk', val: 'Stay on Starter. We handle the bulk.' },
                { key: 'Outbound latency',       val: 'Instant push. Highlight rows → click Push.' },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-border last:border-0 font-mono text-[11px] leading-[1.55]">
                  <span className="text-primary shrink-0">✓</span>
                  <div>
                    <span className="text-muted-foreground text-[9px] uppercase tracking-[.07em] block mb-0.5">{row.key}</span>
                    <span className="text-primary">{row.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Separator />

        <Section label="support" title="FAQ Items">
          <div className="flex flex-col gap-2">
            <FAQItem
              value="faq1"
              question="Does it work with Google Workspace accounts?"
              answer="Yes — BulkSheetsSync works with any Google account including Workspace. OAuth is used for auth, no passwords stored."
            />
            <FAQItem
              value="faq2"
              question="What happens if a sync fails?"
              answer="Failed syncs are retried up to 3 times with exponential backoff. You will receive an email notification and the error will be logged in your dashboard."
            />
            <FAQItem
              value="faq3"
              question="Can I use BulkSheetsSync with multiple Google accounts?"
              answer="Yes. You can connect multiple Google accounts and manage sheets across all of them from a single BSS workspace."
            />
            <FAQItem
              value="faq4"
              question="Is there a limit to how many sheets I can sync?"
              answer="Starter plan includes 5 sheets. Pro and Enterprise plans offer unlimited sheets. Agency LTD includes unlimited clients with no per-sheet caps."
            />
          </div>
        </Section>

        <Separator />

        <Separator />

        <Section label="progress" title="Progress Bars + Rule Callout">
          <div className="max-w-md space-y-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
                <span>Founding spots</span>
                <span>247 / 500</span>
              </div>
              <div className="bg-border h-0.5">
                <div className="h-full bg-primary" style={{ width: '49%' }} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
                <span>Launch progress</span>
                <span>72%</span>
              </div>
              <div className="bg-border h-0.5">
                <div className="h-full bg-primary" style={{ width: '72%' }} />
              </div>
            </div>
          </div>
          <div className="border-l-[3px] border-primary pl-4 mt-5">
            <p className="text-[14px] text-muted-foreground leading-[1.7]">500 rows = 1 Zapier task. Not 500. That is the entire product.</p>
          </div>
        </Section>

        <Separator />

        <Section label="patterns" title="Do / Dont Blocks">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-success/10 border border-success/[0.26]">
              <p className="font-mono text-[9px] uppercase tracking-[.12em] font-semibold text-success mb-2.5">✓ Do</p>
              {[
                'One key word per H1/H2 in gold. Exactly one.',
                'Keep body copy in Barlow 300w — lightness creates hierarchy',
                'Martian Mono for all data, buttons, labels, and nav items',
                'Rust for problems, teal for solutions and confirmations',
                'Fine grid texture — structural, not decorative',
                'CSS variables everywhere — hardcoded values break themes',
              ].map((item, i) => (
                <div key={i} className="flex gap-2.5 mb-1.5">
                  <span className="text-success shrink-0 text-[12px]">✓</span>
                  <p className="text-[12px] text-muted-foreground leading-[1.5]">{item}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-destructive/10 border border-destructive/[0.26]">
              <p className="font-mono text-[9px] uppercase tracking-[.12em] font-semibold text-destructive mb-2.5">✕ Don&apos;t</p>
              {[
                'Use italic type — weight + color does the emphasis work here',
                'Use Inter, DM Sans, Space Grotesk — generic SaaS fonts',
                'Use acid green, purple, or cool blue — competitor territory',
                'Overuse gold — if everything is gold, nothing is',
                'Use dot-grid or noise textures — wrong era, wrong category',
                'Use border-radius above 4px — keep edges tight and precise',
              ].map((item, i) => (
                <div key={i} className="flex gap-2.5 mb-1.5">
                  <span className="text-destructive shrink-0 text-[12px]">✕</span>
                  <p className="text-[12px] text-muted-foreground leading-[1.5]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Separator />

        <Section label="launch" title="Launch Status Timeline">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Timeline */}
            <div>
              {LAUNCH_STEPS.map((step, i) => (
                <div key={i} className="flex gap-4.5 py-4 border-b border-border last:border-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`bss-dot w-5 h-5 flex items-center justify-center font-mono text-[9px] font-semibold ${
                      step.status === 'done'    ? 'bg-primary text-primary-foreground' :
                      step.status === 'active' ? 'border-[1.5px] border-primary text-primary' :
                      'border-[1.5px] border-dim-muted text-dim-muted'
                    }`}>
                      {step.status === 'done' ? '✓' : step.status === 'active' ? '▶' : '○'}
                    </div>
                    {i < LAUNCH_STEPS.length - 1 && (
                      <div className={`w-px flex-1 min-h-4 mt-1 ${step.status === 'done' ? 'bg-primary/[0.28]' : 'bg-border'}`} />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className={`font-mono text-[11px] font-medium mb-1 ${
                      step.status === 'done' ? 'text-foreground' : step.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                    }`}>{step.title}</p>
                    <p className="text-[13px] text-muted-foreground leading-[1.6]">{step.desc}</p>
                    <p className={`font-mono text-[9px] mt-1.5 ${
                      step.status === 'done' ? 'text-dim-muted' : step.status === 'active' ? 'text-primary' : 'text-dim-muted'
                    }`}>{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Signup counter + founding member card */}
            <div>
              <div className="border border-border p-6 bg-background mb-4">
                <p className="font-mono text-[11px] uppercase tracking-[.12em] text-muted-foreground mb-2">Waitlist signups</p>
                <p className="font-display text-[52px] font-extrabold leading-none text-foreground mb-2.5 tracking-[-0.03em]">247</p>
                <div className="bg-border h-0.5 mb-1.5">
                  <div className="h-full bg-primary" style={{ width: '49%' }} />
                </div>
                <div className="flex justify-between font-mono text-[9px] text-dim-muted">
                  <span>0</span>
                  <span>247 / 500 founding spots</span>
                  <span>500</span>
                </div>
              </div>
              <div className="border border-primary/[0.28] p-5 bg-primary/[0.055]">
                <div className="font-mono text-[10px] uppercase tracking-[.12em] text-primary mb-3.5 flex items-center gap-1.5">
                  <IconLock size={14} /> Founding Member Rate
                </div>
                <div className="flex items-baseline gap-3 mb-2.5">
                  <span className="font-mono text-lg text-dim-muted line-through">$79</span>
                  <span className="font-display text-[42px] font-extrabold text-primary leading-none tracking-[-0.03em]">$49</span>
                  <span className="font-mono text-[11px] text-muted-foreground">/yr forever</span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-[1.65]">
                  Locked permanently at signup. <strong className="text-foreground font-medium">No price increases ever apply to founding members.</strong> Includes both modules. No payment until launch.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Separator />

        <Section label="roi" title="ROI Calculator">
          <ROICalculator />
        </Section>

        <Separator />

        <Section label="cta" title="CTA Patterns">
          <div className="mb-8">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[.1em] mb-3">Panel CTA</p>
            <div className="border border-border p-8 text-center max-w-lg">
              <h3 className="font-display text-2xl font-bold tracking-[-0.03em] mb-2">
                Stop paying Zapier<br />for <span className="text-primary">counting rows.</span>
              </h3>
              <p className="text-[13px] text-muted-foreground mb-5">Founding rate: $49/yr, locked permanently. 253 spots remaining.</p>
              <div className="flex max-w-sm mb-3">
                <Input type="email" placeholder="you@company.com" className="flex-1 border-r-0" />
                <Button className="shrink-0">Reserve Spot →</Button>
              </div>
              <p className="font-mono text-[11px] text-dim-muted">No payment now · No spam · <span className="text-primary">Founding rate locked at signup</span></p>
            </div>
          </div>
          <div className="mb-8">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[.1em] mb-3">Sticky CTA Bar (static sample)</p>
            <div className="border border-border bg-card px-5 h-14 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-medium text-foreground">$49/yr → $79 at launch.</p>
                <p className="font-mono text-[10px] text-muted-foreground">Lock founding rate. No payment required.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Input type="email" placeholder="your@email.com" className="w-44 h-9 text-xs" />
                <Button size="sm">Reserve →</Button>
              </div>
            </div>
          </div>
        </Section>

        {/* Full-width section strip — breakout from container */}
        <div className="-mx-6 bg-card border-y border-border">
          <div className="max-w-260 mx-auto px-6 py-12">
            <p className="mb-3 flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-muted-foreground before:text-[12px] before:text-[#7a6a58] before:content-['//']">
              Full-width strip pattern
            </p>
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div>
                <h3 className="font-display text-2xl font-bold tracking-[-0.03em]">
                  Full-width section treatment — breakout strip
                </h3>
                <p className="text-[15px] text-muted-foreground mt-1.5 font-light">
                  bg-card surface + border-y creates landing-page section visual language within the app layout.
                </p>
              </div>
              <Button>Reserve My Spot →</Button>
            </div>
          </div>
        </div>

        <Separator />

        <Section label="iconography" title="Icons">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-0.5">
            {ICONS_DATA.map(({ Icon, name, id, usage, inUse }) => (
              <div
                key={name}
                className="border border-border bg-card overflow-hidden hover:border-primary/[0.28] transition-colors"
              >
                {/* Three-color preview: gold (large), text, muted */}
                <div className="flex items-center gap-3.5 px-4.5 pt-4.5 pb-3.5 border-b border-border">
                  <div className="flex items-center justify-center w-9 h-9 border border-border bg-secondary text-primary shrink-0">
                    <Icon size={32} />
                  </div>
                  <div className="flex items-center justify-center w-9 h-9 border border-border bg-secondary text-foreground shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="flex items-center justify-center w-9 h-9 border border-border bg-secondary text-muted-foreground shrink-0">
                    <Icon size={20} />
                  </div>
                </div>
                {/* Metadata */}
                <div className="px-4.5 pt-3 pb-4">
                  <div className="font-display text-sm font-semibold tracking-[-0.01em] mb-0.5 leading-tight">{name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground mb-1.5">{id}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">{usage}</div>
                  {inUse && (
                    <div className="inline-flex items-center font-mono text-[9px] font-medium uppercase tracking-[.09em] px-1.75 py-0.5 mt-2 text-primary bg-primary/10 border border-primary/[0.28]">
                      In Use
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </main>
      </div>
    </TooltipProvider>
  )
}
