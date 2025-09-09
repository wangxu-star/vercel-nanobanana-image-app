import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.NANO_BANANA_API_KEY;
  const model = process.env.NANO_BANANA_MODEL || "gemini-2.5-flash-image-preview";

  if (!apiKey) {
    return res.status(500).json({ error: "API Key not set in environment variables" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello, can you generate a test image?" }] }],
        }),
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
