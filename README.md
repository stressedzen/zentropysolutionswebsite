# Zentropy Solutions Website

Static site for `zentropy.solutions`. It is currently in **coming soon mode**:
a single holding page while the business direction and the new site are worked
out.

## Deploying

Push to `main` on GitHub, then pull from cPanel (Git Version Control → Update
from Remote). The repo is the web root, so whatever is on `main` is what is
live.

## Files

- `index.html` - the coming soon page (styles and script are inline)
- `.htaccess` - temporarily redirects every old page URL to the homepage
- `assets/icons/` - favicon
- `assets/img/` - social preview image
- `assets/logos/` - Zentropy logo, mark, and wordmark
- `downloads/loreloom.zip` - LoreLoom alpha download, kept so existing links keep working
- `robots.txt`, `sitemap.xml` - search engine files (homepage only)
- `CNAME` - left over from GitHub Pages; not used by cPanel

## The previous site

The full multi-page site (services, ventures, projects, contact) is in git
history. The last commit with it is `263e2b8`:

```bash
git checkout 263e2b8 -- .
```
