import "../css/style.css";
import * as wasm from "../pkg/tfg_wasm.js";
import { validateRDF } from "./validator";

declare global {
  interface Window {
    handleValidateRDF: () => Promise<void>;
  }
}

let wasmModule: any;

async function initWasm(): Promise<void> {
  wasmModule = wasm;
}

// window.handleCalculate = (operation: string): void => {
//   const num1Input = document.getElementById("num1") as HTMLInputElement;
//   const num2Input = document.getElementById("num2") as HTMLInputElement;
//   const resultElement = document.getElementById("calc-result");

//   if (!num1Input || !num2Input || !resultElement || !wasmModule) return;

//   const num1 = parseFloat(num1Input.value);
//   const num2 = parseFloat(num2Input.value);

//   if (isNaN(num1) || isNaN(num2)) {
//     resultElement.textContent = "Please enter valid numbers";
//     return;
//   }

//   const calculator = new wasmModule.Calculator();
//   let result: number;

//   switch (operation) {
//     case "add":
//       result = calculator.add(num1, num2);
//       break;
//     case "subtract":
//       result = calculator.subtract(num1, num2);
//       break;
//     case "multiply":
//       result = calculator.multiply(num1, num2);
//       break;
//     case "divide":
//       if (num2 === 0) {
//         resultElement.textContent = "Cannot divide by zero";
//         return;
//       }
//       result = calculator.divide(num1, num2);
//       break;
//     default:
//       return;
//   }

//   resultElement.textContent = `Result: ${result}`;
// };

window.handleValidateRDF = validateRDF;

initWasm().catch(console.error);
