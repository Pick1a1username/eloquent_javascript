/**
 * 
 * @param {string} program - Code
 */
function parseExpression(program) {
    program = skipSpace(program);
    let match, expr;
    // Get string.
    if (match = /^"([^"]*)"/.exec(program)) {
        expr = {type: "value", value: match[1]};
    // Get number.
    } else if (match = /^\d+\b/.exec(program)) {
        expr = {type: "value", value: Number(match[0])};
    // Get word.
    } else if (match = /^[^\s(),#"]+/.exec(program)) {
        expr = {type: "word", name: match[0]};
    } else {
        throw new SyntaxError("Unexpected syntax: " + program);
    }

    return parseApply(expr, program.slice(match[0].length));
}

/**
 * Cut the whitespace off the start of the string.
 * @param {string} string - The String to manipulate.
 * @returns {string} The String from which the spaces at the beginning is removed.
 */
function skipSpace(string) {
    let first = string.search(/\S/);
    if (first == -1) return "";
    return string.slice(first);
}

/**
 * Check whether the expression is an application.
 * If so, parse a parenthesized list of arguments.
 * @param {Object} expr - The expression to be ...
 * @param {string} expr.type - The type of the expression.
 * @param {string} expr.name - The value of the expression if the type is word.
 * @param {number} expr.value - The value of the expression if the type is value.
 * @param {string} program 
 * @returns {*} ...
 */
function parseApply(expr, program) {
    program = skipSpace(program);

    // If the first character is not an opening parenthesis,
    // this is not an application, but expression.
    if (program[0] != "(") {
        return {expr: expr, rest: program};
    }

    // Get program without opening parenthesis.
    program = skipSpace(program.slice(1));
    
    expr = {type: "apply", operator: expr, args: []};
    while (program[0] != ")") {
        let arg = parseExpression(program);
        expr.args.push(arg.expr);
        program = skipSpace(arg.rest);
        if (program[0] == ",") {
            program = skipSpace(program.slice(1));
        } else if (program[0] != ")") {
            throw new SyntaxError("Expected ',' or ')'");
        }
    }

    return parseApply(expr, program.slice(1));
}

/**
 * Parse Egg.
 * @param {string} program 
 * @returns {Object} expr - The expression to be ...
 * @returns {string} expr.type - The type of the expression.
 * @returns {string} expr.name - The value of the expression if the type is word.
 * @returns {number} expr.value - The value of the expression if the type is value.
 */
function parse(program) {
    let {expr, rest} = parseExpression(program);
    if (skipSpace(rest).length > 0) {
        throw new SyntaxError("Unexpected text after program");
    }
    return expr;
}



// console.log(parse("+(a,10)"));

// > $ node egg.js 
// { type: 'apply',
//   operator: { type: 'word', name: '+' },
//   args:
//    [ { type: 'word', name: 'a' }, { type: 'value', value: 10 } ] }
// $ 

// To define special syntax.
const specialForms = Object.create(null);

function evaluate(expr, scope) {
    // Check literal value.
    if (expr.type == "value") {
        return expr.value;
    // Check binding.
    } else if (expr.type == "word") {
        if (expr.name in scope) {
            return scope[expr.name];
        } else {
            throw new ReferenceError(`Undefined binding: ${expr.name}`);
        }
    // Check application.
    } else if (expr.type == "apply") {
        let {operator, args} = expr;
        if (operator.type == "word" && operator.name in specialForms) {
            return specialForms[operator.name](expr.args, scope);
        } else {
            let op = evaluate(operator, scope);
            if (typeof op == "function") {
                return op(...args.map(arg => evaluate(arg, scope)));
            } else {
                throw new TypeError("Applying a non-function.");
            }
        }
    }
}


// Add special syntax 'if'.
specialForms.if = (args, scope) => {
    if (args.length != 3) {
        throw new SyntaxError("Wrong number of args to if");
    } else if (evaluate(args[0], scope) !== false) {
        return evaluate(args[1], scope);
    } else {
        return evaluate(args[2], scope);
    }
};

// Add special syntax 'while'.
specialForms.while = (args, scope) => {
    if (args.length != 2) {
        throw new SyntaxError("Wrong number of args to while");
    }

    while (evaluate(args[0], scope) !== false) {
        evaluate(args[1], scope);
    }

    // Since undefined does not exist in Egg, we return false,
    // for lack of a meaningful result.
    return false;
};

// Add special syntax 'do', which executes all its arguments
// from top to bottom.
specialForms.do = (args, scope) => {
    let value = false;
    for (let arg of args) {
        value = evaluate(arg, scope);
    }
    // Return the value produced by the last argument.
    return value;
};

// Add special syntax 'define', which creates bindings and
// gives them new values.
specialForms.define = (args, scope) => {
    if (args.length != 2 || args[0].type != "word") {
        throw new SyntaxError("Incorrect use of define");
    }
    let value = evaluate(args[1], scope);
    scope[args[0].name] = value;
    return value;
};


// ?
const topScope = Object.create(null);

// ?

topScope.true = true;
topScope.false = false;

// let prog = parse(`if(true, false, true)`);
// console.log(evaluate(prog, topScope));
// 
// Example)
// $ node egg.js 
// false
// $ 


// Supply basic arithmetic and comparison operators.
for (let op of ["+", "-", "*", "/", "==", "<", ">"]) {
    topScope[op] = Function("a, b", `return a ${op} b;`);
}

// Output values.
topScope.print = value => {
    console.log(value);
    return value;
};

/**
 * Parse a program and run it in a fresh scope.
 * @param {string} program - The program to execute.
 */ 
function run(program) {
    return evaluate(parse(program), Object.create(topScope));
}

// run(`
//     do(define(total, 0),
//         define(count, 1),
//         while(<(count, 11),
//             do(define(total, +(total, count)),
//                 define(count, +(count, 1)))),
//         print(total))
// `);

// Example)
// $ node egg.js 
// 55
// $ 


// Define function.
specialForms.fun = (args, scope) => {
    if (!args.length) {
        throw new SyntaxError("Functions need a body");
    }

    let body = args[args.length - 1];

    let params = args.slice(0, args.length - 1).map(expr => {
        if (expr.type != "word") {
            throw new SyntaxError("Parameter names must be words");
        }
        return expr.name;
    });

    return function() {
        if (arguments.length != params.length) {
            throw new TypeError("Wrong number of arguments");
        }

        // Create function's own local scope.
        let localScope = Object.create(scope);

        for (let i = 0; i < arguments.length; i++) {
            localScope[params[i]] = arguments[i];
        }

        return evaluate(body, localScope);
    };
};

// run(`
//     do(define(plusOne, fun(a, +(a, 1))),
//         print(plusOne(10)))
// `)
// 
// Example)
// $ node egg.js 
// 11
// $ 