# Test Runner Implementation Plan

## Dependencies

```toml
[dependencies]
bun-jsc = { path = "../bun-jsc" }
notify = "8"
similar = "2"          # For snapshot diffs
```

## Architecture

```
bun-test/
├── src/
│   ├── lib.rs
│   ├── runner.rs
│   ├── matchers/
│   ├── mock.rs
│   ├── snapshot.rs
│   ├── coverage.rs
│   └── reporter.rs
```

## Implementation Order

1. Basic describe/it structure
2. Matchers
3. Lifecycle hooks
4. Mocking
5. Snapshots
6. Coverage
