# Nitro account-deletion page

This is a static Firebase Web SDK site for Nitro's external account-deletion path.

## Local setup

1. Copy `firebase-config.example.js` to `firebase-config.js`.
2. Add the public web-app configuration for the existing Nitro Firebase project.
3. Serve this folder through a local HTTP server; opening `index.html` directly will not load ES modules reliably.
4. Test while signed out, then test Google sign-in, cancellation, deletion, recent-login handling, and the post-deletion new-account message.

`firebase-config.js` must contain only public Firebase web configuration. Never put Firebase Admin credentials or private service-account data in this folder.

## GitHub Pages handoff

Publish the contents of this folder with GitHub Pages. Add the final Pages domain to Firebase Authentication's authorized domains before testing the public URL.
