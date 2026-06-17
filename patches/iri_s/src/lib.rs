//! This module contains a wrapper to work with IRIs
//! 
//! The library provides the macro [`iri`] to create [`IriS`] from strings.
//!
pub mod error;
mod iri;
mod mime_type;

pub use crate::iri::{Iri, IriS};
pub use crate::mime_type::MimeType;
