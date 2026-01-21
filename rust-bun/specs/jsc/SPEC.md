# JavaScriptCore Bindings Specification

## Overview

The JSC module provides Rust bindings to WebKit's JavaScriptCore engine using the `rusty_jsc` crate. This is the core JavaScript execution engine for Rust-Bun, handling all JS/TS code execution.

## Bun Reference

- JSC bindings: `bun-main/src/bun.js/bindings/`
- JavaScript Core C API: `bun-main/src/bun.js/javascript_core_c_api.zig`
- Virtual Machine: `bun-main/src/bun.js/VirtualMachine.zig`
- Global Object: `bun-main/src/bun.js/bindings/ZigGlobalObject.cpp`
- Event Loop: `bun-main/src/bun.js/event_loop/`
- JSC Array Buffer: `bun-main/src/bun.js/jsc/array_buffer.zig`
- Hot Reloader: `bun-main/src/bun.js/hot_reloader.zig`
- Module Loader: `bun-main/src/bun.js/ModuleLoader.zig`
- Strong/Weak refs: `bun-main/src/bun.js/Strong.zig`, `Weak.zig`
- Runtime Transpiler Cache: `bun-main/src/bun.js/RuntimeTranspilerCache.zig`

## Integration Note

For Rust, we use `rusty_jsc` crate to interact with JavaScriptCore. The bindings should match Bun's patterns for:

- Value creation and conversion
- Object property access
- Function definition and calls
- Class registration
- Promise handling
- Event loop integration

## Public API

### Virtual Machine

```rust
pub struct VirtualMachine {
    ctx: JSContext,
    global: JSGlobalObject,
    event_loop: EventLoop,
}

impl VirtualMachine {
    pub fn new() -> Result<Self>;
    pub fn evaluate(&self, code: &str, filename: Option<&str>) -> Result<JSValue>;
    pub fn evaluate_module(&self, path: &Path) -> Result<JSValue>;
    pub fn run_event_loop(&self) -> Result<()>;
    pub fn global_object(&self) -> &JSGlobalObject;
}
```

### JSContext

```rust
pub struct JSContext {
    inner: *mut OpaqueJSContext,
}

impl JSContext {
    pub fn new() -> Self;
    pub fn global_object(&self) -> JSGlobalObject;
    pub fn evaluate_script(&self, script: &str) -> Result<JSValue>;
    pub fn check_exception(&self) -> Option<JSValue>;
    pub fn garbage_collect(&self);
}
```

### JSValue

```rust
pub struct JSValue {
    inner: JSValueRef,
    ctx: JSContext,
}

impl JSValue {
    // Type checking
    pub fn is_undefined(&self) -> bool;
    pub fn is_null(&self) -> bool;
    pub fn is_boolean(&self) -> bool;
    pub fn is_number(&self) -> bool;
    pub fn is_string(&self) -> bool;
    pub fn is_object(&self) -> bool;
    pub fn is_array(&self) -> bool;
    pub fn is_function(&self) -> bool;
    pub fn is_promise(&self) -> bool;

    // Conversions
    pub fn to_boolean(&self) -> bool;
    pub fn to_number(&self) -> Result<f64>;
    pub fn to_string(&self) -> Result<String>;
    pub fn to_object(&self) -> Result<JSObject>;

    // Creation
    pub fn undefined(ctx: &JSContext) -> Self;
    pub fn null(ctx: &JSContext) -> Self;
    pub fn boolean(ctx: &JSContext, value: bool) -> Self;
    pub fn number(ctx: &JSContext, value: f64) -> Self;
    pub fn string(ctx: &JSContext, value: &str) -> Self;

    // JSON
    pub fn to_json(&self) -> Result<String>;
    pub fn from_json(ctx: &JSContext, json: &str) -> Result<Self>;
}
```

### JSObject

```rust
pub struct JSObject {
    inner: JSObjectRef,
    ctx: JSContext,
}

impl JSObject {
    pub fn new(ctx: &JSContext) -> Self;
    pub fn new_array(ctx: &JSContext) -> Self;

    // Properties
    pub fn get_property(&self, name: &str) -> Result<JSValue>;
    pub fn set_property(&self, name: &str, value: JSValue) -> Result<()>;
    pub fn delete_property(&self, name: &str) -> Result<bool>;
    pub fn has_property(&self, name: &str) -> bool;
    pub fn property_names(&self) -> Vec<String>;

    // Index access (arrays)
    pub fn get_index(&self, index: u32) -> Result<JSValue>;
    pub fn set_index(&self, index: u32, value: JSValue) -> Result<()>;

    // Function calls
    pub fn call(&self, this: Option<&JSObject>, args: &[JSValue]) -> Result<JSValue>;
    pub fn call_method(&self, name: &str, args: &[JSValue]) -> Result<JSValue>;

    // Constructor
    pub fn new_instance(&self, args: &[JSValue]) -> Result<JSObject>;
}
```

