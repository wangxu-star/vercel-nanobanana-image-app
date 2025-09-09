# Vercel Nano-Banana (Gemini) Image Demo

This is a minimal Next.js app that lets you enter a text prompt, optionally upload an image, and generate images via Google Gemini (Nano-Banana) API.

## Setup

1. Clone repo
2. Run `npm install`
3. Create `.env.local` file with:
   ```
   NANO_BANANA_API_KEY=your_google_api_key_here
   NANO_BANANA_MODEL=gemini-2.5-flash-image-preview
   ```
4. Run `npm run dev` to start locally.
5. Deploy to Vercel and set same environment variables in dashboard.

## Notes
- Default model: gemini-2.5-flash-image-preview
- Supports inline image upload as base64 (limit ~20MB)
- Parses multiple possible output fields from Gemini response
