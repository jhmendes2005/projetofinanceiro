'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

export function TransactionsFilters() {
  return (
    // Alteração 1: md:flex-row (quebra em 768px em vez de 640px para dar mais espaço)
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-9 w-full"
        />
      </div>
      
      {/* Dica de Layout Mobile:
         Se quiser que os filtros fiquem lado a lado no celular (em vez de empilhados),
         você pode envolver estes dois Selects em uma div com className="flex gap-4"
      */}
      
      <Select defaultValue="all">
        {/* Alteração 2: w-full no mobile, w-[180px] no desktop */}
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all-time">
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-time">All Time</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="last-month">Last Month</SelectItem>
          <SelectItem value="this-year">This Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}