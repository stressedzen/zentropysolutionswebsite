# Zentropy Solutions Website

Static site for `zentropy.solutions`. It is currently in **coming soon mode**:
a single holding page while the business direction and the new site are worked
out.

## Deploying

Push to `main` on GitHub, then pull on the server. The repo is the web root
(`~/public_html`), so whatever is on `main` is what is live.

From the Mac that has the `zentropy` SSH shortcut set up:

```bash
ssh zentropy 'cd ~/public_html && git pull --ff-only'
```

Or from cPanel: Git Version Control → Manage → Update from Remote.

If the pull refuses because a file on the server was changed or added there,
look at that file before moving it aside; do not force the pull.

## Files

- `index.html` - the coming soon page (styles and script are inline)
- `.htaccess` - temporarily redirects every old page URL to the homepage
- `assets/icons/` - favicon
- `assets/img/` - social preview image
- `assets/logos/` - Zentropy logo, mark, and wordmark
- `robots.txt`, `sitemap.xml` - search engine files (homepage only)
- `CNAME` - left over from GitHub Pages; not used by cPanel

## The previous site

The full multi-page site (services, ventures, projects, contact) is in git
history. The last commit with it is `263e2b8`:

```bash
git checkout 263e2b8 -- .
```
