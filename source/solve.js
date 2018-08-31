"use strict";

const LexemeType = {
    CONSTANT: 0,
    VARIABLE: 1,
    OPERATOR: 2,
    OPENING_PARENTHESIS: 3,
    CLOSING_PARENTHESIS: 4
};

const ParserState = {
    NONE: -1,
    OPENING_PARENTHESIS: 0,
    CLOSING_PARENTHESIS: 1,
    DIGIT: 2,
    VARIABLE: 3,
    OPERATOR: 4
};

const OPERATORS = [
    { sign: '+', operation: (a, b) => a + b, precedence: 13 },
    { sign: '-', operation: (a, b) => a - b, precedence: 13 },
    { sign: '*', operation: (a, b) => a * b, precedence: 14 },
    { sign: '/', operation: (a, b) => a / b, precedence: 14 },
];

const ARG_TYPE_ERROR = new TypeError();
const NO_EXPRESSION_ERROR = new TypeError("Expression expected");
const INVALID_EXPRESSION_ERROR = new TypeError("Invalid expression");
const NOT_IMPLEMENTED_YET_ERROR = new Error("Not implemented yet.");

const validate = function (condition, error) {
    if (!condition) {
        throw error;
    }
};

const isOperator = function (c) {
    let result = false;
    for (let i = 0; i < OPERATORS.length; i++) {
        result |= (c === OPERATORS[i].sign);
    }
    return result;
};

const isDigit = function (c) {
    return /^\d$/.test(c);
};

const isVariable = function (c) {
    return /^[a-z]$/.test(c);
};

const getOperator = function (c) {
    let result = null;
    for (let i = 0; i < OPERATORS.length; i++) {
        if (c === OPERATORS[i].sign) {
            return OPERATORS[i];
        }
    }
    return result;
};

const parseExpression = function (expression) {
    validate(typeof expression === "string", ARG_TYPE_ERROR);
    validate(expression, NO_EXPRESSION_ERROR);

    if (!expression) {
        throw NO_EXPRESSION_ERROR;
    }

    let lexemes = [];
    let parserState = ParserState.NONE;
    let currentLexeme = "";

    const addConstantIfNotEmpty = function () {
        if (currentLexeme) {
            lexemes.push({ type: LexemeType.CONSTANT, value: parseInt(currentLexeme) });
            currentLexeme = "";
        }
    };

    const handleIfSpace  = function (c) {
        if (c !== ' ') return false;
        addConstantIfNotEmpty();
        return true;
    };
    const handleIfOpeningParenthesis = function (c) {
        if (c !== '(') return false;
        parserState = ParserState.OPENING_PARENTHESIS;
        lexemes.push({ type: LexemeType.OPENING_PARENTHESIS });
        return true;
    };
    const handleIfClosingParenthesis = function (c) {
        if (c !== ')') return false;
        addConstantIfNotEmpty();
        parserState = ParserState.CLOSING_PARENTHESIS;
        lexemes.push({ type: LexemeType.CLOSING_PARENTHESIS });
        return true;
    };
    const handleIfDigit = function (c) {
        if (!isDigit(c)) return false;
        parserState = ParserState.DIGIT;
        currentLexeme += c;
        return true;
    };
    const handleIfVariable = function (c) {
        if (!isVariable(c)) return false;
        parserState = ParserState.VARIABLE;
        lexemes.push({ type: LexemeType.VARIABLE, value: c });
        return true;
    };
    const handleIfOperator = function (c) {
        if (!isOperator(c)) return false;
        addConstantIfNotEmpty();
        parserState = ParserState.OPERATOR;
        lexemes.push({ type: LexemeType.OPERATOR, value: getOperator(c) });
        return true;
    };

    for (let i = 0; i < expression.length; i++) {
        const c = expression[i];

        switch (parserState) {
            case ParserState.NONE:
            case ParserState.OPENING_PARENTHESIS:
                if (!(handleIfSpace(c) || handleIfDigit(c) || handleIfVariable(c) || handleIfOpeningParenthesis(c))) {
                    throw INVALID_EXPRESSION_ERROR;
                }
                break;

            case ParserState.DIGIT:
                if (!(handleIfSpace(c) || handleIfDigit(c) || handleIfOperator(c) || handleIfClosingParenthesis(c))) {
                    throw INVALID_EXPRESSION_ERROR;
                }
                break;

            case ParserState.VARIABLE:
                if (!(handleIfSpace(c) || handleIfOperator(c) || handleIfClosingParenthesis(c))) {
                    throw INVALID_EXPRESSION_ERROR;
                }
                break;

            case ParserState.OPERATOR:
                if (!(handleIfSpace(c) || handleIfDigit(c) || handleIfVariable(c) || handleIfOpeningParenthesis(c))) {
                    throw INVALID_EXPRESSION_ERROR;
                }
                break;

            case ParserState.CLOSING_PARENTHESIS:
                if (!(handleIfSpace(c) || handleIfOperator(c)|| handleIfClosingParenthesis(c))) {
                    throw INVALID_EXPRESSION_ERROR;
                }
                break;

            default:
                throw NOT_IMPLEMENTED_YET_ERROR;
        }
    }

    addConstantIfNotEmpty();

    return lexemes;
};

