'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  Settings, 
  Receipt, 
  Tags, 
  Repeat 
} from 'lucide-react'

// 1. Exportamos a lista para ser usada também no Header Mobile
export const navItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Transactions',
    href: '/dashboard/transactions',
    icon: Receipt,
  },
  {
    title: 'Accounts',
    href: '/dashboard/accounts',
    icon: Wallet,
  },
  {
    title: 'Credit Cards',
    href: '/dashboard/credit-cards',
    icon: CreditCard,
  },
  {
    title: 'Recurring',
    href: '/dashboard/recurring',
    icon: Repeat,
  },
  {
    title: 'Loans',
    href: '/dashboard/loans',
    icon: TrendingUp,
  },
  {
    title: 'Categories',
    href: '/dashboard/categories',
    icon: Tags,
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: PieChart,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface DashboardNavProps {
  className?: string
  setOpen?: (open: boolean) => void // Opcional: para fechar o menu mobile ao clicar
}

// 2. Criamos um componente reutilizável apenas com a lógica dos links
export function DashboardNavItems({ className, setOpen }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn("grid items-start gap-2", className)}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (setOpen) setOpen(false)
            }}
            className={cn(
              'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
              isActive ? 'bg-accent text-accent-foreground' : 'transparent',
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </div>
  )
}

// 3. O componente principal da Sidebar Desktop
export function DashboardNav() {
  return (
    // 'hidden lg:block' garante que essa sidebar suma no mobile e apareça no desktop
    <nav className="hidden lg:block w-64 border-r bg-muted/40 min-h-[calc(100vh-4rem)]">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <DashboardNavItems />
          </div>
        </div>
      </div>
    </nav>
  )
}