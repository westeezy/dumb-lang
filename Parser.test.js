import assert from "node:assert/strict";
import { it } from "node:test";
import { Reader } from "./Reader.js";
import { Tokenizer } from "./Tokenizer.js";
import { Parser } from "./Parser.js";

it("should parse a simple expression", () => {
  const input = new Reader("1 + 2");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();

  assert.deepEqual(ast, {
    type: "prog",
    prog: [
      {
        type: "binary",
        operator: "+",
        left: { type: "number", value: 1 },
        right: { type: "number", value: 2 },
      },
    ],
  });
});

it("should parse a complex expression", () => {
  const input = new Reader("1 + 2 * 3 - 4");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  assert.deepEqual(ast, {
    type: "prog",
    prog: [
      {
        type: "binary",
        operator: "-",
        left: {
          type: "binary",
          operator: "+",
          left: { type: "number", value: 1 },
          right: {
            type: "binary",
            operator: "*",
            left: { type: "number", value: 2 },
            right: { type: "number", value: 3 },
          },
        },
        right: { type: "number", value: 4 },
      },
    ],
  });
});

it("should parse a function call", () => {
  const input = new Reader("foo(1, 2)");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();

  assert.deepEqual(ast, {
    type: "prog",
    prog: [
      {
        type: "call",
        func: { type: "identifier", value: "foo" },
        args: [
          { type: "number", value: 1 },
          { type: "number", value: 2 },
        ],
      },
    ],
  });
});

it("should parse a function definition", () => {
  const input = new Reader("function(x, y) { x + y }");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  assert.deepEqual(ast, {
    type: "prog",
    prog: [
      {
        type: "function",
        vars: ["x", "y"],
        body: {
          type: "binary",
          operator: "+",
          left: { type: "identifier", value: "x" },
          right: { type: "identifier", value: "y" },
        },
      },
    ],
  });
});

it("should parse an if statement", () => {
  const input = new Reader("if (x > 10) { x + 1 } else { x - 1 }");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  assert.deepEqual(ast, {
    type: "prog",
    prog: [
      {
        type: "if",
        cond: {
          type: "binary",
          operator: ">",
          left: { type: "identifier", value: "x" },
          right: { type: "number", value: 10 },
        },
        then: {
          type: "binary",
          operator: "+",
          left: { type: "identifier", value: "x" },
          right: { type: "number", value: 1 },
        },
        else: {
          type: "binary",
          operator: "-",
          left: { type: "identifier", value: "x" },
          right: { type: "number", value: 1 },
        },
      },
    ],
  });
});

it("should parse a program with multiple statements", () => {
  const input = new Reader("x = 1; y = 2; x + y;");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  assert.deepEqual(ast, {
    type: "prog",
    prog: [
      {
        type: "assign",
        operator: "=",
        left: { type: "identifier", value: "x" },
        right: { type: "number", value: 1 },
      },
      {
        type: "assign",
        operator: "=",
        left: { type: "identifier", value: "y" },
        right: { type: "number", value: 2 },
      },
      {
        type: "binary",
        operator: "+",
        left: { type: "identifier", value: "x" },
        right: { type: "identifier", value: "y" },
      },
    ],
  });
});

it("should parse a program with nested blocks", () => {
  const input = new Reader("{ x = 1; { y = 2; x + y } }");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  assert.deepEqual(ast, {
    type: "prog",
    prog: [
      {
        type: "prog",
        prog: [
          {
            type: "assign",
            operator: "=",
            left: { type: "identifier", value: "x" },
            right: { type: "number", value: 1 },
          },
          {
            type: "prog",
            prog: [
              {
                type: "assign",
                operator: "=",
                left: { type: "identifier", value: "y" },
                right: { type: "number", value: 2 },
              },
              {
                type: "binary",
                operator: "+",
                left: { type: "identifier", value: "x" },
                right: { type: "identifier", value: "y" },
              },
            ],
          },
        ],
      },
    ],
  });
});
