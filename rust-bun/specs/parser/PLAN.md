# JavaScript/TypeScript Parser Implementation Plan

## Dependencies

### External Crates

```toml
[dependencies]
bun-core = { path = "../bun-core" }
logos = "0.15"               # Lexer generator for fast tokenization
unicode-id-start = "1.3"     # Unicode identifier validation
rustc-hash = "2.1"           # Fast hashmaps
smallvec = "1.13"            # Stack-allocated vectors for AST nodes
sourcemap = "9"              # Source map generation
```

### Internal Dependencies

- `bun-core`: Error types, allocators

## Architecture

### Module Structure

```
bun-parser/
├── src/
│   ├── lib.rs
│   ├── lexer/
│   │   ├── mod.rs
│   │   ├── token.rs        # Token types
│   │   ├── scanner.rs      # Character scanner
│   │   ├── identifier.rs   # Identifier lexing
│   │   ├── string.rs       # String literal lexing
│   │   ├── number.rs       # Numeric literal lexing
│   │   ├── template.rs     # Template literal lexing
│   │   ├── regexp.rs       # RegExp lexing
│   │   ├── jsx.rs          # JSX text lexing
│   │   └── keywords.rs     # Keyword lookup table
│   ├── ast/
│   │   ├── mod.rs
│   │   ├── stmt.rs         # Statement nodes
│   │   ├── expr.rs         # Expression nodes
│   │   ├── decl.rs         # Declaration nodes
│   │   ├── pattern.rs      # Pattern nodes
│   │   ├── jsx.rs          # JSX nodes
│   │   ├── typescript.rs   # TypeScript nodes
│   │   └── visitor.rs      # Visitor trait
│   ├── parser/
│   │   ├── mod.rs
│   │   ├── context.rs      # Parser context
│   │   ├── expression.rs   # Expression parsing
│   │   ├── statement.rs    # Statement parsing
│   │   ├── declaration.rs  # Declaration parsing
│   │   ├── pattern.rs      # Pattern parsing
│   │   ├── jsx.rs          # JSX parsing
│   │   ├── typescript.rs   # TypeScript parsing
│   │   └── precedence.rs   # Operator precedence
│   ├── printer/
│   │   ├── mod.rs
│   │   ├── gen.rs          # Code generation
│   │   ├── minify.rs       # Minification
│   │   └── sourcemap.rs    # Source map generation
│   └── error.rs            # Parser errors
└── tests/
    ├── lexer_tests.rs
    ├── parser_tests.rs
    ├── printer_tests.rs
    └── fixtures/           # Test fixture files
```

### Key Design Decisions

#### 1. Lexer Design

Use a hand-written lexer for maximum performance and control:

```rust
pub struct Lexer<'a> {
    source: &'a [u8],        // UTF-8 bytes
    pos: usize,              // Current byte position
    token_start: usize,      // Start of current token
    line: u32,               // Current line
    line_start: usize,       // Position of line start
    prev_token_end: usize,   // For ASI
    jsx_depth: i32,          // JSX nesting depth
}
```

#### 2. AST Memory Layout

Use arena allocation with indices for memory efficiency:

```rust
pub struct Ast {
    arena: Arena,
    statements: Vec<StmtId>,
}

pub struct StmtId(u32);
pub struct ExprId(u32);

impl Ast {
    pub fn stmt(&self, id: StmtId) -> &Stmt {
        self.arena.get_stmt(id)
    }
}
```

#### 3. Operator Precedence

Use Pratt parsing for expression parsing:

```rust
fn parse_expression(&mut self, min_precedence: u8) -> Result<Expr> {
    let mut left = self.parse_prefix()?;

    while let Some(prec) = self.current_precedence() {
        if prec < min_precedence {
            break;
        }
        left = self.parse_infix(left, prec)?;
    }

    Ok(left)
}
```

## Implementation Order

### Month 1: Lexer

| Week | Tasks                                             |
| ---- | ------------------------------------------------- |
| 1    | Token types, basic scanner, identifiers, keywords |
| 2    | Strings, numbers, operators, punctuation          |
| 3    | Template literals, regular expressions            |
| 4    | JSX lexing, comments, edge cases                  |

### Month 2: AST & Basic Parser

| Week | Tasks                                    |
| ---- | ---------------------------------------- |
| 1    | AST type definitions, visitor trait      |
| 2    | Primary expressions, precedence climbing |
| 3    | Statements, control flow                 |
| 4    | Functions, classes, declarations         |

### Month 3: ES Modules & Advanced

| Week | Tasks                          |
| ---- | ------------------------------ |
| 1    | Import/export parsing          |
| 2    | Arrow functions, destructuring |
| 3    | Async/await, generators        |
| 4    | Error recovery, diagnostics    |

### Month 4: JSX & TypeScript

| Week | Tasks                           |
| ---- | ------------------------------- |
| 1    | JSX element parsing             |
| 2    | TypeScript type annotations     |
| 3    | TypeScript declarations         |
| 4    | Decorators, advanced TypeScript |

### Month 5: Printer & Polish

| Week | Tasks                              |
| ---- | ---------------------------------- |
| 1    | Basic code generation              |
| 2    | Minification                       |
| 3    | Source maps                        |
| 4    | Testing, benchmarks, documentation |

## Risk Analysis

### High Risk

| Risk                                       | Mitigation                          |
| ------------------------------------------ | ----------------------------------- |
| Cover grammar complexity (arrows, objects) | Study esbuild's approach carefully  |
| TypeScript vs JSX ambiguity                | Context tracking, backtracking      |
| Performance for large files                | Arena allocation, careful profiling |

### Medium Risk

| Risk                                | Mitigation                     |
| ----------------------------------- | ------------------------------ |
| ASI (Automatic Semicolon Insertion) | Comprehensive test suite       |
| Regular expression edge cases       | Port Bun's lexer logic exactly |
| Unicode identifier handling         | Use unicode-id crate           |

### Low Risk

| Risk                | Mitigation                        |
| ------------------- | --------------------------------- |
| Operator precedence | Well-established Pratt parsing    |
| Statement parsing   | Straightforward recursive descent |

## Performance Targets

Based on Bun's performance:

- Parse `three.js` (1.2MB): < 30ms
- Parse typical file (10KB): < 1ms
- Memory for AST: < 3x source size
- Minified output: Within 5% of Bun's size

## Testing Strategy

### Test262 Subset

Use a subset of Test262 for ECMAScript compliance:

- Pass tests (syntax that should parse)
- Fail tests (syntax that should error)

### TypeScript Tests

- Use TypeScript compiler's syntax tests
- Focus on TypeScript 5.x features

### Bun Compatibility

- Parse same files Bun can parse
- Error on same syntax Bun rejects
- Match source map output format
