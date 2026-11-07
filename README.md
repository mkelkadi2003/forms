# Form Adventure City

An interactive Grade 6 ICT lesson for Al-Bassam Schools.

## Open or Publish

Open `index.html` in Google Chrome, or upload it to your GitHub Pages publishing folder. The school logo, fonts, styles, and application code are embedded, so no separate logo upload is needed.

The same presentation is available in `docs/index.html` and `dist/index.html`. The GitHub Actions workflow publishes `dist/`.

## Rebuild After Editing

The editable application is in `src/`, starting at `src/App.tsx`. Run `node scripts/build-pages.mjs` after making source changes. This runs `npm run build` from the source HTML template, then refreshes the root, error-page, and GitHub Pages copies together.

The shared school logo component is `src/components/SchoolLogo.tsx`, using the embedded image at `src/assets/al-bassam-schools.png`.