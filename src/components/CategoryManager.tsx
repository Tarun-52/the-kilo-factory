'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  FolderPlus,
  Loader2,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryData {
  id: string
  name: string
  icon: string
  description: string | null
  displayOrder: number
  isActive: boolean
  _count?: { items: number }
}

interface CategoryManagerProps {
  onUpdated?: () => void
}

// Common food emojis for quick pick
const FOOD_EMOJIS = [
  '🍽️', '🥘', '🍗', '🍖', '🥩', '🐟', '🍛', '🍚', '🫕', '🥟',
  '🧆', '🥙', '🫔', '🌮', '🌯', '🍕', '🍔', '🥗', '🍜', '🍝',
  '🫓', '🧇', '🥪', '🍰', '🍮', '🧁', '🥧', '🍦', '🧆', '☕',
  '🍵', '🥤', ' shaken', '🫗', '🍯', '🧈', '🥚', '🫒', '🧄', '🌶️',
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CategoryManager({ onUpdated }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create')
  const [editId, setEditId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formIcon, setFormIcon] = useState('🍽️')
  const [formDesc, setFormDesc] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CategoryData | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setCategories(json.categories ?? [])
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  // ── Create / Edit ─────────────────────────────────────────────────

  const openCreate = () => {
    setEditMode('create')
    setEditId(null)
    setFormName('')
    setFormIcon('🍽️')
    setFormDesc('')
    setDialogOpen(true)
  }

  const openEdit = (cat: CategoryData) => {
    setEditMode('edit')
    setEditId(cat.id)
    setFormName(cat.name)
    setFormIcon(cat.icon)
    setFormDesc(cat.description ?? '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Category name is required')
      return
    }
    setSaving(true)
    try {
      const body: Record<string, unknown> = { name: formName.trim(), icon: formIcon, description: formDesc.trim() || null }
      let res: Response

      if (editMode === 'create') {
        res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...body }),
        })
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as Record<string, string>).error ?? 'Failed to save')
      }

      toast.success(editMode === 'create' ? 'Category created!' : 'Category updated!')
      setDialogOpen(false)
      fetchCategories()
      onUpdated?.()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────

  const confirmDelete = (cat: CategoryData) => {
    setDeleteTarget(cat)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as Record<string, string>).error ?? 'Failed to delete')
      }
      toast.success('Category deleted!')
      setDeleteOpen(false)
      fetchCategories()
      onUpdated?.()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  // ── Reorder ───────────────────────────────────────────────────────

  const moveCategory = async (cat: CategoryData, direction: 'up' | 'down') => {
    const idx = categories.findIndex((c) => c.id === cat.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= categories.length) return

    const updated = [...categories]
    const temp = updated[idx].displayOrder
    updated[idx] = { ...updated[idx], displayOrder: updated[swapIdx].displayOrder }
    updated[swapIdx] = { ...updated[swapIdx], displayOrder: temp }
    setCategories(updated)

    try {
      await Promise.all([
        fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: updated[idx].id, displayOrder: updated[idx].displayOrder }),
        }),
        fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: updated[swapIdx].id, displayOrder: updated[swapIdx].displayOrder }),
        }),
      ])
      onUpdated?.()
    } catch {
      toast.error('Failed to reorder')
      fetchCategories()
    }
  }

  // ── Render ────────────────────────────────────────────────────────

  if (loading) {
    return <Card className="border-border shadow-sm"><CardContent className="py-8 text-center text-muted-foreground animate-pulse">Loading categories...</CardContent></Card>
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-royal text-lg font-bold text-bark flex items-center gap-2">
              <FolderPlus className="size-5 text-maroon" />
              Categories
            </h3>
            <Badge variant="secondary">{categories.length} categories</Badge>
          </div>
          <Button size="sm" className="gap-1.5 bg-maroon hover:bg-maroon-light text-ivory text-xs" onClick={openCreate}>
            <Plus className="size-3.5" /> Add Category
          </Button>
        </div>

        {/* Category List */}
        {categories.length === 0 ? (
          <Card className="border-border shadow-sm">
            <CardContent className="py-10 text-center text-muted-foreground">
              <FolderPlus className="size-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No categories yet. Create your first food category.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat, idx) => (
              <Card
                key={cat.id}
                className={`border shadow-sm transition hover:shadow-md ${!cat.isActive ? 'opacity-60 border-red-200' : 'border-border'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0">{cat.icon}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-bark text-sm truncate">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cat._count?.items ?? 0} item{(cat._count?.items ?? 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{cat.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    {/* Reorder buttons */}
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={idx === 0}
                        onClick={() => moveCategory(cat, 'up')}
                      >
                        <ChevronUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={idx === categories.length - 1}
                        onClick={() => moveCategory(cat, 'down')}
                      >
                        <ChevronDown className="size-3.5" />
                      </Button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-maroon hover:bg-maroon/5" onClick={() => openEdit(cat)}>
                        <Pencil className="size-3" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => confirmDelete(cat)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Create / Edit Category Dialog ────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-royal text-lg text-bark">
              {editMode === 'create' ? 'Add New Category' : 'Edit Category'}
            </DialogTitle>
            <DialogDescription>
              {editMode === 'create'
                ? 'Create a new food category (e.g. Kebabs, Biryani, Desserts).'
                : 'Update category details.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Icon picker */}
            <div className="space-y-2">
              <Label>Category Icon</Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-14 h-14 rounded-xl border-2 border-dashed border-border hover:border-maroon flex items-center justify-center text-2xl transition cursor-pointer"
                  >
                    {formIcon}
                  </button>
                </div>
                <div className="flex-1">
                  <Input
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="Paste emoji or pick below"
                    className="h-10"
                  />
                </div>
              </div>

              {/* Emoji quick-pick grid */}
              {showEmojiPicker && (
                <div className="border rounded-lg p-2 bg-muted/30 max-h-36 overflow-y-auto">
                  <div className="grid grid-cols-10 gap-1">
                    {FOOD_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => { setFormIcon(emoji); setShowEmojiPicker(false) }}
                        className="w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-muted transition cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name *</Label>
              <Input
                id="cat-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Kebabs, Biryani, Desserts"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description (optional)</Label>
              <Textarea
                id="cat-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Brief description of this category..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-maroon hover:bg-maroon-light text-ivory">
              {saving ? <><Loader2 className="size-4 mr-2 animate-spin" />Saving...</> : editMode === 'create' ? 'Create Category' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-royal text-lg text-bark">Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              {deleteTarget && (deleteTarget._count?.items ?? 0) > 0 && (
                <span className="block mt-1 text-red-600 font-medium">
                  This category has {(deleteTarget._count?.items ?? 0)} item(s). Delete or move them first.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || ((deleteTarget?._count?.items ?? 0) > 0)}
            >
              {deleting ? <><Loader2 className="size-4 mr-2 animate-spin" />Deleting...</> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}