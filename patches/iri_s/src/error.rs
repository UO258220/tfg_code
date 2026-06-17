use crate::iri::IriS;
use serde::Serialize;
use thiserror::Error;

/// Errors that can happen with IriS
#[derive(Error, Debug, Clone, Serialize)]
pub enum IriSError {
    /// Error converting path into an IRI
    #[error("Error converting path {path} to IRI: {error}")]
    ConvertingPathToIri { path: String, error: String },

    /// Error parsing string into an IRI
    #[error("Error parsing {str} as IRI: {error}")]
    IriParseError { str: String, error: String },

    /// Error parsing string into an IRI using a base IRI
    #[error("Parsing {str} using base: {base} as IRI. Error: {error}")]
    IriParseErrorWithBase {
        str: String,
        base: String,
        error: String,
    },

    /// Error resolving IRI
    #[error("Error resolving IRI `{other}` with base IRI `{base}`: {error}")]
    IriResolveError {
        error: String,
        base: Box<IriS>,
        other: String,
    },

    /// Error joining IRI containing string
    #[error("Error joining IRI `{current}` with `{str}`: {error}")]
    JoinError {
        error: String,
        current: Box<IriS>,
        str: String,
    },

    /// Error creating request HTTP client
    #[error("Creating reqwest http client: {error}")]
    ReqwestClientCreation { error: String },

    /// Error parsing IRI as a Url
    #[error("Parsing Iri {str} as Url. Error: {error}")]
    UrlParseError { str: String, error: String },

    /// Error performing HTTP request   
    #[error("Http request error: {error}")]
    ReqwestError { error: String },

    /// Error performing HTTP request +response as text
    #[error("Http request error as String: {error}")]
    ReqwestTextError { error: String },

    /// Error converting a file scheme Url into a path  
    #[error("trying to obtain a path from file scheme Url: {url}")]
    ConvertingFileUrlToPath { url: String },

    /// Error reading from a file obtained from a url
    #[error("Error reading from file {path} obtained from url {url}. Error: {error}")]
    IOErrorFile {
        path: String,
        url: String,
        error: String,
    },
}
