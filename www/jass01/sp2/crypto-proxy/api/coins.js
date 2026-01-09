export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { ids } = req.query;

    const url =
      'https://api.coingecko.com/api/v3/coins/markets' +
      `?vs_currency=usd&ids=${encodeURIComponent(ids)}`;

    const r = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_KEY
      }
    });

    const data = await r.json();
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}
