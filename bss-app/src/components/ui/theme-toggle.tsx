'use client'

import { Switch } from '@base-ui/react/switch'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function handleCheckedChange(checked: boolean) {
    setIsDark(checked)
    document.documentElement.classList.toggle('dark', checked)
    try {
      localStorage.setItem('theme', checked ? 'dark' : 'light')
    } catch (_) {}
  }

  return (
    <label
      className={cn(
        'flex items-center gap-2 border border-border px-3 py-[5px] cursor-pointer',
        'font-mono text-[10px] tracking-[0.05em] text-muted-foreground',
        'hover:border-primary/40 hover:text-primary transition-colors',
      )}
    >
      <Switch.Root
        checked={isDark}
        onCheckedChange={handleCheckedChange}
        aria-label="Toggle theme"
        className="relative flex items-center h-[13px] w-[26px] bg-input shrink-0 cursor-pointer outline-none"
      >
        <Switch.Thumb className="absolute top-[2px] left-[2px] h-[9px] w-[9px] bg-muted-foreground transition-transform data-[checked]:translate-x-[13px] data-[checked]:bg-primary" />
      </Switch.Root>
      <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </label>
  )
}
