# MUNCHIES CORNER

A responsive food-ordering website with a customer menu, cart, optional email sign-in, free delivery, and WhatsApp order handoff.

## Hosted demo

Try the ordering site at [munchies-corner.vercel.app](https://munchies-corner.vercel.app). Customers can order as guests or optionally sign in with their email.

## Run locally

Install Node.js 20 or newer, then run from the project root:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Email sign-in requires Supabase; guest checkout works without it.

## Optional email sign-in setup

Create a Supabase project, then:

1. In **Project Settings → API Keys**, copy the Project URL and publishable key into `.env.local` using `.env.example` as a template. A legacy anon key also works. Never use the Supabase secret/service-role key in a `VITE_` variable.
2. In **Authentication → URL Configuration**, set the Site URL to `https://munchies-corner.vercel.app` and add redirect URLs for `https://munchies-corner.vercel.app/**`, `http://localhost:5173/**`, and `http://127.0.0.1:5173/**`.
3. Enable email sign-in in Supabase. For reliable email delivery in production, configure an SMTP provider in Supabase Auth settings.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as Vercel environment variables, then redeploy.

Until Supabase Auth and email delivery are configured, sign-in links cannot be sent. Guest ordering remains available without sign-in.

## Demo behavior

Customers can order as guests or optionally sign in with an email one-time link. Checkout opens WhatsApp with the items, total, customer name, email, phone number, delivery destination, and kitchen note prefilled. Customers must press **Send** in WhatsApp to submit the order. Orders are not stored by this demo's website backend. Delivery is free on every order. Customers pay after delivery by Safaricom Send Money to **0794800487**. Contact: [bungeygarethh@gmail.com](mailto:bungeygarethh@gmail.com) or WhatsApp at [0794800487](https://wa.me/254794800487).

Current menu specials: two butternut cinnamon rolls for KSh 145, a cinnamon roll for KSh 65, and uncooked samosas for KSh 25 each. Other sample menu items are marked as coming soon.

## Build

```sh
npm run build
```
