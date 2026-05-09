import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt } = req.body

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Please provide a prompt.' })
    }

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt
    })

    return res.status(200).json(response)
  } catch (error) {
    console.error('OpenAI error:', error)
    return res.status(500).json({ error: 'OpenAI request failed.' })
  }
}
