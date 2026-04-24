# Zentropy Solutions Website

This is a dependency-free static website for `zentropy.solutions`, focused on
design, 3D printing, resin printing, 3D scanning, prototyping, and manufacturing
support.

## Files

- `index.html` - page structure and site copy
- `styles.css` - responsive layout and visual design
- `script.js` - mobile navigation, header state, hero canvas, and footer year
- `assets/` - optimized Zentropy logo, favicon, and social preview assets
- `CNAME` - GitHub Pages custom domain configuration

## Local Preview

Open `index.html` in a browser, or run a simple static server from this folder:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## GitHub Pages

For GitHub Pages, publish the repository from the root of the default branch and keep the `CNAME` file set to:

```txt
zentropy.solutions
```
