# MP2 – Ink Roster

A minimal single-page app for browsing **Marvel heroes and villains**, built with React, TypeScript,
React Router and Axios.

Live site: https://cw72.github.io/mp2/

## Data source

The official Marvel developer API has been retired: `developer.marvel.com` now redirects to marvel.com, and
`gateway.marvel.com` returns HTTP 500 for every request. The app uses the open
[Superhero API](https://github.com/akabab/superhero-api) instead, which needs no key, and keeps only the
269 characters whose publisher is *Marvel Comics*.

## Views

- **Roster** (`/`, list view): a grid of character cards with live search by codename, real name or alias.
  You can rank by name, total power, any of the six power stats, height or weight, in ascending or descending
  order. Each card shows its rank and a bar for the value currently being sorted on.
- **Gallery** (`/gallery`, gallery view): a grid of character portraits. You can filter by
  side (hero/villain/neutral), gender and origin. Picking several values in one filter widens the results;
  combining different filters narrows them.
- **Profile** (`/hero/:id`, detail view): laid out like a magazine feature. It has a headline, a deck and a
  byline, then a drop-cap article generated from the character's data (`src/story.ts`) covering origins, line of
  work, allies & family and power profile, with a pull quote. The sidebar holds the art, a "By the numbers" box
  (hexagonal radar chart, power bars, overall rank) and a fact file. *Previous* / *Next profile* (or the ←/→
  keys) cycle through the list or gallery results you came from, wrapping at the ends. Every character has its
  own URL.

Search, sort and filter state is kept in the URL, so it is restored when you go back from a detail page. The
app has loading and error states with a retry button, and caches API responses in `sessionStorage`.

## Design

Quiet, editorial and minimal: warm off-white background, hairline borders, a single red accent plus muted
colours to mark hero / villain / neutral, Inter for the interface and Source Serif 4 for headings and article
text. Light and dark mode follow the system setting. There is no inline styling; every component has its own
CSS file.

## Scripts

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build into dist/ (also writes 404.html for GitHub Pages routing)
npm run lint
```

Every push to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

## Sources

- Character data & images: [akabab/superhero-api](https://github.com/akabab/superhero-api) (data originally from
  superherodb). Characters belong to their respective owners; this is an unofficial student project.
- Docs: [React Router](https://reactrouter.com/), [Axios](https://axios-http.com/docs/intro),
  [Vite static deploy guide](https://vite.dev/guide/static-deploy).
- Fonts: [Inter](https://fonts.google.com/specimen/Inter) and
  [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) via Google Fonts.
