# Bake Implementation Plan

## Dependencies

```toml
[dependencies]
bun-bundler = { path = "../bun-bundler" }
bun-http = { path = "../bun-http" }
bun-jsc = { path = "../bun-jsc" }
notify = "8"
```

## Architecture

```
bun-bake/
├── src/
│   ├── lib.rs
│   ├── router.rs
│   ├── dev_server.rs
│   ├── hmr.rs
│   ├── ssr.rs
│   ├── production.rs
│   └── react/
```

## Implementation Order

1. Route discovery
2. Basic SSR
3. Dev server
4. HMR
5. Production builds
