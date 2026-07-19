export default async function handler(req, res) {
  try {
    const { endpoint = "", ...rest } = req.query;

    const url = new URL(
      `https://api.mangadex.org/${String(endpoint).replace(/^\/+/, "")}`
    );

    // Preserve ALL query params exactly
    const original = new URL(req.url, "http://localhost");

    original.searchParams.forEach((value, key) => {
      if (key !== "endpoint") {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/json"
    );

    res.status(response.status).send(text);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
}
