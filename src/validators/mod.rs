pub mod common;
mod rdf;
mod shacl;

#[cfg(target_family = "wasm")]
#[path = "syntax_wasm.rs"]
pub mod syntax;

#[cfg(not(target_family = "wasm"))]
#[path = "syntax_native.rs"]
pub mod syntax;
