# Local TLS certificate

`avast-root.pem` is the Avast "Web/Mail Shield" root certificate, exported from
this machine's Windows certificate store (`Cert:\LocalMachine\Root`).

Avast's HTTPS scanning intercepts outbound TLS connections and re-signs them
with this certificate. Browsers trust it because Avast adds it to the OS/browser
trust store, but Node.js ships its own separate CA bundle and doesn't — so any
server-side `fetch` (e.g. to Supabase) fails with:

```
TypeError: fetch failed
Caused by: Error: unable to verify the first certificate (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
```

`NODE_EXTRA_CA_CERTS=./.certs/avast-root.pem` in `.env.local` tells Node to
trust this certificate too, which resolves it without disabling TLS
verification.

This file is machine-specific (gitignored via the repo's `*.pem` rule) and
only needed on machines where Avast's HTTPS scanning is active. If you're not
seeing the error above, you don't need this.
