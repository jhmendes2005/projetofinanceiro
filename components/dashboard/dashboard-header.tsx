'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// UI Components
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription, // Adicionado para acessibilidade
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Icons
import { 
  Menu, 
  LayoutDashboard, 
  CreditCard, 
  Wallet, 
  Settings, 
  LogOut, 
  TrendingUp, 
  PieChart, 
  Receipt, 
  Tags, 
  Repeat 
} from 'lucide-react'

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

export function DashboardHeader({ user }: { user: User }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowserClient()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // CORREÇÃO: Tratamento seguro para evitar erro se email for undefined
  const getInitials = () => {
    const emailName = user.email?.split('@')[0] || 'User'
    return emailName.substring(0, 2).toUpperCase()
  }

  const initials = getInitials()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          
          {/* Botão do Menu Mobile (Controlado manualmente) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-2"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="w-[250px] sm:w-[300px] z-[100]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 mb-4">
                   <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">F</span>
                  </div>
                  Finance Dashboard
                </SheetTitle>
                <SheetDescription className="sr-only">
                    Mobile navigation menu
                </SheetDescription>
              </SheetHeader>
              
              <nav className="flex flex-col gap-2 mt-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  // Melhora a lógica de "ativo" para incluir sub-rotas se necessário, ou mantém exato
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title} {/* Corrigido de item.label para item.title conforme o array navItems */}
                    </Link>
                  )
                })}
                
                <div className="mt-auto pt-4 border-t">
                   <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo / Title Desktop */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                F
              </span>
            </div>
            <span className="font-semibold text-lg hidden sm:inline">
              Finance Dashboard
            </span>
          </div>
        </div>

        {/* User Dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-visible:ring-0">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 z-[100]">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">
                  {user.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer w-full flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}