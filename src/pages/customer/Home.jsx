import { useEffect, useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import PageWrapper from '../../components/layout/PageWrapper'
import KitchenCard from '../../components/kitchen/KitchenCard'
import { KitchenCardSkeleton } from '../../components/ui/Skeleton'

export default function Home() {
  const [kitchens, setKitchens] = useState([])
  const [categories, setCategories] = useState([])
  const [kitchenCategories, setKitchenCategories] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [{ data: kitchenData }, { data: catData }, { data: foodData }] = await Promise.all([
      supabase
        .from('kitchens')
        .select('*, reviews(rating)')
        .eq('status', 'approved')
        .eq('is_active', true)
        .eq('city', 'Ahmedabad')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('foods').select('kitchen_id, category_id').eq('is_available', true),
    ])
    setKitchens(kitchenData || [])
    setCategories(catData || [])
    // Build map: kitchenId -> Set of category_ids
    const catMap = {}
    for (const food of foodData || []) {
      if (!catMap[food.kitchen_id]) catMap[food.kitchen_id] = new Set()
      if (food.category_id) catMap[food.kitchen_id].add(food.category_id)
    }
    setKitchenCategories(catMap)
    setLoading(false)
  }

  const filtered = kitchens.filter(k => {
    const matchesSearch = k.kitchen_name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !activeCategory || kitchenCategories[k.id]?.has(activeCategory)
    return matchesSearch && matchesCategory
  })

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-6xl mb-4 animate-bounce">🍱</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-800 mb-3">
            Ghar jaisa khana,{' '}
            <span className="text-primary">ghar pe</span>
          </h1>
          <p className="text-stone-500 text-lg mb-2">Authentic homemade food delivered to your door</p>
          <div className="flex items-center justify-center gap-1.5 text-stone-400 text-sm mb-8">
            <MapPin size={14} className="text-primary" />
            <span>Ahmedabad, Gujarat</span>
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search home kitchens..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/80 border border-orange-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-stone-800 placeholder-stone-400 transition-all"
            />
          </div>
        </div>
      </div>

      <PageWrapper>
        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                !activeCategory
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/70 text-stone-600 border-stone-200 hover:border-primary hover:text-primary'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white/70 text-stone-600 border-stone-200 hover:border-primary hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Kitchen Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-stone-800">
            Home Kitchens
          </h2>
          <span className="text-sm text-stone-400">{filtered.length} kitchens</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => <KitchenCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-stone-500 text-lg">No kitchens found</p>
            <p className="text-stone-400 text-sm mt-1">Try a different search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(kitchen => (
              <KitchenCard key={kitchen.id} kitchen={kitchen} />
            ))}
          </div>
        )}
      </PageWrapper>
    </div>
  )
}
