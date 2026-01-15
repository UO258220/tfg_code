use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

#[wasm_bindgen]
pub fn is_prime(num: u32) -> bool {
    if num < 2 {
        return false;
    }
    if num == 2 {
        return true;
    }
    if num % 2 == 0 {
        return false;
    }
    for i in (3..=((num as f64).sqrt() as u32)).step_by(2) {
        if num % i == 0 {
            return false;
        }
    }
    true
}

#[wasm_bindgen]
pub fn factorial(n: u32) -> u64 {
    match n {
        0 | 1 => 1,
        _ => (2..=n as u64).product(),
    }
}
