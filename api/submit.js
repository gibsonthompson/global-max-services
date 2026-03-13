const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, ...formData } = req.body

    if (!type || !['shipping', 'driver'].includes(type)) {
      return res.status(400).json({ error: 'Invalid form type' })
    }

    // Pick the right table and required fields
    const table = type === 'shipping' ? 'gms_shipping_inquiries' : 'gms_driver_applications'
    const requiredFields = type === 'shipping'
      ? ['name', 'email', 'phone']
      : ['name', 'email', 'phone', 'city_state', 'cdl_class', 'experience']

    // Validate
    for (const field of requiredFields) {
      if (!formData[field] || !formData[field].trim()) {
        return res.status(400).json({ error: `Missing required field: ${field}` })
      }
    }

    // Insert to Supabase
    const { data, error } = await supabase
      .from(table)
      .insert([formData])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: 'Failed to save submission' })
    }

    // Send SMS notification via Telnyx
    const notifyPhone = process.env.GMS_NOTIFY_PHONE
    const telnyxKey = process.env.TELNYX_API_KEY
    const telnyxFrom = process.env.TELNYX_PHONE_NUMBER

    if (notifyPhone && telnyxKey && telnyxFrom) {
      try {
        const smsBody = type === 'shipping'
          ? `New GMS Quote Request\n\n${formData.name}\n${formData.phone}\n${formData.email}\n${formData.origin || ''} → ${formData.destination || ''}\nCargo: ${formData.cargo_type || 'N/A'}\nWeight: ${formData.weight || 'N/A'}`
          : `New GMS Driver App\n\n${formData.name}\n${formData.phone}\n${formData.email}\n${formData.city_state}\nCDL: ${formData.cdl_class}\nExp: ${formData.experience}`

        await fetch('https://api.telnyx.com/v2/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${telnyxKey}`,
          },
          body: JSON.stringify({
            from: telnyxFrom,
            to: notifyPhone,
            text: smsBody,
          }),
        })
      } catch (smsErr) {
        // Log but don't fail the form submission
        console.error('SMS send error:', smsErr)
      }
    }

    return res.status(200).json({ success: true, id: data.id })

  } catch (err) {
    console.error('Submit handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
