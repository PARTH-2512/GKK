import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Upload, ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PageWrapper from '../../components/layout/PageWrapper'
import Modal from '../../components/ui/Modal'
import Input, { Textarea } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { formatCurrency } from '../../utils/formatters'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', description: '', price: '', category_id: '',
  quantity_available: 0, is_available: true, image_url: '',
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function ManageMenu() {
  const { profile } = useAuth()
  const [kitchen, setKitchen] = useState(null)
  const [foods, setFoods] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editFood, setEditFood] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => { if (profile) fetchData() }, [profile])

  const fetchData = async () => {
    const { data: k } = await supabase.from('kitchens').select('*').eq('owner_id', profile.id).single()
    if (!k) { setPageLoading(false); return }
    setKitchen(k)
    const [{ data: f }, { data: c }] = await Promise.all([
      supabase.from('foods').select('*, categories(name)').eq('kitchen_id', k.id).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ])
    setFoods(f || [])
    setCategories(c || [])
    setPageLoading(false)
  }

  const openAdd = () => {
    setEditFood(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setShowModal(true)
  }

  const openEdit = (food) => {
    setEditFood(food)
    setForm({
      name: food.name,
      description: food.description || '',
      price: food.price,
      category_id: food.category_id || '',
      quantity_available: food.quantity_available,
      is_available: food.is_available,
      image_url: food.image_url || '',
    })
    setImageFile(null)
    setImagePreview(food.image_url || null)
    setShowModal(true)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP images are allowed')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      e.target.value = ''
      return
    }

    setImageFile(file)
    // Show local preview immediately
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async () => {
    if (!imageFile) return form.image_url || null

    setUploading(true)
    try {
      const filePath = `foods/${Date.now()}-${imageFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: imageFile.type,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('food-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.price || parseFloat(form.price) <= 0) return toast.error('Valid price is required')

    setSaving(true)
    try {
      const imageUrl = await uploadImage()
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category_id: form.category_id || null,
        quantity_available: parseInt(form.quantity_available) || 0,
        is_available: form.is_available,
        image_url: imageUrl,
      }

      if (editFood) {
        const { error } = await supabase.from('foods').update(payload).eq('id', editFood.id)
        if (error) throw error
        toast.success('Food updated!')
      } else {
        const { error } = await supabase.from('foods').insert({ ...payload, kitchen_id: kitchen.id })
        if (error) throw error
        toast.success('Food added!')
      }

      setShowModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailability = async (food) => {
    const { error } = await supabase.from('foods').update({ is_available: !food.is_available }).eq('id', food.id)
    if (error) {
      toast.error(error.message)
    } else {
      setFoods(prev => prev.map(f => f.id === food.id ? { ...f, is_available: !f.is_available } : f))
      toast.success(food.is_available ? 'Marked unavailable' : 'Marked available')
    }
  }

  const deleteFood = async (food) => {
    if (!confirm(`Delete "${food.name}"?`)) return

    // Check if this food is referenced in any order_items
    const { count } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('food_id', food.id)

    if (count > 0) {
      // Soft delete — hide from menu but keep for order history
      const { error } = await supabase.from('foods').update({ is_available: false }).eq('id', food.id)
      if (error) {
        toast.error(error.message)
      } else {
        setFoods(prev => prev.map(f => f.id === food.id ? { ...f, is_available: false } : f))
        toast('Item hidden from menu — it exists in past orders so it cannot be fully deleted.', {
          icon: 'ℹ️',
          duration: 5000,
        })
      }
      return
    }

    // Safe to hard delete — no order references
    const { error } = await supabase.from('foods').delete().eq('id', food.id)
    if (error) {
      toast.error(error.message)
    } else {
      setFoods(prev => prev.filter(f => f.id !== food.id))
      toast.success('Item deleted')
    }
  }

  if (pageLoading) return (
    <PageWrapper>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => <div key={i} className="glass-card h-52 skeleton" />)}
      </div>
    </PageWrapper>
  )

  if (!kitchen) return (
    <PageWrapper>
      <div className="text-center py-20 text-stone-400">No kitchen found. Please set up your kitchen first.</div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-stone-800">Manage Menu</h1>
        <Button onClick={openAdd}><Plus size={16} className="mr-1" /> Add Item</Button>
      </div>

      {foods.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-stone-500 mb-4">No menu items yet</p>
          <Button onClick={openAdd}>Add Your First Item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map(food => (
            <div key={food.id} className={`glass-card p-0 overflow-hidden ${!food.is_available ? 'opacity-60' : ''}`}>
              <div className="h-36 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center relative overflow-hidden">
                {food.image_url
                  ? <img src={food.image_url} alt={food.name} className="w-full h-full object-cover" />
                  : <span className="text-4xl">🍽️</span>
                }
                {!food.is_available && (
                  <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                    <span className="text-white text-xs font-medium bg-stone-800/80 px-2 py-1 rounded-full">Hidden</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => openEdit(food)}
                    className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => deleteFood(food)}
                    className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{food.name}</p>
                    <p className="text-xs text-stone-400">{food.categories?.name}</p>
                  </div>
                  <span className="font-mono font-semibold text-primary text-sm">{formatCurrency(food.price)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-stone-400">Qty: {food.quantity_available}</span>
                  <button
                    onClick={() => toggleAvailability(food)}
                    className={`flex items-center gap-1 text-xs font-medium transition-colors ${food.is_available ? 'text-green-600' : 'text-stone-400'}`}
                  >
                    {food.is_available
                      ? <ToggleRight size={18} className="text-green-500" />
                      : <ToggleLeft size={18} />
                    }
                    {food.is_available ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { if (!saving && !uploading) setShowModal(false) }}
        title={editFood ? 'Edit Food Item' : 'Add Food Item'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Price (₹) *"
              type="number"
              min="1"
              step="0.01"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>

          <Textarea
            label="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2}
            placeholder="Describe the dish..."
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700">Category</label>
              <select
                className="input-field"
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input
              label="Quantity Available"
              type="number"
              min="0"
              value={form.quantity_available}
              onChange={e => setForm({ ...form, quantity_available: e.target.value })}
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-stone-700">Food Image</label>
            <label className={`flex items-center gap-3 cursor-pointer border-2 border-dashed rounded-xl p-4 transition-colors ${uploading ? 'border-orange-300 bg-orange-50/50' : 'border-orange-200 hover:border-primary'}`}>
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-primary">Uploading image...</span>
                </>
              ) : (
                <>
                  <Upload size={18} className="text-stone-400 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-stone-600">
                      {imageFile ? imageFile.name : 'Click to upload image'}
                    </span>
                    <p className="text-xs text-stone-400 mt-0.5">JPG, PNG, WebP · Max 5MB</p>
                  </div>
                </>
              )}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageSelect}
                disabled={uploading || saving}
              />
            </label>

            {/* Preview */}
            {imagePreview && (
              <div className="relative w-24 h-24">
                <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover rounded-xl border border-orange-100" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(editFood?.image_url || null); setForm(f => ({ ...f, image_url: editFood?.image_url || '' })) }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="avail"
              checked={form.is_available}
              onChange={e => setForm({ ...form, is_available: e.target.checked })}
              className="w-4 h-4 accent-orange-500"
            />
            <label htmlFor="avail" className="text-sm text-stone-700">Available for order</label>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setShowModal(false)}
              disabled={saving || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving || uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : saving ? 'Saving...' : editFood ? 'Update' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
