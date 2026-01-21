# FFI Specification

## Overview

The FFI module provides Foreign Function Interface support for calling native C libraries directly from JavaScript without writing native bindings.

## Bun Reference

- FFI: `bun-main/src/bun.js/api/ffi.zig`
- C Compiler: `bun-main/src/bun.js/api/FFI.h`

## Public API

```rust
// Load a dynamic library
pub fn dlopen(path: &str, symbols: &SymbolDefinitions) -> Result<Library>;

pub struct Library {
    handle: *mut c_void,
    symbols: HashMap<String, Symbol>,
}

impl Library {
    pub fn close(&self);
    pub fn symbol<T>(&self, name: &str) -> Result<T>;
}

pub struct SymbolDefinitions {
    pub symbols: HashMap<String, FunctionSignature>,
}

pub struct FunctionSignature {
    pub args: Vec<FFIType>,
    pub returns: FFIType,
}

pub enum FFIType {
    Void,
    Bool,
    I8, I16, I32, I64,
    U8, U16, U32, U64,
    F32, F64,
    Pointer,
    CString,
}

// Pointer operations
pub fn ptr(buffer: &[u8]) -> *const u8;
pub fn to_buffer(ptr: *const u8, len: usize) -> Vec<u8>;
pub fn read<T>(ptr: *const T) -> T;
pub fn write<T>(ptr: *mut T, value: T);

// C Compiler (bun:ffi cc)
pub fn cc(source: &str, options: CcOptions) -> Result<Library>;
```

## Features

- Dynamic library loading
- Type-safe function calls
- Pointer manipulation
- Buffer to/from native memory
- Built-in C compiler
- Callback support (JS -> native -> JS)

## Test Requirements

- [ ] Library loading
- [ ] Function calls with all types
- [ ] Pointer operations
- [ ] Callback handling
- [ ] Error handling
