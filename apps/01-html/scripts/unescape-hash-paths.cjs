/**
 * Preloaded into the Tailwind CLI process via `node --require` (see build.js).
 *
 * Works around an upstream bug: @tailwindcss/node resolves `@import`s through
 * enhanced-resolve, which escapes literal `#` characters in resolved paths as
 * `\0#` (its documented contract — consumers must unescape). Tailwind doesn't
 * unescape, so any project living under a directory containing `#` (like this
 * one's `# Business Ideas` parent) crashes fs calls with a null-byte path.
 *
 * Real filesystem paths can never contain `\0`, so stripping it from fs path
 * arguments restores the intended path harmlessly.
 */
const fs = require("node:fs");
const fsp = require("node:fs/promises");

const unescape = (p) => (typeof p === "string" && p.includes("\0") ? p.replace(/\0/g, "") : p);

const wrap = (obj, keys) => {
  for (const k of keys) {
    const orig = obj[k];
    if (typeof orig === "function") {
      obj[k] = function (p, ...args) {
        return orig.call(this, unescape(p), ...args);
      };
    }
  }
};

wrap(fs, [
  "readFileSync", "statSync", "lstatSync", "accessSync", "existsSync",
  "openSync", "readdirSync", "realpathSync", "statfsSync", "cpSync",
  "readFile", "stat", "lstat", "access", "open", "readdir", "realpath", "statfs",
]);
wrap(fsp, ["readFile", "stat", "lstat", "access", "open", "readdir", "realpath", "statfs"]);
