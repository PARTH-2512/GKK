/**
 * Ghar Ka Khana — Seed Script
 * Run: node scripts/seed.js
 *
 * This script:
 * 1. Creates demo auth users
 * 2. Inserts user profiles
 * 3. Creates a demo kitchen (approved)
 * 4. Seeds categories
 * 5. Seeds 10 food items
 * 6. Creates demo orders with items
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vdjbgnizunydtgvlkuxy.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ Missing SUPABASE_SERVICE_ROLE_KEY env variable.')
  console.error('Run: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed.js\n')
  process.exit(1)
}

// Use service role client — bypasses RLS for seeding
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const DEMO_ACCOUNTS = [
  { email: 'kitchen_demo@example.com', password: 'Demo@123', name: 'Meena Patel', role: 'cook', phone: '+91 98765 00001' },
  { email: 'customer1_demo@example.com', password: 'Demo@123', name: 'Rahul Shah', role: 'customer', phone: '+91 98765 00002' },
  { email: 'customer2_demo@example.com', password: 'Demo@123', name: 'Priya Desai', role: 'customer', phone: '+91 98765 00003' },
  { email: 'admin_demo@example.com', password: 'Demo@123', name: 'Admin User', role: 'admin', phone: '+91 98765 00004' },
]

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Sweets', 'Beverages']

const FOOD_ITEMS = [
  { name: 'Dal Baati Churma', description: 'Traditional Rajasthani dal with baked baati and sweet churma', price: 180, category: 'Dinner', quantity_available: 20 },
  { name: 'Gujarati Thali', description: 'Full thali with dal, sabzi, roti, rice, kadhi, and papad', price: 220, category: 'Lunch', quantity_available: 15 },
  { name: 'Poha', description: 'Light and fluffy flattened rice with peanuts, curry leaves and lemon', price: 60, category: 'Breakfast', quantity_available: 30 },
  { name: 'Methi Thepla', description: 'Soft fenugreek flatbreads, perfect for breakfast or travel', price: 80, category: 'Breakfast', quantity_available: 25 },
  { name: 'Undhiyu', description: 'Classic Gujarati winter mixed vegetable dish cooked in earthen pot', price: 160, category: 'Lunch', quantity_available: 10 },
  { name: 'Khaman Dhokla', description: 'Soft and spongy steamed gram flour snack with green chutney', price: 70, category: 'Snacks', quantity_available: 40 },
  { name: 'Shrikhand', description: 'Creamy strained yogurt dessert with saffron and cardamom', price: 90, category: 'Sweets', quantity_available: 20 },
  { name: 'Masala Chai', description: 'Aromatic spiced tea with ginger, cardamom and fresh milk', price: 30, category: 'Beverages', quantity_available: 50 },
  { name: 'Handvo', description: 'Savory baked lentil and vegetable cake, a Gujarati specialty', price: 100, category: 'Snacks', quantity_available: 15 },
  { name: 'Mohanthal', description: 'Rich gram flour fudge with ghee, saffron and dry fruits', price: 120, category: 'Sweets', quantity_available: 25 },
  { name: 'Kadhi Khichdi', description: 'Comforting rice and lentil porridge with tangy yogurt kadhi', price: 140, category: 'Dinner', quantity_available: 18 },
  { name: 'Fafda Jalebi', description: 'Crispy gram flour strips with sweet jalebis — classic Gujarati combo', price: 80, category: 'Breakfast', quantity_available: 30 },
]

async function createOrGetUser(account) {
  // Try to create; if exists, fetch
  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
  })

  if (error) {
    if (error.message.includes('already been registered') || error.message.includes('already exists')) {
      // Fetch existing user
      const { data: list } = await supabase.auth.admin.listUsers()
      const existing = list?.users?.find(u => u.email === account.email)
      if (existing) {
        console.log(`  ↩ User already exists: ${account.email}`)
        return existing
      }
    }
    throw new Error(`Auth create failed for ${account.email}: ${error.message}`)
  }

  console.log(`  ✅ Created auth user: ${account.email}`)
  return data.user
}

async function run() {
  console.log('\n🍱 Ghar Ka Khana — Seed Script Starting...\n')

  // ── 1. Create auth users + profiles ──────────────────────────────────────
  console.log('👤 Creating demo accounts...')
  const userMap = {}

  for (const account of DEMO_ACCOUNTS) {
    const authUser = await createOrGetUser(account)
    userMap[account.role] = userMap[account.role] || authUser.id
    // Store all by email for reference
    userMap[account.email] = authUser.id

    // Upsert profile
    const { error: profileErr } = await supabase.from('users').upsert({
      id: authUser.id,
      name: account.name,
      phone: account.phone,
      role: account.role,
      is_banned: false,
    }, { onConflict: 'id' })

    if (profileErr) {
      console.error(`  ❌ Profile upsert failed for ${account.email}:`, profileErr.message)
    } else {
      console.log(`  ✅ Profile ready: ${account.name} (${account.role})`)
    }
  }

  const cookId = userMap['kitchen_demo@example.com']
  const customer1Id = userMap['customer1_demo@example.com']
  const customer2Id = userMap['customer2_demo@example.com']

  // ── 2. Seed categories ────────────────────────────────────────────────────
  console.log('\n🏷️  Seeding categories...')
  const { data: existingCats } = await supabase.from('categories').select('name')
  const existingNames = new Set((existingCats || []).map(c => c.name))

  const newCats = CATEGORIES.filter(n => !existingNames.has(n)).map(name => ({ name }))
  if (newCats.length > 0) {
    const { error } = await supabase.from('categories').insert(newCats)
    if (error) console.error('  ❌ Categories error:', error.message)
    else console.log(`  ✅ Inserted ${newCats.length} categories`)
  } else {
    console.log('  ↩ Categories already exist')
  }

  const { data: allCats } = await supabase.from('categories').select('*')
  const catMap = Object.fromEntries(allCats.map(c => [c.name, c.id]))

  // ── 3. Create kitchen ─────────────────────────────────────────────────────
  console.log('\n🏠 Setting up demo kitchen...')
  let kitchenId

  const { data: existingKitchen } = await supabase
    .from('kitchens')
    .select('id')
    .eq('owner_id', cookId)
    .single()

  if (existingKitchen) {
    kitchenId = existingKitchen.id
    // Make sure it's approved
    await supabase.from('kitchens').update({ status: 'approved', is_active: true }).eq('id', kitchenId)
    console.log('  ↩ Kitchen already exists, ensured approved')
  } else {
    const { data: kitchen, error } = await supabase.from('kitchens').insert({
      owner_id: cookId,
      kitchen_name: "Meena's Ghar Ka Khana",
      description: 'Authentic Gujarati home cooking made with love. Fresh ingredients, traditional recipes passed down through generations.',
      address: 'B-12, Satellite Road, Near Jodhpur Cross Roads',
      city: 'Ahmedabad',
      status: 'approved',
      is_active: true,
    }).select().single()

    if (error) {
      console.error('  ❌ Kitchen error:', error.message)
      process.exit(1)
    }
    kitchenId = kitchen.id
    console.log('  ✅ Kitchen created and approved:', kitchen.kitchen_name)
  }

  // ── 4. Seed food items ────────────────────────────────────────────────────
  console.log('\n🍽️  Seeding food items...')
  const { data: existingFoods } = await supabase.from('foods').select('name').eq('kitchen_id', kitchenId)
  const existingFoodNames = new Set((existingFoods || []).map(f => f.name))

  const foodsToInsert = FOOD_ITEMS
    .filter(f => !existingFoodNames.has(f.name))
    .map(f => ({
      kitchen_id: kitchenId,
      category_id: catMap[f.category] || null,
      name: f.name,
      description: f.description,
      price: f.price,
      quantity_available: f.quantity_available,
      is_available: true,
      image_url: null,
    }))

  if (foodsToInsert.length > 0) {
    const { error } = await supabase.from('foods').insert(foodsToInsert)
    if (error) console.error('  ❌ Foods error:', error.message)
    else console.log(`  ✅ Inserted ${foodsToInsert.length} food items`)
  } else {
    console.log('  ↩ Food items already exist')
  }

  const { data: allFoods } = await supabase.from('foods').select('*').eq('kitchen_id', kitchenId)

  // ── 5. Seed demo orders ───────────────────────────────────────────────────
  console.log('\n📦 Seeding demo orders...')

  const demoOrders = [
    {
      customer_id: customer1Id,
      status: 'completed',
      delivery_address: 'A-5, Vastrapur Lake Road, Ahmedabad',
      daysAgo: 5,
      items: [
        { food: 'Gujarati Thali', qty: 2 },
        { food: 'Masala Chai', qty: 2 },
      ],
    },
    {
      customer_id: customer1Id,
      status: 'completed',
      delivery_address: 'A-5, Vastrapur Lake Road, Ahmedabad',
      daysAgo: 3,
      items: [
        { food: 'Dal Baati Churma', qty: 1 },
        { food: 'Shrikhand', qty: 2 },
      ],
    },
    {
      customer_id: customer1Id,
      status: 'preparing',
      delivery_address: 'A-5, Vastrapur Lake Road, Ahmedabad',
      daysAgo: 0,
      items: [
        { food: 'Khaman Dhokla', qty: 2 },
        { food: 'Fafda Jalebi', qty: 1 },
      ],
    },
    {
      customer_id: customer2Id,
      status: 'completed',
      delivery_address: 'C-22, Bodakdev, Near ISCON Temple, Ahmedabad',
      daysAgo: 7,
      items: [
        { food: 'Undhiyu', qty: 1 },
        { food: 'Methi Thepla', qty: 3 },
      ],
    },
    {
      customer_id: customer2Id,
      status: 'completed',
      delivery_address: 'C-22, Bodakdev, Near ISCON Temple, Ahmedabad',
      daysAgo: 2,
      items: [
        { food: 'Poha', qty: 2 },
        { food: 'Masala Chai', qty: 3 },
      ],
    },
    {
      customer_id: customer2Id,
      status: 'cancelled',
      delivery_address: 'C-22, Bodakdev, Near ISCON Temple, Ahmedabad',
      daysAgo: 4,
      items: [
        { food: 'Mohanthal', qty: 1 },
      ],
    },
    {
      customer_id: customer1Id,
      status: 'accepted',
      delivery_address: 'A-5, Vastrapur Lake Road, Ahmedabad',
      daysAgo: 0,
      items: [
        { food: 'Kadhi Khichdi', qty: 2 },
        { food: 'Handvo', qty: 1 },
      ],
    },
  ]

  const foodNameMap = Object.fromEntries(allFoods.map(f => [f.name, f]))

  for (const order of demoOrders) {
    // Calculate total
    const total = order.items.reduce((sum, i) => {
      const food = foodNameMap[i.food]
      return sum + (food ? food.price * i.qty : 0)
    }, 0)

    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - order.daysAgo)
    createdAt.setHours(Math.floor(Math.random() * 12) + 8) // 8am-8pm

    const { data: newOrder, error: orderErr } = await supabase.from('orders').insert({
      customer_id: order.customer_id,
      kitchen_id: kitchenId,
      total_price: total,
      delivery_address: order.delivery_address,
      status: order.status,
      created_at: createdAt.toISOString(),
    }).select().single()

    if (orderErr) {
      console.error('  ❌ Order error:', orderErr.message)
      continue
    }

    const orderItems = order.items
      .map(i => {
        const food = foodNameMap[i.food]
        if (!food) return null
        return { order_id: newOrder.id, food_id: food.id, quantity: i.qty, price: food.price }
      })
      .filter(Boolean)

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
    if (itemsErr) console.error('  ❌ Order items error:', itemsErr.message)
    else console.log(`  ✅ Order [${order.status}] for ${order.customer_id === customer1Id ? 'Rahul' : 'Priya'} — ₹${total}`)
  }

  // ── 6. Seed reviews ───────────────────────────────────────────────────────
  console.log('\n⭐ Seeding reviews...')

  const reviews = [
    { customer_id: customer1Id, rating: 5, comment: 'Absolutely amazing! The Gujarati Thali was just like my grandmother used to make. Will order again!' },
    { customer_id: customer2Id, rating: 4, comment: 'Undhiyu was delicious and authentic. Delivery was on time. Highly recommend!' },
  ]

  for (const review of reviews) {
    const { error } = await supabase.from('reviews').upsert({
      customer_id: review.customer_id,
      kitchen_id: kitchenId,
      rating: review.rating,
      comment: review.comment,
    }, { onConflict: 'customer_id,kitchen_id' })

    if (error) console.error('  ❌ Review error:', error.message)
    else console.log(`  ✅ Review (${review.rating}★) added`)
  }

  // ── 7. Admin log entry ────────────────────────────────────────────────────
  const adminId = userMap['admin_demo@example.com']
  await supabase.from('admin_logs').insert({
    admin_id: adminId,
    action: 'approved_kitchen',
    target_type: 'kitchen',
    target_id: kitchenId,
  })

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(55))
  console.log('✅ SEED COMPLETE — Demo accounts ready:\n')
  console.log('  Role     Email                          Password')
  console.log('  ──────── ────────────────────────────── ────────')
  console.log('  Admin    admin_demo@example.com         Demo@123')
  console.log('  Cook     kitchen_demo@example.com       Demo@123')
  console.log('  Customer customer1_demo@example.com     Demo@123')
  console.log('  Customer customer2_demo@example.com     Demo@123')
  console.log('\n  Kitchen: "Meena\'s Ghar Ka Khana" (approved)')
  console.log('  Foods:   12 items seeded')
  console.log('  Orders:  7 orders seeded (completed/preparing/accepted/cancelled)')
  console.log('  Reviews: 2 reviews seeded')
  console.log('═'.repeat(55) + '\n')
}

run().catch(err => {
  console.error('\n❌ Seed failed:', err.message)
  process.exit(1)
})
