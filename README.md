# SawaTunes

SawaTunes is a small web app for discovering Sudanese music and artists. The public site is browse-only (no user accounts). A restricted admin area is used to curate artist profiles and song entries.

## Features

- Public browsing of artists and songs
- Songs open on YouTube (external playback)
- Admin-only dashboard to create/delete artists and songs
- Simple engagement counters (likes and views)
	- Likes: limited to one per song per browser (localStorage)
	- Views: limited to one per song per browser (localStorage)

## Tech Stack

- React + React Router (app + SSR build)
- Vite
- Firebase Authentication (admin sign-in only)
- Cloud Firestore (artists and songs)

## Project Structure

- app/root.tsx: app shell (header/nav/footer) and error boundary
- app/routes.ts: route table
- app/routes/*: page routes (public + admin)
- app/lib/firebase.client.ts: Firebase client initialization + auth helpers
- app/lib/sawatunes-data.client.ts: Firestore reads/writes for artists/songs
- firestore.rules: Firestore security rules
- firestore.indexes.json: Firestore indexes used by the app

## Prerequisites

- Node.js (recent LTS recommended)
- A Firebase project with:
	- Authentication enabled (Email/Password)
	- Firestore database created

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure Firebase environment variables

Copy the example env file and fill in your Firebase config values.

```bash
cp .env.example .env
```

Required variables (see .env.example):

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Notes:

- This app initializes Firebase only in the browser. Missing env vars will throw a runtime error when the client loads.

### 3) Create an admin account (Firebase Auth)

This app does not provide sign-up. Create admin users directly in Firebase Authentication using Email/Password. Any authenticated user is treated as an admin.

### 4) Run the app

```bash
npm run dev
```

Open the dev server URL shown in your terminal.

## Scripts

- Development: `npm run dev`
- Typecheck: `npm run typecheck`
- Production build: `npm run build`
- Serve production build locally: `npm run start`

## Firestore Data Model

Collections used:

### artists

- name (string)
- genre (string)
- bio (string)
- createdAt (timestamp)

### songs

- title (string)
- youtubeUrl (string)
- genre (string)
- artistId (string; references an artist document id)
- likes (number)
- views (number)
- createdAt (timestamp)

The admin dashboard creates these documents. The public site reads them.

## Firestore Rules and Indexes

This repo includes:

- firestore.rules
- firestore.indexes.json

Rules summary:

- Public reads are allowed for artists and songs
- Authenticated users can create/update/delete artists
- Authenticated users can create/delete songs
- Unauthenticated users can only update songs by increasing `likes` and/or `views`

Indexes:

- artists ordered by createdAt desc
- songs ordered by createdAt desc

To deploy rules/indexes, use the Firebase CLI in a Firebase-initialized project directory and deploy the two resources.

## Engagement Counters

The UI increments engagement in Firestore, but also uses localStorage to avoid repeated increments from the same browser:

- Likes key: `sawatunes-liked-songs` (array of song ids)
- Views key: `sawatunes-viewed-songs` (array of song ids)

If you clear site data, the browser will be able to like/view again.

## Admin Routes

- /admin/login: admin sign-in
- /admin: admin dashboard (requires an authenticated admin)

## Non-Goals

- No public accounts, profiles, or playlists
- No direct audio hosting (songs link out to YouTube)
- No payment/donation processing

