export class Tokenizer {
  constructor(reader) {
    this.input = reader;
    this.current = null;
    this.keywords = new Set([
      "if",
      "then",
      "else",
      "function",
      "true",
      "false",
    ]);
  }

  // Character type checks
  isWhitespace(char) {
    return " \t\n".includes(char);
  }

  isDigit(char) {
    return /[0-9]/.test(char);
  }

  isLetter(char) {
    return /[a-zA-Z]/.test(char);
  }

  isIdentifier(char) {
    return this.isLetter(char) || "?!<>=0123456789".includes(char);
  }

  isOperator(char) {
    return "+-*/%=&|<>!".includes(char);
  }

  isPunctuation(char) {
    return ",;(){}[]".includes(char);
  }

  isKeyword(word) {
    return this.keywords.has(word);
  }

  // Read functions
  readWhile(predicate) {
    let result = "";
    while (!this.input.eof() && predicate(this.input.peek())) {
      result += this.input.next();
    }
    return result;
  }

  readNumber() {
    let hasDecimal = false;
    const number = this.readWhile((char) => {
      if (char === ".") {
        if (hasDecimal) return false;
        hasDecimal = true;
      }
      return this.isDigit(char) || char === ".";
    });
    return { type: "number", value: parseFloat(number) };
  }

  readIdentifier() {
    const identifier = this.readWhile(this.isIdentifier.bind(this));
    const type = this.isKeyword(identifier) ? "keyword" : "identifier";
    return { type, value: identifier };
  }

  readString() {
    return { type: "string", value: this.readEscapedString('"') };
  }

  readEscapedString(endMarker) {
    let escaped = false;
    let result = "";
    this.input.next(); // Skip the initial quote

    while (!this.input.eof()) {
      const char = this.input.next();

      if (escaped) {
        result += char;
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === endMarker) {
        return result;
      } else {
        result += char;
      }
    }

    throw new Error("Unterminated string literal");
  }

  readPunctuation() {
    return { type: "punctuation", value: this.input.next() };
  }

  readOperator() {
    return {
      type: "operator",
      value: this.readWhile(this.isOperator.bind(this)),
    };
  }

  readNext() {
    this.readWhile(this.isWhitespace.bind(this));
    if (this.input.eof()) return null;

    const char = this.input.peek();

    if (char === "#") {
      this.skipLine();
      return this.readNext();
    }

    if (char === '"') return this.readString();
    if (this.isDigit(char)) return this.readNumber();
    if (this.isLetter(char)) return this.readIdentifier();
    if (this.isPunctuation(char)) return this.readPunctuation();
    if (this.isOperator(char)) return this.readOperator();

    throw new Error(`Unexpected character: ${char}`);
  }

  skipLine() {
    this.readWhile((char) => char !== "\n");
    this.input.next();
  }

  peek() {
    return this.current || (this.current = this.readNext());
  }

  next() {
    const token = this.current;
    this.current = null;
    return token || this.readNext();
  }

  eof() {
    return this.peek() === null;
  }

  throw(...args) {
    return this.input.throw(...args);
  }
}
