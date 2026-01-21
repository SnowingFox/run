# FFI Implementation Plan

## Dependencies

```toml
[dependencies]
libffi = "3"
libloading = "0.8"
```

## Architecture

```
bun-ffi/
├── src/
│   ├── lib.rs
│   ├── library.rs      # dlopen/dlsym
│   ├── types.rs        # FFI types
│   ├── call.rs         # Function calling
│   ├── pointer.rs      # Pointer ops
│   └── cc.rs           # C compiler
```

## Implementation Order

1. Library loading
2. Basic types
3. Function calls
4. Pointers
5. Callbacks
6. C compiler
