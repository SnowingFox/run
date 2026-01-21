# Test Runner Specification

## Overview

The test runner provides a Jest-compatible test framework with describe/it blocks, expect matchers, mocking, snapshots, and code coverage.

## Bun Reference

- Test command: `bun-main/src/cli/test_command.zig`
- Test module: `bun-main/src/bun.js/test/jest.zig`
- Scope functions: `bun-main/src/bun.js/test/bun_test.zig`
- Snapshots: `bun-main/src/bun.js/test/Snapshots.zig`

## Internal Architecture

Based on `jest.zig`:

```rust
/// Test runner state
pub struct TestRunner {
    /// Current file being tested
    pub current_file: CurrentFile,
    /// All test files
    pub files: FileList,
    /// File index map
    pub index: FileMap,
    /// Run only `.only` tests
    pub only: bool,
    /// Run `.todo` tests
    pub run_todo: bool,
    /// Parallel test execution
    pub concurrent: bool,
    /// Random order execution
    pub randomize: Option<Random>,
    /// Glob patterns for concurrent tests
    pub concurrent_test_glob: Option<Vec<String>>,
    /// Bail after N failures
    pub bail: u32,
    /// Max concurrent tests
    pub max_concurrency: u32,
    /// Snapshot manager
    pub snapshots: Snapshots,
    /// Default timeout in ms
    pub default_timeout_ms: u32,
    /// Override from setDefaultTimeout()
    pub default_timeout_override: u32,
    /// Test name filter regex
    pub filter_regex: Option<RegularExpression>,
    /// Unhandled errors between tests
    pub unhandled_errors_between_tests: u32,
    /// Test summary
    pub summary: Summary,
    /// Root test context
    pub bun_test_root: BunTestRoot,
}

pub struct Summary {
    pub pass: u32,
    pub expectations: u32,
    pub skip: u32,
    pub todo: u32,
    pub fail: u32,
    pub files: u32,
    pub skipped_because_label: u32,
}

pub struct CurrentFile {
    pub title: String,
    pub prefix: String,
    pub repeat_info: RepeatInfo,
    pub has_printed_filename: bool,
}

pub struct File {
    pub source: Source,
    pub log: Log,
}
```

## Public API

```rust
// Test definition
pub fn describe(name: &str, callback: impl Fn());
pub fn it(name: &str, callback: impl Fn());
pub fn test(name: &str, callback: impl Fn());
pub fn before_each(callback: impl Fn());
pub fn after_each(callback: impl Fn());
pub fn before_all(callback: impl Fn());
pub fn after_all(callback: impl Fn());

// Modifiers
pub fn skip(name: &str, callback: impl Fn());
pub fn only(name: &str, callback: impl Fn());
pub fn todo(name: &str);
pub fn each(cases: &[T]) -> TestEach<T>;

// xtest, xit variants (skip)
pub fn xtest(name: &str, callback: impl Fn());
pub fn xit(name: &str, callback: impl Fn());
pub fn xdescribe(name: &str, callback: impl Fn());

// Expectations
pub fn expect<T>(value: T) -> Expectation<T>;

impl<T> Expectation<T> {
    pub fn to_be(&self, expected: T);
    pub fn to_equal(&self, expected: T);
    pub fn to_be_truthy(&self);
    pub fn to_be_falsy(&self);
    pub fn to_be_null(&self);
    pub fn to_be_undefined(&self);
    pub fn to_contain(&self, item: T);
    pub fn to_have_length(&self, len: usize);
    pub fn to_throw(&self);
    pub fn to_match_snapshot(&self);
    pub fn not(&self) -> Expectation<T>;
}

// Mocking
pub fn mock<F: Fn>(func: F) -> Mock<F>;
pub fn spy_on<T>(object: &T, method: &str) -> Spy;

// Time
pub fn set_system_time(time: DateTime);
pub fn use_fake_timers();
pub fn use_real_timers();

// Timeout
pub fn set_default_timeout(timeout_ms: u32);
```

## Features

- Jest-compatible API
- Watch mode with re-run
- Code coverage
- Snapshot testing
- Mocking and spies
- Parallel test execution
- Test filtering (--filter)
- Timeout handling

## Test Requirements

- [ ] All matcher implementations
- [ ] Snapshot management
- [ ] Mock functionality
- [ ] Coverage reporting
- [ ] Watch mode
