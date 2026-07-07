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

export async function handleValidateRDF() {
    await validateRDF();
}

window.handleValidateRDF = handleValidateRDF;

initWasm().catch(console.error);
