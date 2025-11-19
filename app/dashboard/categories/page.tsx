import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CategoriesList } from '@/components/categories/categories-list'
import { AddCategoryDialog } from '@/components/categories/add-category-dialog'

export default async function CategoriesPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your transaction categories
          </p>
        </div>
        <AddCategoryDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </AddCategoryDialog>
      </div>

      <CategoriesList userId={user.id} />
    </div>
  )
}
