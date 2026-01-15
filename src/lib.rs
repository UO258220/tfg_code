mod utils;
pub mod geometry;
pub mod math;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[wasm_bindgen]
pub struct Calculator;

#[wasm_bindgen]
impl Calculator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Calculator {
        Calculator
    }

    pub fn add(&self, a: f64, b: f64) -> f64 {
        a + b
    }

    pub fn subtract(&self, a: f64, b: f64) -> f64 {
        a - b
    }

    pub fn multiply(&self, a: f64, b: f64) -> f64 {
        a * b
    }

    pub fn divide(&self, a: f64, b: f64) -> f64 {
        a / b
    }
}
