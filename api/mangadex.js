export default async function handler(req, res) {
  try {
    const endpoint = req.query.endpoint || "";

    // Remove endpoint from query params
    const params = { ...req.query };
    delete params.endpoint;

    const search = new URLSearchParams(params).toString();

    const url =
      `https://api.mangadex.org/${endpoint}` +
      (search ? `?${search}` : "");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/json"
    );

    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
}
