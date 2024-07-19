import { Tokenizer } from "./Tokenizer.js";

const FALSE = { type: "bool", value: false };

export class Parser {
  constructor(input) {
    this.input = input;
    this.PRECEDENCE = {
      "=": 1,
      "||": 2,
      "&&": 3,
      "<": 7,
      ">": 7,
      "<=": 7,
      ">=": 7,
      "==": 7,
      "!=": 7,
      "+": 10,
      "-": 10,
      "*": 20,
      "/": 20,
      "%": 20,
    };
  }

  parse() {
    return this.parseToplevel();
  }

  isPunctuation(ch) {
    const tok = this.input.peek();
    return (
      tok && tok.type === "punctuation" && (!ch || tok.value === ch) && tok
    );
  }

  isKeyword(keyword) {
    const tok = this.input.peek();
    return tok && tok.type === "keyword" && (!keyword || tok.value === keyword) && tok;
  }

  isOperator(op) {
    const tok = this.input.peek();
    return tok && tok.type === "operator" && (!op || tok.value === op) && tok;
  }

  skipPunctuation(ch) {
    if (this.isPunctuation(ch)) this.input.next();
    else this.input.throw(`Expecting punctuation: "${ch}"`);
  }

  skipKeyword(keyword) {
    if (this.isKeyword(keyword)) this.input.next();
    else this.input.throw(`Expecting keyword: "${keyword}"`);
  }

  skipOperator(op) {
    if (this.isOperator(op)) this.input.next();
    else this.input.throw(`Expecting operator: "${op}"`);
  }

  unexpected() {
    this.input.throw(`Unexpected token: ${JSON.stringify(this.input.peek())}`);
  }

  maybeBinary(left, myPrec) {
    const tok = this.isOperator();
    if (tok) {
      const hisPrec = this.PRECEDENCE[tok.value];
      if (hisPrec > myPrec) {
        this.input.next();
        return this.maybeBinary(
          {
            type: tok.value === "=" ? "assign" : "binary",
            operator: tok.value,
            left: left,
            right: this.maybeBinary(this.parseAtom(), hisPrec),
          },
          myPrec,
        );
      }
    }
    return left;
  }

  delimited(start, stop, separator, parser) {
    const resultTokens = [];
    let first = true;
    this.skipPunctuation(start);
    while (!this.input.eof()) {
      if (this.isPunctuation(stop)) break;
      if (first) first = false;
      else this.skipPunctuation(separator);
      if (this.isPunctuation(stop)) break;
      resultTokens.push(parser.call(this));
    }
    this.skipPunctuation(stop);
    return resultTokens;
  }

  parseCall(func) {
    return {
      type: "call",
      func: func,
      args: this.delimited("(", ")", ",", this.parseExpression),
    };
  }

  parseIdentifier() {
    const name = this.input.next();
    if (name.type !== "identifier") this.input.throw("Expecting variable name");
    return name.value;
  }

  parseIf() {
    this.skipKeyword("if");
    const cond = this.parseExpression();
    if (!this.isPunctuation("{")) this.skipKeyword("then");
    const then = this.parseExpression();
    const ret = {
      type: "if",
      cond: cond,
      then: then,
    };
    if (this.isKeyword("else")) {
      this.input.next();
      ret.else = this.parseExpression();
    }
    return ret;
  }

  parseFunction() {
    // Check if the current token is the "function" keyword
    if (!this.isKeyword("function")) {
      this.input.throw(`Expecting keyword: "function"`);
    }
    this.input.next(); // Skip the "function" keyword
    const vars = this.delimited("(", ")", ",", this.parseIdentifier);
    let body = this.parseExpression(); // First, try to parse a single expression
    if (this.isPunctuation("{")) {
      // If the next token is '{', it's a block
      body = this.parseProg(); // Parse the body as a program
    }
    return {
      type: "function",
      vars: vars,
      body: body,
    };
  }

  parseBool() {
    return {
      type: "bool",
      value: this.input.next().value === "true",
    };
  }

  maybeCall(expr) {
    expr = expr.call(this);
    return this.isPunctuation("(") ? this.parseCall(expr) : expr;
  }

  parseAtom() {
    if (this.isPunctuation("(")) {
      this.input.next();
      const exp = this.parseExpression();
      this.skipPunctuation(")");
      return exp;
    }
    if (this.isPunctuation("{")) return this.parseProg();
    if (this.isKeyword("if")) return this.parseIf();
    if (this.isKeyword("true") || this.isKeyword("false"))
      return this.parseBool();
    if (this.isKeyword("function")) {
      return this.parseFunction(); // Call parseFunction directly
    }
    const tok = this.input.next();
    if (tok.type === "identifier" || tok.type === "string") {
      return this.maybeCall(() => ({ type: "identifier", value: tok.value }));
    }
    if (tok.type === "number") {
      return { type: "number", value: tok.value }; // Directly use tok.value
    }
    this.unexpected();
  }

  parseToplevel() {
    const prog = [];
    while (!this.input.eof()) {
      prog.push(this.parseExpression());
      if (!this.input.eof()) this.skipPunctuation(";");
    }
    return { type: "prog", prog: prog };
  }

  parseProg() {
    const prog = this.delimited("{", "}", ";", this.parseExpression);
    if (prog.length === 0) return FALSE;
    if (prog.length === 1) return prog[0];
    return { type: "prog", prog: prog };
  }

  parseExpression() {
    return this.maybeCall(() => this.maybeBinary(this.parseAtom(), 0));
  }
}
