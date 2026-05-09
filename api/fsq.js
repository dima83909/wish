export default async function handler(req, res) {
  const { path, ...params } = req.query;
  const url = new URL(`https://places-api.foursquare.com/${path}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${process.env.FOURSQUARE_API_KEY}`,
      'Accept': 'application/json',
      'X-Places-Api-Version': '2025-06-17',
    },
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
