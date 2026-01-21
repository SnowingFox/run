# Shell Specification

## Overview

The shell module implements Bun's cross-platform shell (`$` tagged template literal) with built-in commands, pipelines, and POSIX-compatible syntax. It enables running shell commands directly from JavaScript.

**Architecture Note** (from `interpreter.zig`):
> This is a "state-machine based tree-walking, trampoline-driven continuation-passing style interpreter"

The shell uses non-blocking IO to avoid blocking the main JS thread, building a tree of state machines from the AST that can suspend and resume execution.

## Bun Reference

- Shell: `bun-main/src/shell/shell.zig`
- Interpreter: `bun-main/src/shell/interpreter.zig`
- Builtins: `bun-main/src/shell/builtin/`
- Parser: `bun-main/src/shell/ParsedShellScript.zig`
- Braces: `bun-main/src/shell/braces.zig`
- Glob: Uses `bun.glob.BunGlobWalkerZ`

## Public API

### Shell Execution

```rust
pub async fn execute(script: &str, options: ShellOptions) -> Result<ShellOutput>;

pub struct ShellOptions {
    pub cwd: PathBuf,
    pub env: HashMap<String, String>,
    pub stdin: StdioConfig,
    pub stdout: StdioConfig,
    pub stderr: StdioConfig,
    pub timeout: Option<Duration>,
}

pub struct ShellOutput {
    pub stdout: Vec<u8>,
    pub stderr: Vec<u8>,
    pub exit_code: i32,
}

pub enum StdioConfig {
    Inherit,
    Pipe,
    Null,
    File(PathBuf),
}
```

### Shell Parser

```rust
pub struct ShellParser;

impl ShellParser {
    pub fn parse(script: &str) -> Result<ShellAst>;
}

pub enum ShellAst {
    Command(CommandNode),
    Pipeline(Vec<CommandNode>),
    List(Vec<ShellAst>, ListType),
    If(IfNode),
    For(ForNode),
    While(WhileNode),
    Subshell(Box<ShellAst>),
    Assignment(AssignmentNode),
}

pub enum ListType {
    And,     // &&
    Or,      // ||
    Sequence, // ;
    Background, // &
}
```

### Built-in Commands

```rust
pub trait Builtin: Send + Sync {
    fn name(&self) -> &str;
    fn execute(&self, args: &[&str], ctx: &mut ShellContext) -> Result<i32>;
}

// Built-in implementations
pub struct CdBuiltin;
pub struct EchoBuiltin;
pub struct PwdBuiltin;
pub struct ExportBuiltin;
pub struct UnsetBuiltin;
pub struct ExitBuiltin;
pub struct TrueBuiltin;
pub struct FalseBuiltin;
pub struct WhichBuiltin;
pub struct CatBuiltin;
pub struct LsBuiltin;
pub struct MkdirBuiltin;
pub struct RmBuiltin;
pub struct MvBuiltin;
pub struct CpBuiltin;
pub struct TouchBuiltin;
pub struct SeqBuiltin;
pub struct YesBuiltin;
pub struct BasenameBuiltin;
pub struct DirnameBuiltin;
```

### Shell Context

```rust
pub struct ShellContext {
    pub cwd: PathBuf,
    pub env: HashMap<String, String>,
    pub exit_code: i32,
    pub builtins: HashMap<String, Box<dyn Builtin>>,
}

impl ShellContext {
    pub fn new() -> Self;
    pub fn get_var(&self, name: &str) -> Option<&str>;
    pub fn set_var(&mut self, name: &str, value: String);
    pub fn expand(&self, word: &str) -> Result<String>;
}
```

### Memory Management

Based on `interpreter.zig`:

```rust
/// Allocation tracking scope for memory management
pub struct AllocationScope {
    allocator: Box<dyn Allocator>,
    // Tracks allocations for debug leak detection
}

impl AllocationScope {
    pub fn new(parent_allocator: &dyn Allocator) -> Self;
    /// Mark a slice as "leaked" (managed elsewhere, e.g., by EnvStr)
    pub fn leak_slice(&mut self, slice: &[u8]);
}
```

### Copy-on-Write File Descriptor

For handling non-blocking IO without epoll/kqueue conflicts:

```rust
/// Copy-on-write file descriptor to avoid multiple non-blocking writers
pub struct CowFd {
    fd: RawFd,
    refcount: u32,
    being_used: bool,
}

impl CowFd {
    pub fn new(fd: RawFd) -> Self;
    /// Get fd for writing, duplicating if already in use
    pub fn use_for_write(&mut self) -> Result<RawFd>;
    pub fn done_using(&mut self);
    pub fn ref_count(&mut self);
    pub fn deref(&mut self);
}
```

### Coroutine Result

State machine execution results:

```rust
pub enum CoroutineResult {
    /// Caller can continue execution
    Continue,
    /// Execution yielded, needs to be resumed later
    Yield,
    /// Execution completed
    Done,
}
```

## Behavior Specifications

### Syntax Support

- Commands: `ls -la`
- Pipelines: `cat file | grep pattern | wc -l`
- Redirections: `echo hello > file.txt`, `cmd 2>&1`
- And/Or lists: `cmd1 && cmd2`, `cmd1 || cmd2`
- Background: `cmd &`
- Subshells: `(cd dir && ls)`
- Command substitution: `$(cmd)`, `` `cmd` ``
- Variable expansion: `$VAR`, `${VAR}`
- Glob patterns: `*.txt`, `**/*.js`
- Brace expansion: `file{1,2,3}.txt`
- Quoted strings: `"double"`, `'single'`

### Variable Expansion

```
$VAR        - Simple expansion
${VAR}      - Braced expansion
${VAR:-default}  - Default value
${VAR:=default}  - Assign default
${VAR:+alt}      - Alternative value
${VAR:?error}    - Error if unset
${#VAR}          - String length
```

### Glob Patterns

```
*           - Match any characters
?           - Match single character
[abc]       - Match character class
[!abc]      - Negated character class
**          - Match directories recursively
```

### Redirections

```
> file      - Redirect stdout
>> file     - Append stdout
< file      - Redirect stdin
2> file     - Redirect stderr
2>&1        - Redirect stderr to stdout
&> file     - Redirect both
```

## Edge Cases

### Escaping

- Backslash escaping: `\$`, `\\`
- Single quotes preserve everything
- Double quotes allow expansion

### Signal Handling

- SIGINT propagation to child
- Job control (if enabled)

### Error Handling

- Command not found
- Permission denied
- Broken pipe handling

## Test Requirements

### Unit Tests

- [ ] Parser tests for all syntax
- [ ] Variable expansion tests
- [ ] Glob matching tests
- [ ] Builtin command tests

### Integration Tests

- [ ] Pipeline execution
- [ ] Redirection tests
- [ ] Subshell isolation
- [ ] Exit code propagation

### Compatibility Tests

- [ ] Match bash behavior for common cases
- [ ] Windows compatibility
