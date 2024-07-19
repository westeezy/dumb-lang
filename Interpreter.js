export class Interpreter {
  constructor(ast) {
    this.ast = ast;
    this.env = {}; // Global environment
  }

  visit(node) {
    switch (node.type) {
      case "prog":
        return this.visitProg(node);
      case "number":
        return node.value;
      case "string":
        return node.value;
      case "bool":
        return node.value;
      case "identifier":
        return this.env[node.value];
      case "binary":
        return this.visitBinary(node);
      case "assign":
        return this.visitAssign(node);
      case "call":
        return this.visitCall(node);
      case "if":
        return this.visitIf(node);
      case "function":
        return this.visitFunction(node);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  visitProg(node) {
    let result;
    for (const stmt of node.prog) {
      result = this.visit(stmt);
    }
    return result;
  }

  visitBinary(node) {
    const left = this.visit(node.left);
    const right = this.visit(node.right);
    switch (node.operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      case "%":
        return left % right;
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case "<":
        return left < right;
      case ">":
        return left > right;
      case "<=":
        return left <= right;
      case ">=":
        return left >= right;
      default:
        throw new Error(`Unknown binary operator: ${node.operator}`);
    }
  }

  visitAssign(node) {
    const value = this.visit(node.right);
    this.env[node.left.value] = value;
    return value;
  }

  visitCall(node) {
    const func = this.env[node.func.value];
    if (typeof func !== "function") {
      throw new Error(`Identifier is not a function: ${node.func.value}`);
    }
    const args = node.args.map((arg) => this.visit(arg));
    return func(...args);
  }

  visitIf(node) {
    const cond = this.visit(node.cond);
    if (cond) {
      return this.visit(node.then);
    } else if (node.else) {
      return this.visit(node.else);
    }
    return undefined;
  }

  visitFunction(node) {
    const func = (...args) => {
      const localEnv = {};
      for (let i = 0; i < node.vars.length; i++) {
        localEnv[node.vars[i]] = args[i];
      }
      const oldEnv = this.env;
      this.env = { ...this.env, ...localEnv };
      const result = this.visit(node.body);
      this.env = oldEnv;
      return result;
    };
    if (node.name) {
      // Store the function under its name
      this.env[node.name] = func;
    }
    return func; // Return the function itself for later use
  }
}
