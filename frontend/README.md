# PharmaFind - Frontend

PharmaFind is a digital health platform to verify real-time medication availability. 
This directory contains the Next.js `14.2.35` App Router frontend.

## Getting Started

The easiest way to run the frontend is to run `npm run dev` from the **root workspace directory**:

```bash
cd D:/ramdanAI
npm run dev
```

This will run both the frontend and the backend using `concurrently`.

## Technologies

- **Framework:** Next.js (App Router)
- **i18n:** `next-intl`
- **Map:** `react-leaflet` / `leaflet`
- **State Mgmt / Fetching:** `@tanstack/react-query` & `zustand`
- **Styling:** Tailwind CSS 3
- **Icons:** `lucide-react`

## Features

- **Multilingual Support:** First-class RTL (Arabic) & LTR (French) support via `next-intl`.
- **AI Assistant Panel:** Allows users to query the server using natural language or uploaded prescription images using Google's Gemini Flash.
- **Smart Mapping:** Shows available nearby pharmacies using `Leaflet`.
- **Dashboard:** Pharmacists can claim their pharmacy and manage their stock inventory in real-time.

## Structure

- `src/app/` - Core routing mechanics and layout
- `src/components/ui/` - Re-usable small elements like Buttons, Spinners.
- `src/components/ai/` - Gemini AI specific components for analyzing prescriptions.
- `messages/` - Localization JSON structures for French (`fr`) and Arabic (`ar`).
