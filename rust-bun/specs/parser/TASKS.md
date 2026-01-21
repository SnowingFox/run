# JavaScript/TypeScript Parser Tasks

## Prerequisites

- `bun-core` (for error types, allocators)

## Implementation Tasks

### Phase 1: Token Types and Lexer Foundation

- [ ] **TASK-PARSER-001**: Define all token types (TokenKind enum)
- [ ] **TASK-PARSER-002**: Implement Span and SourceLocation types
- [ ] **TASK-PARSER-003**: Implement basic Lexer structure
- [ ] **TASK-PARSER-004**: Implement identifier lexing with Unicode support
- [ ] **TASK-PARSER-005**: Implement string literal lexing (single/double quotes)
- [ ] **TASK-PARSER-006**: Implement numeric literal lexing (all formats)
- [ ] **TASK-PARSER-007**: Implement keyword detection and lookup table
- [ ] **TASK-PARSER-008**: Implement operator and punctuation lexing

### Phase 2: Advanced Lexer Features

- [ ] **TASK-PARSER-009**: Implement template literal lexing
- [ ] **TASK-PARSER-010**: Implement regular expression lexing
- [ ] **TASK-PARSER-011**: Implement JSX text lexing
- [ ] **TASK-PARSER-012**: Implement comment extraction (single-line, multi-line)
- [ ] **TASK-PARSER-013**: Implement escape sequence handling
- [ ] **TASK-PARSER-014**: Implement BigInt literal lexing
- [ ] **TASK-PARSER-015**: Implement hashbang comment handling

### Phase 3: AST Type Definitions

- [ ] **TASK-PARSER-016**: Define Statement types (all variants)
- [ ] **TASK-PARSER-017**: Define Expression types (all variants)
- [ ] **TASK-PARSER-018**: Define Declaration types
- [ ] **TASK-PARSER-019**: Define Pattern types (destructuring)
- [ ] **TASK-PARSER-020**: Define JSX AST types
- [ ] **TASK-PARSER-021**: Define TypeScript AST types
- [ ] **TASK-PARSER-022**: Implement AST visitor trait

### Phase 4: Basic Parser

- [ ] **TASK-PARSER-023**: Implement Parser structure with options
- [ ] **TASK-PARSER-024**: Implement primary expression parsing
- [ ] **TASK-PARSER-025**: Implement operator precedence (Pratt parsing)
- [ ] **TASK-PARSER-026**: Implement statement parsing
- [ ] **TASK-PARSER-027**: Implement function declaration parsing
- [ ] **TASK-PARSER-028**: Implement class declaration parsing
- [ ] **TASK-PARSER-029**: Implement variable declaration parsing
- [ ] **TASK-PARSER-030**: Implement control flow statement parsing

### Phase 5: ES Module Parsing

- [ ] **TASK-PARSER-031**: Implement import declaration parsing
- [ ] **TASK-PARSER-032**: Implement export declaration parsing
- [ ] **TASK-PARSER-033**: Implement dynamic import parsing
- [ ] **TASK-PARSER-034**: Implement import.meta parsing

### Phase 6: Advanced Expression Parsing

- [ ] **TASK-PARSER-035**: Implement arrow function parsing
- [ ] **TASK-PARSER-036**: Implement destructuring patterns
- [ ] **TASK-PARSER-037**: Implement spread/rest elements
- [ ] **TASK-PARSER-038**: Implement template literal parsing
- [ ] **TASK-PARSER-039**: Implement async/await parsing
- [ ] **TASK-PARSER-040**: Implement generator function parsing

### Phase 7: JSX Parsing

- [ ] **TASK-PARSER-041**: Implement JSX element parsing
- [ ] **TASK-PARSER-042**: Implement JSX attribute parsing
- [ ] **TASK-PARSER-043**: Implement JSX expression containers
- [ ] **TASK-PARSER-044**: Implement JSX fragment parsing
- [ ] **TASK-PARSER-045**: Implement JSX spread attributes

### Phase 8: TypeScript Parsing

- [ ] **TASK-PARSER-046**: Implement type annotation parsing
- [ ] **TASK-PARSER-047**: Implement interface declaration parsing
- [ ] **TASK-PARSER-048**: Implement type alias parsing
- [ ] **TASK-PARSER-049**: Implement generic parameter parsing
- [ ] **TASK-PARSER-050**: Implement enum declaration parsing
- [ ] **TASK-PARSER-051**: Implement namespace/module parsing
- [ ] **TASK-PARSER-052**: Implement decorator parsing
- [ ] **TASK-PARSER-053**: Implement satisfies operator
- [ ] **TASK-PARSER-054**: Implement const type parameters

### Phase 9: Error Handling

- [ ] **TASK-PARSER-055**: Implement error recovery strategies
- [ ] **TASK-PARSER-056**: Implement diagnostic messages
- [ ] **TASK-PARSER-057**: Implement source location tracking
- [ ] **TASK-PARSER-058**: Implement syntax error suggestions

### Phase 10: Printer

- [ ] **TASK-PARSER-059**: Implement basic code printer
- [ ] **TASK-PARSER-060**: Implement minification mode
- [ ] **TASK-PARSER-061**: Implement source map generation
- [ ] **TASK-PARSER-062**: Implement JSX printing
- [ ] **TASK-PARSER-063**: Implement TypeScript printing

## Test Tasks

- [ ] **TEST-PARSER-001**: Token type tests for all token kinds
- [ ] **TEST-PARSER-002**: Lexer tests for all JavaScript syntax
- [ ] **TEST-PARSER-003**: Parser tests using Test262 subset
- [ ] **TEST-PARSER-004**: TypeScript syntax tests
- [ ] **TEST-PARSER-005**: JSX parsing tests
- [ ] **TEST-PARSER-006**: Round-trip print/parse tests
- [ ] **TEST-PARSER-007**: Error recovery tests
- [ ] **TEST-PARSER-008**: Performance benchmarks

## Integration Tasks

- [ ] **INT-PARSER-001**: Integrate with bundler for source parsing
- [ ] **INT-PARSER-002**: Integrate with transpiler for TypeScript stripping
- [ ] **INT-PARSER-003**: Expose visitor API for code analysis
