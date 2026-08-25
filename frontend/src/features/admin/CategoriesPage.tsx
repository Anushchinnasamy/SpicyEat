import { AdminLayout } from './AdminLayout'
import { categories } from '../../api/mock/foods'

export function CategoriesPage() {
  return (
    <AdminLayout title="Categories">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <div
            key={cat.slug}
            className="overflow-hidden rounded-2xl border border-admin-border bg-admin-card transition-colors hover:border-white/15"
          >
            <img src={cat.image} alt={cat.name} className="h-32 w-full object-cover" />
            <div className="p-4">
              <p className="font-bold text-admin-text">{cat.name}</p>
              <p className="text-xs text-admin-text2">{cat.itemCount} items</p>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
