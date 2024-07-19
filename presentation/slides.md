---
# You can also start simply with 'default'
theme: bricks
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://cover.sli.dev
# some information about your slides (markdown enabled)
title: Welcome to Slidev
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# apply unocss classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
---

# How to do draw that super cool S thing

<div class=" h-full flex justify-center items-center">
<iframe src="https://giphy.com/embed/nDMyoNRkCesJdZAuuL" width="480" height="374" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
</div>

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---

# cash money

<div class=" h-full flex justify-center items-center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/%22Cool_S%22_Drawing_Instructions.svg/400px-%22Cool_S%22_Drawing_Instructions.svg.png?20190812175600" />
</div>

---

# thanks for your time

<div v-click>
suckers
</div>

<div v-click>
kidding..
</div>

---

# How do you make a programming lanaguage?

Lets write some javascript to make a worse language

```
  add = function(x, y) { x + y };
  # comment on its own line..
  add(2,2) # this should be 4
```

<!--
You can have `style` tag in markdown to override the style for the current page.
Learn more: https://sli.dev/features/slide-scope-style
-->

<style>
h1 {
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #4EC5D4 10%, #146b8c 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
}
</style>

<!--
Here is another comment.
-->

---

# Parts

1. Parser
2. Interpreter
3. CPS - 🤷
4. Compiling to JS???

<img
  v-click
  class="absolute -bottom--72 -right--140 w-85 opacity-50"
  src="https://sli.dev/assets/arrow-bottom-left.svg"
  alt=""
/>

<p v-after class="absolute -bottom--90 left-55 opacity-100 color-orange transform">prolly not these</p>

---

<h1> <span class="tracking-widest">a l i g n</span> on language first </h1>

- no statements, only expressions. as rich hickey intended 🙌🙌
- semicolons mandatory cause thats how you end an expression
- sequences in `{}`
- i dont wanna code `return` keyword so last statement wins
- means you can do like:

```js
  a = {
    add(2,1);
    add(9,1);
  };

println(a); # prints 10

# good thing i didnt do fib or something cause math
```

---

# Reading source in 📖

1. read it all in char by char
2. make some tokens
3. parse it
4. express yourself in code

---

# tips and tricks before

- regex is costly at parse tho kinda handy during lexing
- dont guess intent, just fail with error
- its just hard to write these cleanly for a real language honestly

---

# chomp chomp

get to the chomper

```js
export class Reader {
  /*
   * we basically do this malarky for the position info to be easy to get
   */
  input: string;
  position: number;
  line: number;
  column: number;

  constructor(input: string); // was it dumb to use classes? absolutely

  cursor(): string; // get the current char

  next(): string; // chomp some characters yum

  peek(): string; // look at next char, dont eat

  eof(): boolean; // is this it?

  throw(message: string): void; // whoops cant read that thing
}

```

---

# tokenizer / lexer

what is it?

- similar interface our chomper but instead of outputting chars you output tokens

```js
// add(2,2);
{ type: 'identifier', value: 'add' }
{ type: 'punctuation', value: '(' }
{ type: 'number', value: 2 }
{ type: 'punctuation', value: ',' }
{ type: 'number', value: 2 }
{ type: 'punctuation', value: ')' }
{ type: 'punctuation', value: ';' }
```

🪙🪙🪙🪙🪙🪙

---

# tokenizer rules

1. skip whitespace
2. if you see a `#` its a comment so just treat the rest of line as whitespace
3. if its a quote we got a string
4. if its a digit a number, be careful for decimals
5. if its a letter its prolly a identifier or keyword
6. punctuation is funny in this context isnt it?
7. operators are operators...
8. if its none of these im just gonna throw an error

---

# deep diving into tokenizer idea 💡

- `readNext` is our dispatcher which basically just fetches token after token
- `readNext` is on demand (think generators here but in this case i was lazy and didnt use one)

---

# detour to our AST

```js {*}{maxHeight:'400px'}
/*
 a = 5
 b = a *2
*/

{
  "type": "prog",
  "prog": [
    {
      "type": "assign",
      "operator": "=",
      "left": { "type": "identifier", "value": "a" },
      "right": { "type": "number", "value": 5 }
    },
    {
      "type": "assign",
      "operator": "=",
      "left": { "type": "identifier", "value": "b" },
      "right": {
        "type": "binary",
        "operator": "*",
        "left": { "type": "identifier", "value": "a" },
        "right": { "type": "number", "value": 2 }
      }
    }
  ]
}

```

---

# parser!
from tokens to ast

- these are the trickest parts imo this is a simple [recursive descent parser](https://en.wikipedia.org/wiki/Recursive_descent_parser)
- aka each step does one piece of the puzzle and just string em together. kinda like making a DSL
- wrote a helped `delimited` to get function args more easily. good place to look
- thank you semicolons for telling me when to stop parsing an expression 💘

```js
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
```

---

# parser! CONT
from tokens to ast

- maybe functions are nice to check to see if an expression is a thing or not

```
  maybeCall(expr) {
    expr = expr.call(this);
    return this.isPunctuation("(") ? this.parseCall(expr) : expr;
  }
```

---

# interpreter
i cut a lot of corners by this point

- walk the ast
- executing expressions as you walk
- !!! maintain the environmnet structure (where variables and execution context lives)
- i really skimped on environment. sorry not sorry

---

# continuations!
i didnt do these at all

- right now recursion is limited by js stack
- the language is slow too
- think about how callbacks in node allow you to pass operations which can be `continued` instead of blocking

```js
evalute( expression, environment, callback ) // this is the "signature" for it usually

// looks a lot like 
fs.readFile("file.txt", "utf8", function CC(error, data){
  // look a continuation
  // instead of returning a value it just invokes our callback
});
```

---

# compiling to JS
this was my end goal also didnt get to it

```js
// example of maybe something
function makeAJSFunction(exp) {
    let code = "(function ";
    if (exp.name) {
        code += makeAJSVariable(exp.name);
    }
    code += "(" + exp.vars.map(makeAJSVariable).join(", ") + ") {";
    code += "return " + js(exp.body) `+ " })";
    return code;
}
```

---

# optimizer

if i skipped the last two sections do you really think i wrote the optimizer?

- no

--- 

# 2 cash 2 money
And we ain't hungry no more either, brah.

<div class=" h-48 w-48 absolute top-100 right-75">
  <img class="" src="https://cdn.motor1.com/images/mgl/MvB7X/s1/2013-391567-paul-walker-s-mitsubishi-evo-from-2-fast-2-furious1.jpg" />
</div>

<div class=" h-24 w-24 absolute top-90 right-50 rotate-12">
  <img class="" src="https://target.scene7.com/is/image/Target/GUEST_7606ca21-47ad-4e45-a064-dee5efd65cec?wid=488&hei=488&fmt=pjpeg" />
</div>

<div class=" h-full flex justify-center items-center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/%22Cool_S%22_Drawing_Instructions.svg/400px-%22Cool_S%22_Drawing_Instructions.svg.png?20190812175600" />
</div>

---

# bye
bye 
bye

bye bye

<div v-click>
no refunds
</div>

