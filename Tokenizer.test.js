import assert from "node:assert/strict";
import { it } from "node:test";

import { Reader } from "./Reader.js";
import { Tokenizer } from "./Tokenizer.js";

it("should tokenize numbers correctly", () => {
    const input = new Reader("123.45");
    const tokenStream = new Tokenizer(input);

    const tokens = [];
    while (!tokenStream.eof()) {
        tokens.push(tokenStream.next());
    }

    assert.deepEqual(tokens, [{ type: "number", value: 123.45 }]);
});

it("should tokenize identifiers and keywords correctly", () => {
    const input = new Reader("if function x then else");
    const tokenStream = new Tokenizer(input);

    const tokens = [];
    while (!tokenStream.eof()) {
        tokens.push(tokenStream.next());
    }

    assert.deepEqual(tokens, [
        { type: "keyword", value: "if" },
        { type: "keyword", value: "function" },
        { type: "identifier", value: "x" },
        { type: "keyword", value: "then" },
        { type: "keyword", value: "else" },
    ]);
});

it("should tokenize strings correctly", () => {
    const input = new Reader('"hello \\"world\\""');
    const tokenStream = new Tokenizer(input);

    const tokens = [];
    while (!tokenStream.eof()) {
        tokens.push(tokenStream.next());
    }

    assert.deepEqual(tokens, [{ type: "string", value: 'hello "world"' }]);
});

it("should tokenize operators and punctuation correctly", () => {
    const input = new Reader("+ - * / % &= | < > ! === , ; ( ) { } [ ]");
    const tokenStream = new Tokenizer(input);

    const tokens = [];
    while (!tokenStream.eof()) {
        tokens.push(tokenStream.next());
    }

    assert.deepEqual(tokens, [
        { type: "operator", value: "+" },
        { type: "operator", value: "-" },
        { type: "operator", value: "*" },
        { type: "operator", value: "/" },
        { type: "operator", value: "%" },
        { type: "operator", value: "&=" },
        { type: "operator", value: "|" },
        { type: "operator", value: "<" },
        { type: "operator", value: ">" },
        { type: "operator", value: "!" },
        { type: "operator", value: "===" },
        { type: "punctuation", value: "," },
        { type: "punctuation", value: ";" },
        { type: "punctuation", value: "(" },
        { type: "punctuation", value: ")" },
        { type: "punctuation", value: "{" },
        { type: "punctuation", value: "}" },
        { type: "punctuation", value: "[" },
        { type: "punctuation", value: "]" },
    ]);
});

it("should throw error for unexpected characters", () => {
    const input = new Reader("@");
    const tokenStream = new Tokenizer(input);

    assert.throws(
        () => {
            tokenStream.next();
        },
        {
            name: "Error",
            message: "Unexpected character: @",
        },
    );
});
