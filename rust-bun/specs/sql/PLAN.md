# SQL Clients Implementation Plan

## Dependencies

```toml
[dependencies]
tokio-postgres = "0.7"
mysql_async = "0.34"
rusqlite = { version = "0.32", features = ["bundled"] }
deadpool = "0.12"
```

## Architecture

```
bun-sql/
├── src/
│   ├── lib.rs
│   ├── postgres/
│   ├── mysql/
│   ├── sqlite/
│   └── types.rs
```

## Implementation Order

1. SQLite (simplest, embedded)
2. PostgreSQL (most common)
3. MySQL

## Performance Targets

- SQLite query: < 100μs overhead
- PostgreSQL pooled query: < 500μs overhead
