# JavaScript/TypeScript Parser Specification

## Overview

The parser module provides a complete JavaScript/TypeScript parser, including lexer, AST types, parser, and printer. This is a core component used by the bundler, transpiler, and runtime.

## Bun Reference

- Lexer: `bun-main/src/js_lexer.zig`
- Lexer tables: `bun-main/src/js_lexer_tables.zig`
- Parser: `bun-main/src/js_parser.zig`
- Printer: `bun-main/src/js_printer.zig`
- AST: `bun-main/src/ast/`
- Transpiler: `bun-main/src/transpiler.zig`

## Public API

### Lexer

```rust
pub struct Lexer<'a> {
    source: &'a str,
    current_pos: usize,
    line: u32,
    column: u32,
}

impl<'a> Lexer<'a> {
    pub fn new(source: &'a str) -> Self;
    pub fn next_token(&mut self) -> Result<Token>;
    pub fn peek(&self) -> Result<Token>;
    pub fn location(&self) -> SourceLocation;
}

pub struct Token {
    pub kind: TokenKind,
    pub span: Span,
    pub value: TokenValue,
}

pub enum TokenKind {
    // Literals
    Identifier,
    StringLiteral,
    NumericLiteral,
    BigIntLiteral,
    RegExpLiteral,
    TemplateLiteral,
    TemplateHead,
    TemplateMiddle,
    TemplateTail,

    // Keywords (100+)
    Async, Await, Break, Case, Catch, Class, Const, Continue,
    Debugger, Default, Delete, Do, Else, Export, Extends,
    Finally, For, Function, If, Import, In, Instanceof,
    Let, New, Of, Return, Static, Super, Switch, This,
    Throw, Try, Typeof, Var, Void, While, With, Yield,

    // TypeScript keywords
    Abstract, As, Asserts, Any, Boolean, Constructor, Declare,
    Enum, From, Get, Global, Implements, Infer, Interface,
    Is, Keyof, Module, Namespace, Never, Number, Object,
    Override, Package, Private, Protected, Public, Readonly,
    Require, Set, String, Symbol, Type, Undefined, Unique, Unknown,

    // Punctuation
    OpenBrace, CloseBrace, OpenParen, CloseParen,
    OpenBracket, CloseBracket, Dot, DotDotDot, Semicolon,
    Comma, QuestionMark, QuestionDot, Colon, ColonColon,

    // Operators
    Plus, Minus, Star, StarStar, Slash, Percent,
    PlusPlus, MinusMinus, LessThan, GreaterThan,
    LessThanEquals, GreaterThanEquals, EqualsEquals,
    ExclamationEquals, EqualsEqualsEquals, ExclamationEqualsEquals,
    Arrow, Equals, PlusEquals, MinusEquals, StarEquals,
    SlashEquals, PercentEquals, StarStarEquals,
    LessThanLessThan, GreaterThanGreaterThan, GreaterThanGreaterThanGreaterThan,
    Ampersand, Bar, Caret, Tilde, Exclamation,
    AmpersandAmpersand, BarBar, QuestionQuestion,
    AmpersandEquals, BarEquals, CaretEquals,
    AmpersandAmpersandEquals, BarBarEquals, QuestionQuestionEquals,

    // Special
    Eof,
    Invalid,

    // JSX
    JsxText,
    JsxTagStart,
    JsxTagEnd,
}
```

### Parser

```rust
pub struct Parser<'a> {
    lexer: Lexer<'a>,
    options: ParserOptions,
}

pub struct ParserOptions {
    pub jsx: JsxOptions,
    pub typescript: bool,
    pub source_type: SourceType,
    pub target: EcmaVersion,
}

pub enum SourceType {
    Script,
    Module,
    CommonJS,
}

impl<'a> Parser<'a> {
    pub fn new(source: &'a str, options: ParserOptions) -> Self;
    pub fn parse(&mut self) -> Result<Ast>;
    pub fn parse_expression(&mut self) -> Result<Expr>;
}
```

### AST Types

```rust
pub struct Ast {
    pub source_type: SourceType,
    pub body: Vec<Stmt>,
    pub comments: Vec<Comment>,
    pub tokens: Vec<Token>,
}

pub enum Stmt {
    Block(BlockStmt),
    Empty(EmptyStmt),
    Expression(ExprStmt),
    If(IfStmt),
    DoWhile(DoWhileStmt),
    While(WhileStmt),
    For(ForStmt),
    ForIn(ForInStmt),
    ForOf(ForOfStmt),
    Switch(SwitchStmt),
    Continue(ContinueStmt),
    Break(BreakStmt),
    Return(ReturnStmt),
    With(WithStmt),
    Labeled(LabeledStmt),
    Throw(ThrowStmt),
    Try(TryStmt),
    Debugger(DebuggerStmt),
    Function(FunctionDecl),
    Class(ClassDecl),
    Variable(VariableDecl),
    Import(ImportDecl),
    Export(ExportDecl),
    // TypeScript
    TypeAlias(TypeAliasDecl),
    Interface(InterfaceDecl),
    Enum(EnumDecl),
    Namespace(NamespaceDecl),
}

pub enum Expr {
    Identifier(Identifier),
    Literal(Literal),
    This(ThisExpr),
    Array(ArrayExpr),
    Object(ObjectExpr),
    Function(FunctionExpr),
    Arrow(ArrowFunctionExpr),
    Class(ClassExpr),
    Unary(UnaryExpr),
    Update(UpdateExpr),
    Binary(BinaryExpr),
    Assign(AssignExpr),
    Logical(LogicalExpr),
    Member(MemberExpr),
    Conditional(ConditionalExpr),
    Call(CallExpr),
    New(NewExpr),
    Sequence(SequenceExpr),
    Spread(SpreadElement),
    Template(TemplateLiteral),
    TaggedTemplate(TaggedTemplateExpr),
    Yield(YieldExpr),
    Await(AwaitExpr),
    MetaProperty(MetaProperty),
    Import(ImportExpr),
    // JSX
    JsxElement(JsxElement),
    JsxFragment(JsxFragment),
    // TypeScript
    TypeAssertion(TypeAssertion),
    AsExpression(AsExpression),
    NonNullAssertion(NonNullAssertion),
    SatisfiesExpression(SatisfiesExpression),
}
```

