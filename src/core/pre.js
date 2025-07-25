const API = Module.API;
const Hiwire = {};
const Tests = {};
API.tests = Tests;
API.version = "0.29.0.dev0";
// This version should be equal to the one in the Makefile.envs
// TODO: Pass this value dynamically from outside.
API.abiVersion = "2025_0";
Module.hiwire = Hiwire;

function getTypeTag(x) {
  try {
    return Object.prototype.toString.call(x);
  } catch (e) {
    return "";
  }
}
API.getTypeTag = getTypeTag;

/**
 * Safe property check
 *
 * Observe whether a property exists or not without invoking getters.
 * Should never throw as long as arguments have the correct types.
 * This check is better than `prop in obj` because it works also with
 * primitives where `"length" in "str"`, as example, would throw.
 *
 * obj: an object
 * prop: a string or symbol
 */
function hasProperty(obj, prop) {
  try {
    while (obj) {
      if (Object.hasOwn(obj, prop)) {
        return true;
      }
      obj = Object.getPrototypeOf(obj);
    }
  } catch (e) {}
  return false;
}

/**
 * Observe whether a method exists or not
 *
 * Invokes getters but catches any error produced by a getter and throws it away.
 * Never throws an error
 *
 * obj: an object
 * prop: a string or symbol
 */
function hasMethod(obj, prop) {
  try {
    return typeof obj[prop] === "function";
  } catch (e) {
    return false;
  }
}

const pyproxyIsAlive = (px) => !!Module.PyProxy_getAttrsQuiet(px).shared.ptr;
API.pyproxyIsAlive = pyproxyIsAlive;

const errNoRet = () => {
  throw new Error(
    "Assertion error: control reached end of function without return",
  );
};

// This is factored out for testing purposes.
function isPromise(obj) {
  try {
    // clang-format off
    return typeof obj?.then === "function";
    // clang-format on
  } catch (e) {
    return false;
  }
}
API.isPromise = isPromise;

/**
 * Turn any ArrayBuffer view or ArrayBuffer into a Uint8Array.
 *
 * This respects slices: if the ArrayBuffer view is restricted to a slice of
 * the backing ArrayBuffer, we return a Uint8Array that shows the same slice.
 */
function bufferAsUint8Array(arg) {
  if (ArrayBuffer.isView(arg)) {
    return new Uint8Array(arg.buffer, arg.byteOffset, arg.byteLength);
  } else {
    return new Uint8Array(arg);
  }
}
API.typedArrayAsUint8Array = bufferAsUint8Array;

Module.iterObject = function* (object) {
  for (let k in object) {
    if (Object.hasOwn(object, k)) {
      yield k;
    }
  }
};

function wasmFunctionType(wasm_func) {
  if (!WebAssembly.Function) {
    throw new Error("No type reflection");
  }
  if (WebAssembly.Function.type) {
    return WebAssembly.Function.type(wasm_func);
  }
  return wasm_func.type();
}
