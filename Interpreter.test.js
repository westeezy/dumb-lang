import assert from "node:assert/strict";
import { it } from "node:test";
import { Reader } from "./Reader.js";
import { Tokenizer } from "./Tokenizer.js";
import { Parser } from "./Parser.js";
import { Interpreter } from "./Interpreter.js"; // Import the Interpreter class
it("should interpret a simple expression", () => {
  const input = new Reader("1 + 2");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  const interpreter = new Interpreter(ast);
  const result = interpreter.visit(ast);
  assert.equal(result, 3);
});

it("should interpret a complex expression", () => {
  const input = new Reader("1 + 2 * 3 - 4");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  const interpreter = new Interpreter(ast);
  const result = interpreter.visit(ast);
  assert.equal(result, 3);
});

it("should interpret a function call", () => {
  const input = new Reader("add(1, 2)");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  const interpreter = new Interpreter(ast);
  interpreter.env.add = (a, b) => a + b; // Define the 'add' function in the environment
  const result = interpreter.visit(ast);
  assert.equal(result, 3);
});

it("should interpret a function definition and call", () => {
  const input = new Reader("add = function(x, y) { x + y }; add(1, 2)");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  const interpreter = new Interpreter(ast);
  const result = interpreter.visit(ast);
  assert.equal(result, 3);
});

it("should interpret an if statement", () => {
  const input = new Reader("if (10 > 5) { 10 } else { 5 }");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  const interpreter = new Interpreter(ast);
  const result = interpreter.visit(ast);
  assert.equal(result, 10);
});

it("should interpret an if statement with else", () => {
  const input = new Reader("if (5 > 10) { 10 } else { 5 }");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  const interpreter = new Interpreter(ast);
  const result = interpreter.visit(ast);
  assert.equal(result, 5);
});

it("should interpret an if statement with a function call", () => {
  const input = new Reader(
    "add = function(x, y) { x + y }; if (10 > 5) { add(1, 2) } else { 5 }",
  );
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  const interpreter = new Interpreter(ast);
  const result = interpreter.visit(ast);
  assert.equal(result, 3);
});

it("should interpret a program with multiple statements", () => {
  const input = new Reader("x = 1; y = 2; x + y;");
  const tokenStream = new Tokenizer(input);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  const interpreter = new Interpreter(ast);
  const result = interpreter.visit(ast);
  assert.equal(result, 3);
});
