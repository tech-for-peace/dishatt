

## Problem

Facebook's Open Graph debugger shows the image correctly, but WhatsApp does not display the preview image. This is a known WhatsApp-specific behavior.

## Root Causes (most likely)

1. **WhatsApp cache**: WhatsApp caches link previews aggressively (sometimes for weeks). Once it cached the broken/blank image from the previous corrupted file, it may continue serving that cached version.

2. **Custom domain redirects**: `disha.techforpeace.co.in` likely redirects to/from `dishatt.lovable.app`. WhatsApp's crawler handles redirects poorly compared to Facebook's.

3. **og:image URL points to custom domain**: The meta tag uses `https://disha.techforpeace.co.in/og-image.jpg` which goes through the redirect chain.

## Plan

### Step 1: Add cache-busting to the og:image URL
Update `index.html` to append a version query parameter to the og:image URL, forcing WhatsApp to re-fetch instead of using its stale cache:

```html
<meta property="og:image" content="https://disha.techforpeace.co.in/og-image.jpg?v=2" />
```

### Step 2: Use the direct Lovable domain as an alternative image URL
WhatsApp may handle the direct hosting domain better than the custom domain redirect. Add a secondary image tag pointing to the Lovable-hosted URL:

```html
<meta property="og:image" content="https://dishatt.lovable.app/og-image.jpg?v=2" />
```

This avoids any redirect chain issues with the custom domain.

### Step 3: Redeploy and test
After deploying, share the link in a **brand new WhatsApp chat** (not an existing one where it was previously shared, as WhatsApp caches per-chat). The preview should now appear with the fresh image.

---

**Note**: If the issue persists after these changes, the only remaining cause is WhatsApp's server-side cache, which can take days to clear. There is no API to force WhatsApp to re-scrape (unlike Facebook's debugger).

