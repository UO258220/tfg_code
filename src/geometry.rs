use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
#[wasm_bindgen]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
impl Point {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64) -> Point {
        Point { x, y }
    }

    pub fn distance_from_origin(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }

    pub fn translate(&mut self, dx: f64, dy: f64) {
        self.x += dx;
        self.y += dy;
    }
}

#[wasm_bindgen]
pub struct Vector {
    points: Vec<Point>,
}

#[wasm_bindgen]
impl Vector {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Vector {
        Vector {
            points: Vec::new(),
        }
    }

    pub fn push(&mut self, point: Point) {
        self.points.push(point);
    }

    pub fn len(&self) -> usize {
        self.points.len()
    }

    pub fn average_distance(&self) -> f64 {
        if self.points.is_empty() {
            return 0.0;
        }
        let sum: f64 = self.points.iter().map(|p| p.distance_from_origin()).sum();
        sum / self.points.len() as f64
    }
}
