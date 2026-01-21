# Shell Tasks

## Prerequisites

- `bun-core` (error types, file system)

## Implementation Tasks

### Phase 1: Parser

- [ ] **TASK-SHELL-001**: Create crate structure
- [ ] **TASK-SHELL-002**: Implement tokenizer
- [ ] **TASK-SHELL-003**: Parse simple commands
- [ ] **TASK-SHELL-004**: Parse pipelines
- [ ] **TASK-SHELL-005**: Parse lists (&&, ||, ;)
- [ ] **TASK-SHELL-006**: Parse redirections
- [ ] **TASK-SHELL-007**: Parse subshells
- [ ] **TASK-SHELL-008**: Parse loops (for, while)
- [ ] **TASK-SHELL-009**: Parse conditionals (if)

### Phase 2: Expansion

- [ ] **TASK-SHELL-010**: Variable expansion ($VAR)
- [ ] **TASK-SHELL-011**: Brace expansion ({a,b,c})
- [ ] **TASK-SHELL-012**: Tilde expansion (~)
- [ ] **TASK-SHELL-013**: Glob expansion (*, ?, **)
- [ ] **TASK-SHELL-014**: Command substitution $(cmd)
- [ ] **TASK-SHELL-015**: Arithmetic expansion $((expr))
- [ ] **TASK-SHELL-016**: Quote handling

### Phase 3: Builtins

- [ ] **TASK-SHELL-017**: cd
- [ ] **TASK-SHELL-018**: echo
- [ ] **TASK-SHELL-019**: pwd
- [ ] **TASK-SHELL-020**: export/unset
- [ ] **TASK-SHELL-021**: exit
- [ ] **TASK-SHELL-022**: true/false
- [ ] **TASK-SHELL-023**: which
- [ ] **TASK-SHELL-024**: cat
- [ ] **TASK-SHELL-025**: ls
- [ ] **TASK-SHELL-026**: mkdir/rmdir
- [ ] **TASK-SHELL-027**: rm
- [ ] **TASK-SHELL-028**: mv/cp
- [ ] **TASK-SHELL-029**: touch
- [ ] **TASK-SHELL-030**: seq/yes
- [ ] **TASK-SHELL-031**: basename/dirname

### Phase 4: Execution

- [ ] **TASK-SHELL-032**: Command execution (spawn)
- [ ] **TASK-SHELL-033**: Pipeline execution
- [ ] **TASK-SHELL-034**: Redirection handling
- [ ] **TASK-SHELL-035**: Background execution
- [ ] **TASK-SHELL-036**: Subshell execution
- [ ] **TASK-SHELL-037**: Exit code handling

### Phase 5: Advanced Features

- [ ] **TASK-SHELL-038**: Environment management
- [ ] **TASK-SHELL-039**: Signal handling
- [ ] **TASK-SHELL-040**: Error messages
- [ ] **TASK-SHELL-041**: Async I/O

## Test Tasks

- [ ] **TEST-SHELL-001**: Parser tests
- [ ] **TEST-SHELL-002**: Expansion tests
- [ ] **TEST-SHELL-003**: Builtin tests
- [ ] **TEST-SHELL-004**: Pipeline tests
- [ ] **TEST-SHELL-005**: Integration tests

## Integration Tasks

- [ ] **INT-SHELL-001**: Expose as Bun.$ API
- [ ] **INT-SHELL-002**: Tagged template support
