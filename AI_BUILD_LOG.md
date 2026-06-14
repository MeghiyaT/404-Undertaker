# AI Build Log: 404 Undertaker

## Project Summary

404 Undertaker began as a simple idea: give broken web links a solemn, permanent record instead of letting them vanish silently. The MVP became a Filecoin-powered preservation app where a user can upload evidence, store it through a Web3.Storage-compatible Filecoin path, generate a metadata bundle, and view a local "Death Certificate" for each preserved link.

## From Concept To Working App

The first step was turning the concept into a usable frontend. We scaffolded a Vite, React, TypeScript, and Tailwind CSS app with a dark memento mori visual direction: restrained colors, official-looking borders, quiet typography, and simple navigation between Preserve and Archive.

Next, the Preserve flow became the main interaction. The form collects the Original URL, Title, Preservation Note, and Evidence Upload. On submission, the app uploads the file to Storacha, the current Web3.Storage-backed Filecoin client path, and receives a CID.

After upload, the app creates a metadata bundle with:

- Original URL
- Title
- Preservation note
- Timestamp
- Filecoin CID

Because this MVP does not use a backend database, the metadata bundle is saved into localStorage with a unique certificate ID. That lets the app simulate persisted certificates while keeping the prototype lightweight.

Finally, we added a certificate route and archive experience. `/certificate/[id]` reads the metadata bundle from localStorage and renders a solemn Death Certificate. The Archive section lists saved certificates as cards and links each card to its certificate page.

## How AI Helped

AI helped move the project from a theme and feature idea into a working implementation by handling both product structure and technical integration.

The most important hard parts were:

- Choosing a practical Filecoin upload path after Web3.Storage evolved into Storacha.
- Creating a provider utility that uploads browser `File` objects and returns a CID.
- Keeping the Filecoin client lazy-loaded so the main app bundle stayed small.
- Designing a no-backend persistence model using localStorage and unique certificate IDs.
- Building the dynamic certificate route in a Vite SPA instead of relying on Next.js routing.
- Adding evidence retrieval through a Filecoin-backed IPFS gateway.
- Catching UI and UX issues: missing form feedback, archive placeholder data, certificate nav anchors, and loose localStorage parsing.
- Polishing the app into a coherent dark, official, hackathon-ready experience.

## Final MVP Flow

1. User opens the Preserve form.
2. User enters the original URL, title, note, and evidence file.
3. App uploads the evidence file to Filecoin through Storacha.
4. App receives a CID.
5. App builds a metadata bundle.
6. App saves the bundle to localStorage with a unique ID.
7. Archive displays the saved certificate card.
8. Certificate page displays the preserved record.
9. Retrieve Evidence opens the Filecoin-hosted evidence in a new tab.

## What Works Now

- Dark minimalist landing interface.
- Preserve form with validation and visible success/error feedback.
- Filecoin upload utility using Storacha.
- Metadata bundle creation.
- localStorage-based certificate persistence.
- Dynamic certificate pages.
- Archive grid generated from saved localStorage records.
- Evidence retrieval by CID.

## Current MVP Limitations

- Certificates are saved only in the user's current browser localStorage.
- A production version should store metadata in a real database or decentralized metadata layer.
- Direct visits to `/certificate/[id]` require hosting rewrites to `index.html`.
- Filecoin upload requires Storacha account authorization.

## Next Steps

- Store certificate metadata on-chain, in IPFS, or in a backend database.
- Add shareable certificate pages that work across browsers.
- Add upload progress and stronger error recovery.
- Add a public archive view.
- Generate a printable certificate layout.
