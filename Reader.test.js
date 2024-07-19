import assert from "node:assert/strict";
import { it } from "node:test";

import { Reader } from "./Reader.js";

it("it can read a corpus one character at a time", () => {
  const corpus = "Hello World!";
  const input = new Reader(corpus);
  let position = 0;

  while (!input.eof()) {
    assert.equal(input.position, position);
    const current = input.next();
    assert.equal(current, corpus[position]);
    position++;
  }
});

it("it can detect basic new lines", () => {
  const corpus = "Hello\nWorld!";
  const input = new Reader(corpus);

  while (!input.eof()) {
    input.next();
  }

  assert.equal(input.line, 2);
});

it("it can throw with contextual information", () => {
  const corpus = "Hello World!";
  const input = new Reader(corpus);

  for (let i = 0; i < 3; i++) {
    input.next();
  }

  assert.throws(() => input.throw("oh no!'"), "[1:3] oh no!");
});
