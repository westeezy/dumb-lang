import { Parser } from "./Parser.js";
import { Reader } from "./Reader.js";
import { Tokenizer } from "./Tokenizer.js";
import { Interpreter } from "./Interpreter.js";

const input = new Reader(`
  add = function(x, y) { x + y }; 
  # comment on its own line..
  add(2,2); # this should be 4
`);

const tokenizer = new Tokenizer(input);

// while (!tokenizer.eof()) {
//   console.log(tokenizer.next());
// }
// console.log(tokenizer.peek());

const parser = new Parser(tokenizer);
const ast = parser.parse();

// console.log(ast);

const interpreter = new Interpreter(ast);

const result = interpreter.visit(ast);

console.log(result); // This should log 4