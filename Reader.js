export class Reader {
  input = "";
  position = 0;
  line = 1;
  column = 0;

  constructor(input) {
    this.input = input;
  }

  cursor() {
    return this.input.charAt(this.position);
  }

  next() {
    const char = this.cursor();
    if (char === "\n") {
      this.line += 1;
      this.column = 0;
    } else {
      this.column += 1;
    }

    this.position += 1;
    return char;
  }

  peek() {
    return this.cursor();
  }

  eof() {
    return this.cursor() === "";
  }

  throw(message) {
    throw new Error(`[${this.line}:${this.column}] ${message}`);
  }
}
