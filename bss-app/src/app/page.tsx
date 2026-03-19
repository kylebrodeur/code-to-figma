'use client'

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8">
      <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function ShowcasePage() {
  return (
    <TooltipProvider>
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-2">
        <div className="mb-10">
          <StatusPill status="Building now" timeline="Q3 2025" spotsRemaining={253} />
          <h1 className="font-display text-4xl font-bold mt-4">
            BSS <span className="text-primary">Component</span> Library
          </h1>
          <p className="text-muted-foreground font-sans mt-2">
            Design token showcase — dark mode, Base UI primitives, no Radix.
          </p>
        </div>

        <Section title="Stat Blocks">
          <div className="flex gap-10 flex-wrap">
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
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Separator />

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Gold</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="muted">Muted</Badge>
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

        <Section title="Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>No accent border.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans">Card body content.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Cancel
                </Button>
                <Button size="sm">Confirm</Button>
              </CardFooter>
            </Card>
            <Card accent="gold">
              <CardHeader>
                <CardTitle>Gold Accent</CardTitle>
                <CardDescription>Featured item or primary action.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans">Gold left border.</p>
              </CardContent>
            </Card>
            <Card accent="teal">
              <CardHeader>
                <CardTitle>Teal Accent</CardTitle>
                <CardDescription>Synced or verified state.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-sans">Teal left border.</p>
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

        <Section title="Pricing Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </Section>

        <Separator />

        <Section title="Feature Cards">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              title="Automatic import pipeline"
              flowSteps={[
                { label: 'Source' },
                { label: 'Transform' },
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
              flowSteps={[{ label: 'Edit' }, { label: 'Detect' }, { label: 'Merge' }]}
              features={[
                { title: 'Last-write wins', description: 'configurable per column' },
                { title: 'Audit log', description: 'every change tracked' },
              ]}
            />
          </div>
        </Section>

        <Separator />

        <Section title="Comparison Grid">
          <ComparisonGrid
            beforeLabel="Manual workflow"
            afterLabel="With BulkSheetsSync"
            rows={[
              {
                before: 'Export CSV, copy-paste rows, reformat every week',
                after: 'Sheets update automatically on schedule',
              },
              {
                before: 'One broken formula breaks the entire report',
                after: 'Validation layer catches errors before they land',
              },
            ]}
          />
        </Section>

        <Separator />

        <Section title="FAQ Items">
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
        </Section>
      </main>
    </TooltipProvider>
  )
}
