import { useEffect, useState } from 'react'
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PageWrapper from '../../components/layout/PageWrapper'
import { formatCurrency } from '../../utils/formatters'
import toast from 'react-hot-toast'

export default function ManageFoods() {
  const { profile } = useAuth()
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('foods').select('*, kitchens(kitchen_name), categories(name)').order('created_at', { ascending: false })
      .then(({ data }) => { setFoods(data || []); setLoading(false) })
  }, [])

  const toggleAvailability = async (food) => {
    const { error } = await supabase.from('foods').update({ is_available: !food.is_available }).eq('id', food.id)
    if (error) { toast.error(error.message); return }
    await supabase.from('admin_logs').insert({ admin_id: profile.id, action: food.is_available ? 'disabled_food' : 'enabled_food', target_type: 'food', target_id: food.id })
    setFoods(prev => prev.map(f => f.id === food.id ? { ...f, is_available: !f.is_available } : f))
    toast.success('Updated')
  }

  const deleteFood = async (food) => {
    if (!confirm(`Delete "${food.name}"? This cannot be undone.`)) return

    // Check if referenced in orders
    const { count } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('food_id', food.id)

    if (count > 0) {
      // Soft delete — hide from menu
      const { error } = await supabase.from('foods').update({ is_available: false }).eq('id', food.id)
      if (error) { toast.error(error.message); return }
      await supabase.from('admin_logs').insert({ admin_id: profile.id, action: 'soft_deleted_food', target_type: 'food', target_id: food.id })
      setFoods(prev => prev.map(f => f.id === food.id ? { ...f, is_available: false } : f))
      toast('Item hidden — it has past orders so cannot be fully deleted.', { icon: 'ℹ️', duration: 5000 })
      return
    }

    const { error } = await supabase.from('foods').delete().eq('id', food.id)
    if (error) { toast.error(error.message); return }
    await supabase.from('admin_logs').insert({ admin_id: profile.id, action: 'deleted_food', target_type: 'food', target_id: food.id })
    setFoods(prev => prev.filter(f => f.id !== food.id))
    toast.success('Food item deleted')
  }

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl font-bold text-stone-800 mb-6">Manage Foods</h1>
      {loading ? <div className="text-center py-10 text-stone-400">Loading...</div> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50/80">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium">Food</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium hidden sm:table-cell">Kitchen</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-stone-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {foods.map(food => (
                  <tr key={food.id} className="border-t border-stone-100 hover:bg-stone-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {food.image_url ? <img src={food.image_url} alt={food.name} className="w-8 h-8 rounded-lg object-cover" onError={e => { e.target.onerror = null; e.target.src = '' ; e.target.style.display = 'none' }} /> : <span className="text-xl">🍽️</span>}
                        <span className="font-medium text-stone-800">{food.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-500 hidden sm:table-cell">{food.kitchens?.kitchen_name}</td>
                    <td className="px-4 py-3 text-stone-400 hidden md:table-cell">{food.categories?.name || '—'}</td>
                    <td className="px-4 py-3 font-mono text-primary">{formatCurrency(food.price)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAvailability(food)} className={`flex items-center gap-1 text-xs font-medium transition-colors ${food.is_available ? 'text-green-600' : 'text-stone-400'}`}>
                        {food.is_available ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                        {food.is_available ? 'Available' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteFood(food)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete food item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
