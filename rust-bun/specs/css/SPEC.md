# CSS Parser Specification

## Overview

The CSS module provides a complete CSS parser, transformer, and minifier. It handles CSS parsing, @import resolution, CSS Modules, vendor prefixing, and minification.

## Bun Reference

- CSS parser: `bun-main/src/css/css_parser.zig`
- Properties: `bun-main/src/css/properties/`
- Rules: `bun-main/src/css/rules/`
- Selectors: `bun-main/src/css/selectors/`
- Values: `bun-main/src/css/values/`

## Public API

```rust
pub struct Stylesheet {
    pub rules: Vec<Rule>,
}

pub enum Rule {
    Style(StyleRule),
    Import(ImportRule),
    Media(MediaRule),
    FontFace(FontFaceRule),
    Keyframes(KeyframesRule),
    Supports(SupportsRule),
    Layer(LayerRule),
    Container(ContainerRule),
    Page(PageRule),
    Namespace(NamespaceRule),
}

pub struct StyleRule {
    pub selectors: SelectorList,
    pub declarations: Vec<Declaration>,
}

pub fn parse(source: &str, options: ParseOptions) -> Result<Stylesheet>;
pub fn minify(stylesheet: &Stylesheet, options: MinifyOptions) -> String;
pub fn transform(stylesheet: &mut Stylesheet, targets: Targets);

pub struct CssModules {
    pub fn transform(&self, css: &str, filename: &str) -> Result<CssModulesOutput>;
}

pub struct CssModulesOutput {
    pub css: String,
    pub exports: HashMap<String, String>,
}
```

## Behavior Specifications

### Parsing

- Full CSS3+ syntax support
- Error recovery for malformed CSS
- Source map generation
- Preserve comments option

### CSS Modules

- Local scoping of class names
- :global() and :local() support
- composes property
- @value definitions

### Vendor Prefixing

- Automatic prefixing based on targets
- -webkit-, -moz-, -ms- prefixes
- Configurable browser targets

### Minification

- Whitespace removal
- Shorthand optimization
- Color optimization
- Selector deduplication

## Test Requirements

- [ ] Parse all CSS syntax
- [ ] CSS Modules transformation
- [ ] Vendor prefixing accuracy
- [ ] Minification correctness
- [ ] Round-trip parsing
