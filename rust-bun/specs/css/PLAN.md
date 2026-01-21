# CSS Parser Implementation Plan

## Dependencies

```toml
[dependencies]
bun-core = { path = "../bun-core" }
cssparser = "0.34"          # Low-level tokenizer
smallvec = "1.13"
sourcemap = "9"
```

## Architecture

```
bun-css/
├── src/
│   ├── lib.rs
│   ├── parser/
│   │   ├── mod.rs
│   │   ├── tokenizer.rs
│   │   └── stylesheet.rs
│   ├── selectors/
│   ├── properties/
│   ├── values/
│   ├── rules/
│   ├── modules.rs          # CSS Modules
│   ├── prefixer.rs         # Vendor prefixing
│   ├── minify.rs           # Minification
│   └── printer.rs          # Output
└── tests/
```

## Implementation Order

### Month 1: Parser Foundation

- Tokenizer, basic selectors, declarations

### Month 2: Complete Syntax

- All at-rules, property values

### Month 3: Transforms

- CSS Modules, prefixing, minification

## Performance Targets

- Parse Bootstrap CSS (200KB): < 50ms
- Minification: < 20ms
