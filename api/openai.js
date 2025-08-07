// api/openai.js

export default async function handler(req, res) {
  // ✅ CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { messages, image_base64 } = req.body;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: image_base64 ? 'gpt-4-vision-preview' : 'gpt-4',
        messages: image_base64
          ? [{ role: 'user', content: [
              { type: 'text', text: messages },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${image_base64}` } }
            ] }]
          : messages,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Unknown API Error');
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
