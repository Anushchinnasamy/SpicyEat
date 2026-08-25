import { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { Modal } from '../../components/layout/Modal'
import { ConfirmDialog } from '../../components/layout/ConfirmDialog'
import { Button } from '../../components/buttons/Button'
import { Input } from '../../components/forms/Input'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { categories } from '../../api/mock/foods'
import {
  fetchAdminFoods,
  createFood,
  updateFood,
  deleteFood,
  type FoodInput,
} from '../../api/adminMenu'
import type { CategorySlug, Food, SpiceLevel } from '../../types'

const EMPTY_FORM: FoodInput = {
  name: '',
  tagline: '',
  description: '',
  categorySlug: 'burgers',
  price: 0,
  spiceLevel: 1,
  isVeg: false,
  bestseller: false,
  image: '',
}

export function MenuManagementPage() {
  const [foods, setFoods] = useState<Food[] | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategorySlug | 'all'>('all')
  const [vegOnly, setVegOnly] = useState(false)
  const [bestsellerOnly, setBestsellerOnly] = useState(false)
  const [maxSpice, setMaxSpice] = useState<SpiceLevel>(4)

  const [editing, setEditing] = useState<Food | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<FoodInput>(EMPTY_FORM)
  const [deleting, setDeleting] = useState<Food | null>(null)
  const [saving, setSaving] = useState(false)

  function load() {
    fetchAdminFoods().then((res) => setFoods(res.data))
  }

  useEffect(load, [])

  const filtered = useMemo(() => {
    if (!foods) return []
    return foods.filter((f) => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
      if (category !== 'all' && f.categorySlug !== category) return false
      if (vegOnly && !f.isVeg) return false
      if (bestsellerOnly && !f.bestseller) return false
      if (f.spiceLevel > maxSpice) return false
      return true
    })
  }, [foods, search, category, vegOnly, bestsellerOnly, maxSpice])

  function openAdd() {
    setForm(EMPTY_FORM)
    setShowAdd(true)
  }

  function openEdit(food: Food) {
    setForm({
      name: food.name,
      tagline: food.tagline,
      description: food.description,
      categorySlug: food.categorySlug,
      price: food.price,
      spiceLevel: food.spiceLevel,
      isVeg: food.isVeg,
      bestseller: food.bestseller,
      image: food.images[0] ?? '',
    })
    setEditing(food)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (editing) {
      await updateFood(editing.id, form)
    } else {
      await createFood(form)
    }
    setSaving(false)
    setEditing(null)
    setShowAdd(false)
    load()
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteFood(deleting.id)
    setDeleting(null)
    load()
  }

  const formOpen = showAdd || editing !== null

  return (
    <AdminLayout title="Menu">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[180px] flex-1 rounded-full border border-admin-border bg-admin-card px-4 py-2 text-sm text-admin-text outline-none placeholder:text-admin-muted focus:border-admin-orange"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CategorySlug | 'all')}
          className="rounded-full border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={maxSpice}
          onChange={(e) => setMaxSpice(Number(e.target.value) as SpiceLevel)}
          className="rounded-full border border-admin-border bg-admin-card px-3 py-2 text-sm text-admin-text"
        >
          <option value={1}>Max: Mild</option>
          <option value={2}>Max: Hot</option>
          <option value={3}>Max: Fire</option>
          <option value={4}>Max: Insane</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm font-medium text-admin-text2">
          <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} className="h-4 w-4 accent-admin-success" />
          Veg only
        </label>
        <label className="flex items-center gap-1.5 text-sm font-medium text-admin-text2">
          <input
            type="checkbox"
            checked={bestsellerOnly}
            onChange={(e) => setBestsellerOnly(e.target.checked)}
            className="h-4 w-4 accent-admin-orange"
          />
          Bestsellers
        </label>
        <Button type="button" onClick={openAdd} className="ml-auto">
          + Add Item
        </Button>
      </div>

      {foods === null && <LoadingState />}
      {foods && filtered.length === 0 && (
        <EmptyState title="Nothing hit the spot." subtitle="No menu items match these filters." />
      )}

      {foods && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-xs font-semibold uppercase tracking-wide text-admin-text2">
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Spice</th>
                <th className="px-5 py-3">Veg</th>
                <th className="px-5 py-3">Bestseller</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filtered.map((food) => (
                <tr key={food.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="flex items-center gap-3 px-5 py-3">
                    <img src={food.images[0]} alt={food.name} className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-semibold text-admin-text">{food.name}</span>
                  </td>
                  <td className="px-5 py-3 capitalize text-admin-text2">{food.categorySlug.replace(/-/g, ' ')}</td>
                  <td className="px-5 py-3 font-semibold text-admin-text">₹{food.price}</td>
                  <td className="px-5 py-3">{'🌶️'.repeat(food.spiceLevel)}</td>
                  <td className="px-5 py-3">{food.isVeg ? '✅' : '—'}</td>
                  <td className="px-5 py-3">{food.bestseller ? '🔥' : '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(food)}
                        className="rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-admin-text2 transition-colors hover:border-admin-orange hover:text-admin-orange-bright"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(food)}
                        className="rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-admin-danger transition-colors hover:border-admin-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <Modal
          title={editing ? 'Edit Item' : 'Add Item'}
          onClose={() => {
            setShowAdd(false)
            setEditing(null)
          }}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input
              variant="dark"
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              variant="dark"
              label="Tagline"
              required
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
            <label className="flex flex-col gap-1.5 text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-admin-text2">Description</span>
              <textarea
                required
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-2xl border border-admin-border bg-admin-bg2 px-4 py-3 text-sm text-admin-text outline-none focus:border-admin-orange"
              />
            </label>
            <Input
              variant="dark"
              label="Image URL"
              placeholder="/images/burgers/..."
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-admin-text2">Category</span>
                <select
                  value={form.categorySlug}
                  onChange={(e) => setForm({ ...form, categorySlug: e.target.value as CategorySlug })}
                  className="rounded-2xl border border-admin-border bg-admin-bg2 px-4 py-3 text-sm text-admin-text"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-admin-text2">Spice level</span>
                <select
                  value={form.spiceLevel}
                  onChange={(e) => setForm({ ...form, spiceLevel: Number(e.target.value) as SpiceLevel })}
                  className="rounded-2xl border border-admin-border bg-admin-bg2 px-4 py-3 text-sm text-admin-text"
                >
                  <option value={1}>Mild</option>
                  <option value={2}>Hot</option>
                  <option value={3}>Fire</option>
                  <option value={4}>Insane</option>
                </select>
              </label>
            </div>

            <Input
              variant="dark"
              label="Price (₹)"
              type="number"
              required
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-admin-text2">
                <input
                  type="checkbox"
                  checked={form.isVeg}
                  onChange={(e) => setForm({ ...form, isVeg: e.target.checked })}
                  className="h-4 w-4 accent-admin-success"
                />
                Vegetarian
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-admin-text2">
                <input
                  type="checkbox"
                  checked={form.bestseller}
                  onChange={(e) => setForm({ ...form, bestseller: e.target.checked })}
                  className="h-4 w-4 accent-admin-orange"
                />
                Bestseller
              </label>
            </div>

            <div className="mt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline-dark"
                onClick={() => {
                  setShowAdd(false)
                  setEditing(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Item'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete menu item"
          message={`Remove "${deleting.name}" from the menu? This can't be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </AdminLayout>
  )
}