const evalVariables = function(lexemes, variables) {
    for (let i = 0; i < lexemes.length; i++) {
        if (lexemes[i].type === LexemeType.VARIABLE) {
            for (let j = 0; j < variables.length; j++) {
                if (variables[j].name === lexemes[i].value) {
                    lexemes[i].type = LexemeType.CONSTANT;
                    lexemes[i].value = variables[j].value;
                    break;
                }
            }
        }
    }
    return lexemes;
};

const convertExpression = function(infixExpressionLexemes) {
    let stack = [], postfixExpressionLexemes = [];

    for (let i = 0; i < infixExpressionLexemes.length; i++) {
        let currentLexeme = infixExpressionLexemes[i];

        switch (currentLexeme.type) {
            case LexemeType.CONSTANT:
                postfixExpressionLexemes.push(currentLexeme);
                break;

            case LexemeType.OPENING_PARENTHESIS:
                stack.push(currentLexeme);
                break;

            case LexemeType.OPERATOR:
                while (stack.length > 0) {
                    let stackTopLexeme = stack[stack.length - 1];
                    if (stackTopLexeme.type === LexemeType.OPENING_PARENTHESIS) {
                        break;
                    } else {
                        if (stackTopLexeme.value.precedence < currentLexeme.value.precedence) {
                            break;
                        }
                        postfixExpressionLexemes.push(stack.pop());
                    }
                }
                stack.push(currentLexeme);
                break;

            case LexemeType.CLOSING_PARENTHESIS:
                let hasOpeningParenthesis = false;
                while (stack.length > 0) {
                    let stackTopLexeme = stack[stack.length - 1];
                    if (stackTopLexeme.type === LexemeType.OPENING_PARENTHESIS) {
                        stack.pop();
                        hasOpeningParenthesis = true;
                        break;
                    }
                    postfixExpressionLexemes.push(stack.pop());
                }
                if (!hasOpeningParenthesis) {
                    throw INVALID_EXPRESSION_ERROR;
                }
                break;

            default:
                throw NOT_IMPLEMENTED_YET_ERROR;
        }
    }

    while (stack.length > 0) {
        let stackTopLexeme = stack[stack.length - 1];
        if (stackTopLexeme.type !== LexemeType.OPERATOR) {
            throw INVALID_EXPRESSION_ERROR;
        }
        postfixExpressionLexemes.push(stack.pop());
    }

    return postfixExpressionLexemes;
};

const solve = function (expression = null, x = null) {
    throw NOT_IMPLEMENTED_YET_ERROR;
};