### Function Definition

```rust
pub type NativeFunction = fn(&JSContext, &JSObject, &[JSValue]) -> Result<JSValue>;

pub struct JSFunction;

impl JSFunction {
    pub fn new(ctx: &JSContext, name: &str, callback: NativeFunction) -> JSObject;
    pub fn new_with_data<T: 'static>(
        ctx: &JSContext,
        name: &str,
        callback: fn(&JSContext, &JSObject, &[JSValue], &T) -> Result<JSValue>,
        data: T,
    ) -> JSObject;
}
```

### Class Definition

```rust
pub struct JSClass {
    name: String,
    constructor: Option<NativeFunction>,
    methods: HashMap<String, NativeFunction>,
    static_methods: HashMap<String, NativeFunction>,
    properties: HashMap<String, PropertyDescriptor>,
}

pub struct PropertyDescriptor {
    pub getter: Option<NativeFunction>,
    pub setter: Option<NativeFunction>,
    pub enumerable: bool,
    pub configurable: bool,
}

impl JSClass {
    pub fn builder(name: &str) -> JSClassBuilder;
    pub fn register(&self, ctx: &JSContext) -> JSObject;
}

pub struct JSClassBuilder {
    inner: JSClass,
}

impl JSClassBuilder {
    pub fn constructor(self, func: NativeFunction) -> Self;
    pub fn method(self, name: &str, func: NativeFunction) -> Self;
    pub fn static_method(self, name: &str, func: NativeFunction) -> Self;
    pub fn property(self, name: &str, desc: PropertyDescriptor) -> Self;
    pub fn build(self) -> JSClass;
}
```

### Promise Handling

```rust
pub struct JSPromise {
    inner: JSObject,
}

impl JSPromise {
    pub fn new(ctx: &JSContext, executor: impl FnOnce(Resolver, Rejecter)) -> Self;
    pub fn resolve(ctx: &JSContext, value: JSValue) -> Self;
    pub fn reject(ctx: &JSContext, error: JSValue) -> Self;
    pub fn then(&self, on_fulfilled: JSObject, on_rejected: Option<JSObject>) -> Self;
    pub fn catch(&self, on_rejected: JSObject) -> Self;
}

pub struct Resolver(Box<dyn FnOnce(JSValue)>);
pub struct Rejecter(Box<dyn FnOnce(JSValue)>);
```

### Module Loading

```rust
pub trait ModuleLoader {
    fn resolve(&self, specifier: &str, referrer: &str) -> Result<String>;
    fn load(&self, resolved: &str) -> Result<String>;
}

impl VirtualMachine {
    pub fn set_module_loader(&self, loader: impl ModuleLoader + 'static);
}
```

## Behavior Specifications

### Memory Management

- All JSValues are reference counted
- Use prevent/allow bridging for preventing GC
- Clean up properly on Rust drop

### Exception Handling

- Check for exceptions after JS calls
- Convert JS exceptions to Rust errors
- Preserve stack traces

### Event Loop Integration

Based on `event_loop/` directory:

- Integrate with tokio for async operations
- Handle microtasks (Promise resolution)
- Timer integration (setTimeout, setInterval)

Key components from Bun's event loop:

- `AnyEventLoop`: Union of JavaScript and Mini event loops
- `AnyTask`: Generic task wrapper for deferred execution
- `ConcurrentTask`: Tasks that can run on worker threads
- `DeferredTaskQueue`: Queue for tasks to run after current execution
- `GarbageCollectionController`: Controls when GC runs
- `MiniEventLoop`: Lightweight event loop for non-JS contexts
- `PosixSignalHandle`: Signal handling integration
- `WorkTask`: Work pool task execution

```rust
pub enum AnyEventLoop {
    Js(JsEventLoop),
    Mini(MiniEventLoop),
}

pub struct DeferredTaskQueue {
    tasks: VecDeque<Box<dyn Task>>,
}

pub trait Task: Send {
    fn run(&mut self);
}
```

## Edge Cases

### Circular References

- Handle circular object references in JSON
- GC can collect cycles

### Large Numbers

- Handle BigInt separately
- NaN, Infinity handling

### Encoding

- Proper UTF-8/UTF-16 conversion
- Handle invalid strings

## Test Requirements

### Unit Tests

- [ ] JSValue type conversions
- [ ] Object property access
- [ ] Function calls
- [ ] Class definitions
- [ ] Promise handling

### Integration Tests

- [ ] Execute JavaScript files
- [ ] Module loading
- [ ] Event loop
- [ ] Native function binding

### Memory Tests

- [ ] No memory leaks
- [ ] Proper GC behavior
- [ ] Large object handling
