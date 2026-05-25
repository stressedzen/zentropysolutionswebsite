# Null.Kitten

Standalone one-page site for `nullkitten.com`, built to live at `/public_html/nullkitten`.

## Files

- `index.html`
- `styles.css`
- `script.js`
- `assets/`

## Asset slots

- Source logo: `./assets/nullkitten-logo.jpeg`
- Hero wordmark: `./assets/nullkitten-wordmark.png`
- Atmospheric cat face: `./assets/nullkitten-face.png`
- Glyph sheet: `./assets/nullkitten-glyph-sheet.png` is present but intentionally unused for now.
- Audio: `./assets/audio/track-01.mp3`, `track-02.mp3`, `track-03.mp3`

The face and wordmark PNGs were cropped from the source logo. If the logo changes later, regenerate
those two derived assets and keep the same filenames.

## Typography

- Body UI uses a clean system monospace stack.
- The glyph sheet is not used for typography, decoration, dividers, or textures.

## Updating tracks

Edit the `tracklist` array in `script.js`.

- `title` changes the label in the player.
- `src` should point to a local audio file or a stream URL.
- The player is stream-only in UX: it does not expose download links.

## Notes

- No frameworks.
- No dependencies.
- No build tools.
- One `<audio>` element.
- No autoplay.
- Right-click is disabled only on the player container.
