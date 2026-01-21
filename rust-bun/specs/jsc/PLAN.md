# JSC Bindings Implementation Plan

## Dependencies

### External Crates

```toml
[dependencies]
bun-core = { path = "../bun-core" }
tokio = { version = "1.43", features = ["full"] }
# rusty_jsc = { git = "https://github.com/aspect-dev/aspect.git" }
parking_lot = "0.12"
dashmap = "6"
```

### System Dependencies

- macOS: JavaScriptCore.framework (included in system)
- Linux: WebKitGTK (libjavascriptcoregtk-4.0-dev)

### Internal Dependencies

- `bun-core`: Error types

## Architecture

### Module Structure

```
bun-jsc/
├── src/
│   ├── lib.rs
│   ├── context.rs          # JSContext
│   ├── value.rs            # JSValue
│   ├── object.rs           # JSObject
│   ├── function.rs         # JSFunction, native callbacks
│   ├── class.rs            # JSClass, ClassBuilder
│   ├── promise.rs          # JSPromise
│   ├── array.rs            # Array helpers
│   ├── string.rs           # JSString
│   ├── error.rs            # JS exceptions
│   ├── module.rs           # Module loading
│   ├── vm.rs               # VirtualMachine
│   ├── event_loop.rs       # Event loop integration
│   ├── global/
│   │   ├── mod.rs
│   │   ├── console.rs
│   │   ├── timers.rs
│   │   ├── process.rs
│   │   └── bun.rs
│   └── util/
│       ├── mod.rs
│       └── gc.rs           # GC utilities
└── tests/
    ├── basic_tests.rs
    ├── object_tests.rs
    └── async_tests.rs
```

### Key Design Decisions

#### 1. Safe Wrapper Pattern

```rust
pub struct JSValue {
    raw: JSValueRef,
    ctx: JSContext,
}

impl JSValue {
    pub(crate) unsafe fn from_raw(ctx: &JSContext, raw: JSValueRef) -> Self {
        // Protect from GC
        JSValueProtect(ctx.as_raw(), raw);
        Self { raw, ctx: ctx.clone() }
    }
}

impl Drop for JSValue {
    fn drop(&mut self) {
        unsafe {
            JSValueUnprotect(self.ctx.as_raw(), self.raw);
        }
    }
}
```

#### 2. Native Function Binding

```rust
pub fn create_native_function<F>(ctx: &JSContext, name: &str, func: F) -> JSObject
where
    F: Fn(&JSContext, &JSObject, &[JSValue]) -> Result<JSValue> + 'static,
{
    let boxed = Box::new(func);
    let data = Box::into_raw(boxed) as *mut c_void;

    extern "C" fn callback(
        ctx: JSContextRef,
        function: JSObjectRef,
        this: JSObjectRef,
        argc: usize,
        argv: *const JSValueRef,
        exception: *mut JSValueRef,
    ) -> JSValueRef {
        // Reconstruct Rust types, call function
    }

    unsafe {
        let obj = JSObjectMakeFunctionWithCallback(
            ctx.as_raw(),
            name.as_ptr(),
            Some(callback),
        );
        JSObjectSetPrivate(obj, data);
        JSObject::from_raw(ctx, obj)
    }
}
```

#### 3. Event Loop Integration

```rust
pub struct EventLoop {
    microtask_queue: VecDeque<JSValue>,
    timers: BinaryHeap<Timer>,
}

impl EventLoop {
    pub async fn run(&mut self, vm: &VirtualMachine) -> Result<()> {
        loop {
            // Run microtasks
            while let Some(task) = self.microtask_queue.pop_front() {
                task.call(None, &[])?;
            }

            // Check timers
            if let Some(timer) = self.timers.peek() {
                if timer.deadline <= Instant::now() {
                    let timer = self.timers.pop().unwrap();
                    timer.callback.call(None, &[])?;
                }
            }

            // Yield to tokio
            tokio::task::yield_now().await;
        }
    }
}
```

## Implementation Order

### Month 1: Core Bindings

| Week | Tasks                      |
| ---- | -------------------------- |
| 1    | JSContext, basic JSValue   |
| 2    | Type checking, conversions |
| 3    | JSObject property access   |
| 4    | Function calls             |

### Month 2: Classes & Async

| Week | Tasks                   |
| ---- | ----------------------- |
| 1    | Native function binding |
| 2    | Class definitions       |
| 3    | Promises                |
| 4    | Async/await support     |

### Month 3: VM & Modules

| Week | Tasks             |
| ---- | ----------------- |
| 1    | Script evaluation |
| 2    | Module system     |
| 3    | Event loop        |
| 4    | Timers            |

### Month 4: Global Objects

| Week | Tasks               |
| ---- | ------------------- |
| 1    | Console             |
| 2    | Process             |
| 3    | Bun global          |
| 4    | Integration testing |

## Risk Analysis

### High Risk

| Risk                   | Mitigation                    |
| ---------------------- | ----------------------------- |
| rusty_jsc stability    | May need to fork/maintain     |
| Memory management bugs | Extensive testing, sanitizers |
| Platform differences   | CI on all platforms           |

### Medium Risk

| Risk                  | Mitigation                |
| --------------------- | ------------------------- |
| Event loop complexity | Clear architecture        |
| Exception handling    | Comprehensive error types |

### Low Risk

| Risk               | Mitigation         |
| ------------------ | ------------------ |
| Basic JS execution | JSC is well-tested |

## Performance Targets

- Script evaluation: Match JSC native speed
- Function calls from Rust: < 100ns overhead
- Object property access: < 50ns overhead