### Printer

```rust
pub struct Printer {
    options: PrinterOptions,
    output: String,
    indent: usize,
    needs_semicolon: bool,
}

pub struct PrinterOptions {
    pub minify: bool,
    pub indent_size: usize,
    pub line_terminator: LineTerminator,
    pub source_map: Option<SourceMapBuilder>,
}

impl Printer {
    pub fn new(options: PrinterOptions) -> Self;
    pub fn print(&mut self, ast: &Ast) -> Result<String>;
    pub fn print_stmt(&mut self, stmt: &Stmt) -> Result<()>;
    pub fn print_expr(&mut self, expr: &Expr) -> Result<()>;
}
```

## Behavior Specifications

### Lexer Behavior

Based on `js_lexer.zig` implementation:

1. **Unicode Support**: Full Unicode support including identifiers with Unicode characters
2. **Automatic Semicolon Insertion (ASI)**: Track newlines for ASI rules via `has_newline_before`
3. **Regular Expression vs Division**: Context-aware disambiguation using `rescan_close_brace_as_template_token`
4. **Template Literals**: Proper handling of nested template expressions
5. **JSX**: Mode-switchable JSX lexing with `JSXPragma` for pragma extraction
6. **JSON Mode**: Configurable JSON parsing options:
   - `allow_comments`: For tsconfig.json style comments
   - `allow_trailing_commas`: For JSON5 compatibility
   - `json_warn_duplicate_keys`: Warn on duplicate keys
   - `guess_indentation`: Track indentation for formatting
7. **Comment Tracking**: `track_comments` for preserving comments
8. **Pure Comments**: `has_pure_comment_before` for `/* @__PURE__ */` annotations
9. **Source Mapping URL**: Extract `//# sourceMappingURL=` comments

### Parser Behavior

Based on `js_parser.zig` implementation:

1. **Error Recovery**: Continue parsing after errors when possible
2. **Cover Grammars**: Handle parenthesized expressions that could be arrows using `ExpressionTransposer`
3. **Strict Mode**: Track and enforce strict mode rules
4. **Var Relocation**: Use `RelocateVars` to handle var hoisting for dead code elimination
5. **Deferred Import Namespace**: Handle `import * as X` with `DeferredImportNamespace`
6. **TypeScript**: Full TypeScript 5.x support including:
   - Type annotations
   - Generics with variance annotations (`allow_in_out_variance_annotations`)
   - Const type parameters (`allow_const_modifier` - TS 5.0)
   - Empty type parameters (`allow_empty_type_parameters`)
   - Satisfies operator
   - Decorators (both legacy and stage 3)
7. **JSX Pragma**: Support `@jsx`, `@jsxFrag`, `@jsxRuntime`, `@jsxImportSource` pragmas
8. **Import Record Tracking**: Track all imports for bundler integration

### Printer Behavior

1. **Minification**: Remove whitespace, shorten names
2. **Source Maps**: Generate accurate source maps
3. **Semicolons**: Configurable semicolon insertion
4. **JSX**: Print valid JSX syntax

## Edge Cases

### Lexer Edge Cases

- Unicode escapes in identifiers: `\u0041` = `A`
- Legacy octal literals in non-strict mode
- Hashbang comments: `#!/usr/bin/env bun`
- HTML-style comments in scripts (not modules)
- Regular expression edge cases: `/[/]/`, `/=/`

### Parser Edge Cases

- `{ a: 1 }` as object vs block statement
- `function` at statement vs expression position
- `async function` vs `async` identifier + function
- `<T>expr` as JSX vs TypeScript type assertion
- `import.meta`, `import()` dynamic imports

### Printer Edge Cases

- Preserve parentheses for operator precedence
- Handle negative numbers: `- -1` vs `--1`
- Template literal escaping
- RegExp escaping for edge cases

## Test Requirements

### Lexer Tests

- [ ] All token types correctly identified
- [ ] Unicode identifiers
- [ ] All escape sequences
- [ ] Template literal nesting
- [ ] JSX text handling
- [ ] Regular expression edge cases
- [ ] Numeric literals (all formats)

### Parser Tests

- [ ] ES2024 full test suite compatibility
- [ ] TypeScript 5.x syntax support
- [ ] JSX parsing
- [ ] Error recovery
- [ ] Source location accuracy

### Printer Tests

- [ ] Round-trip parsing (parse -> print -> parse should be equal)
- [ ] Source map accuracy
- [ ] Minification correctness
- [ ] Semicolon handling

### Performance Tests

- [ ] Parse large files (> 1MB) in < 100ms
- [ ] Parse Three.js in < 50ms
- [ ] Memory usage benchmarks
