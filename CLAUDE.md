# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — run ESLint (flat config, no args needed)

## Tech Stack

- **Next.js 16** with App Router (React 19, TypeScript, Tailwind CSS v4)
- Tailwind via `@tailwindcss/postcss` plugin (no `tailwind.config` file — v4 uses CSS-first configuration)
- Fonts: Geist Sans + Geist Mono via `next/font/google`
- Path alias: `@/*` maps to project root

## Architecture

Fresh `create-next-app` scaffold using the App Router. All routes live under `app/`:

- `app/layout.tsx` — root layout (html/body, fonts, global CSS)
- `app/page.tsx` — home page
- `app/globals.css` — global styles / Tailwind directives

## Important: Next.js 16 Breaking Changes

This project uses Next.js 16, which has breaking changes from earlier versions. **Always consult `node_modules/next/dist/docs/` before writing code** — APIs, conventions, and file structure may differ from training data. Heed deprecation notices.
