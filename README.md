Quick Portfolio is a Next.js app for building a public, read-only CV/portfolio link (`/visitor?email=...`) from a simple profile editor.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment variables

This app uses **MongoDB Atlas** for persistence in production (Vercel/Netlify/serverless).

- **Required**
  - `MONGODB_URI`: MongoDB connection string (Atlas “Connect” → “Drivers” → Node.js)
- **Optional**
  - `MONGODB_DB`: Database name (defaults to `quickPortfolio`)

Create a `.env.local` for local dev:

```bash
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB="quickPortfolio"
```

### MongoDB Atlas setup (Vercel / Netlify)

- **Create a cluster**: Atlas → Create (free tier is fine)
- **Create a DB user**: Database Access → Add New Database User (read/write)
- **Network access**: Network Access → Add IP Address
  - Quick start: `0.0.0.0/0` (tighten later)
- **Copy connection string**: Atlas → Connect → Drivers → Node.js → copy SRV URI

#### Vercel
- Project → Settings → Environment Variables
- Add `MONGODB_URI` (and optionally `MONGODB_DB`)
- Redeploy

#### Netlify
- Site → Site configuration → Environment variables
- Add `MONGODB_URI` (and optionally `MONGODB_DB`)
- Trigger a new deploy

### Troubleshooting

- **Updates don’t persist on Vercel/Netlify**: you must use MongoDB (or another external DB). Writing to `data/*.json` won’t persist on serverless.
- **503 “MONGODB_URI is not set”**: set the env var in your host and redeploy.
- **Auth / connection errors**:
  - check Atlas DB user/password
  - check Network Access allowlist
  - confirm the URI is the SRV connection string from Atlas

### Data model (collections)

To match the profile editor cards, MongoDB uses **one collection per card** (all keyed by `email`):

- `accounts`
- `profile_personal` (headline/summary, gender, avatar/image, mood)
- `profile_links` (handles/links)
- `profile_education` (education list)
- `profile_work` (work experiences)
- `profile_skills` (skills/tech arrays)
- `login_events` (successful sign-ins for analytics)

The app can also read from the legacy `profiles` collection and lazily migrates it into the card collections on first access.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
