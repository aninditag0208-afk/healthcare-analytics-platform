export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get the Gemini API key from environment variables
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  // Return the API key
  res.status(200).json({
    geminiApiKey: geminiApiKey,
    status: 'success'
  });
}