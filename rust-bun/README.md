# Rust-Bun

A 1:1 Rust implementation of [Bun](https://bun.com) - the all-in-one JavaScript runtime & toolkit.

## Overview

Rust-Bun aims to replicate all of Bun's functionality in Rust, using the highest standards of Rust development. The project uses `rusty_jsc` for JavaScriptCore integration.

## Features

This project implements:

- 🚀 **Runtime**: Fast JavaScript/TypeScript execution via JavaScriptCore
- 📦 **Package Manager**: npm-compatible package management (`bun install`, `bun add`, etc.)
- 🔧 **Bundler**: Tree-shaking JavaScript/TypeScript bundler with CSS and HTML support
- 🧪 **Test Runner**: Jest-compatible test framework
- 💻 **Shell**: Cross-platform shell with built-in commands
- 🌐 **HTTP Server**: High-performance HTTP server and client
- 🔌 **WebSocket**: Full WebSocket support
- 📁 **Node.js Compatibility**: Comprehensive Node.js API compatibility
- 🔗 **FFI**: Foreign Function Interface support
- 🗄️ **Database Clients**: PostgreSQL, MySQL, SQLite, Redis, S3

## Project Structure

```
rust-bun/
├── Cargo.toml              # Workspace root
├── specs/                  # Specification documents
│   ├── core/               # Core runtime specs
│   ├── parser/             # JavaScript parser specs
│   ├── resolver/           # Module resolver specs
│   ├── bundler/            # Bundler specs
│   ├── install/            # Package manager specs
│   ├── http/               # HTTP/WebSocket specs
│   ├── jsc/                # JSC bindings specs
│   ├── node/               # Node.js compat specs
│   ├── shell/              # Shell specs
│   ├── css/                # CSS parser specs
│   ├── sql/                # SQL clients specs
│   ├── test/               # Test runner specs
│   ├── ffi/                # FFI specs
│   ├── web/                # Web APIs specs
│   └── bake/               # SSR framework specs
├── crates/                 # Rust crates
│   ├── bun-cli/            # CLI entry point
│   ├── bun-core/           # Core runtime
│   ├── bun-parser/         # JS/TS parser
│   ├── bun-resolver/       # Module resolver
│   ├── bun-bundler/        # Bundler
│   ├── bun-install/        # Package manager
│   ├── bun-http/           # HTTP server/client
│   ├── bun-jsc/            # JSC bindings
│   ├── bun-node/           # Node.js compat
│   ├── bun-shell/          # Shell
│   ├── bun-css/            # CSS parser
│   ├── bun-sql/            # SQL clients
│   ├── bun-test/           # Test runner
│   ├── bun-ffi/            # FFI
│   ├── bun-web/            # Web APIs
│   └── bun-bake/           # SSR framework
└── tests/                  # Integration tests
```

## Development

### Prerequisites

- Rust 1.83+
- macOS (for JavaScriptCore) - Linux support via WebKitGTK coming soon

### Building

```bash
# Build all crates
cargo build

# Build release version
cargo build --release

# Run tests
cargo test --all

# Run with clippy
cargo clippy --all -- -D warnings
```

### Workflow

Each module follows the spec/tasks/plan workflow:

1. **SPEC.md**: Detailed specifications and API documentation
2. **TASKS.md**: Implementation task list with dependencies
3. **PLAN.md**: Architecture and implementation strategy

## Reference

- Original Bun: [github.com/oven-sh/bun](https://github.com/oven-sh/bun)
- Bun Documentation: [bun.com/docs](https://bun.com/docs)

## License

MIT License - see [LICENSE](LICENSE) for details.
