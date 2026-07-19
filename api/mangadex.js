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

console.log("URL:", url.toString());
console.log("STATUS:", response.status);
console.log("BODY:", text);

res.setHeader("Access-Control-Allow-Origin", "*");

    res.status(response.status).send(text);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
}
