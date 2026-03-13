const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function authenticate(req) {
  const key = req.headers['x-admin-key']
  return key && key === process.env.GMS_ADMIN_KEY
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // ── GET: Fetch all submissions from both tables ──
    if (req.method === 'GET') {
      const [shippingRes, driverRes] = await Promise.all([
        supabase
          .from('gms_shipping_inquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('gms_driver_applications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
      ])

      const shipping = (shippingRes.data || []).map(r => ({ ...r, type: 'shipping' }))
      const drivers = (driverRes.data || []).map(r => ({ ...r, type: 'driver' }))
      const combined = [...shipping, ...drivers].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )

      return res.status(200).json({ data: combined })
    }

    // ── PATCH: Update status ──
    if (req.method === 'PATCH') {
      const { id, type, status } = req.body
      if (!id || !type || !status) {
        return res.status(400).json({ error: 'Missing id, type, or status' })
      }

      const table = type === 'shipping'
        ? 'gms_shipping_inquiries'
        : 'gms_driver_applications'

      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', id)

      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ success: true })
    }

    // ── DELETE ──
    if (req.method === 'DELETE') {
      const { id, type } = req.body
      if (!id || !type) {
        return res.status(400).json({ error: 'Missing id or type' })
      }

      const table = type === 'shipping'
        ? 'gms_shipping_inquiries'
        : 'gms_driver_applications'

      const { error } = await supabase.from(table).delete().eq('id', id)

      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (err) {
    console.error('Admin API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
