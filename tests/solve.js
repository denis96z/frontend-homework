"use strict";

QUnit.module("Тестируем функцию validate", function() {
    QUnit.test("validate работает правильно", function(assert) {
        validate(true, ARG_TYPE_ERROR);
        assert.throws(() => validate(false, ARG_TYPE_ERROR), ARG_TYPE_ERROR);
    });
});

QUnit.module("Тестируем функцию isOperator", function() {
    QUnit.test("isOperator работает правильно", function(assert) {
        for (let i = 0; i < OPERATORS.length; i++) {
            assert.ok(isOperator(OPERATORS[i].sign));
        }
        assert.notOk(isOperator(' '));
    });
});

QUnit.module("Тестируем функцию isDigit", function() {
    QUnit.test("isDigit работает правильно", function(assert) {
        assert.ok(isDigit('0'));
        assert.notOk(isDigit('10'));
        assert.notOk(isDigit(' '));
    });
});

QUnit.module("Тестируем функцию isVariable", function() {
    QUnit.test("isVariable работает правильно", function(assert) {
        assert.ok(isVariable('x'));
        assert.notOk(isVariable('X'));
        assert.notOk(isVariable('var'));
        assert.notOk(isVariable(' '));
    });
});

QUnit.module("Тестируем функцию getOperator", function() {
    QUnit.test("getOperator работает правильно", function(assert) {
        for (let i = 0; i < OPERATORS.length; i++) {
            assert.strictEqual(getOperator(OPERATORS[i].sign), OPERATORS[i]);
        }
        assert.notOk(getOperator(' '));
    });
});

const arraysEqual = function(left, right) {
    if (left.length !== right.length) {
        return false;
    }
    for (let i = 0; i < left.lenght; i++) {
        if (left[i] !== right[i]) {
            return false;
        }
    }
    return true;
};

QUnit.module("Тестируем функцию parseExpression", function() {
    QUnit.test("parseExpression проверяет входные параметры", function(assert) {
        assert.throws(function(input) {
            parseExpression(0);
        }, ARG_TYPE_ERROR);
        assert.throws(function(input) {
            parseExpression("");
        }, NO_EXPRESSION_ERROR);
    });

    QUnit.test("parseExpression правильно обрабатывает корректные выражения", function(assert) {
        const testData = [
            {
                input: "  1  ",
                expected: [
                    {type: LexemeType.CONSTANT, value: 1}
                ]
            },
            {
                input: "10 + 1",
                expected: [
                    {type: LexemeType.CONSTANT, value: 10},
                    {type: LexemeType.OPERATOR, value: getOperator('+')},
                    {type: LexemeType.CONSTANT, value: 1}
                ]
            },
            {
                input: "(1 * 0)",
                expected: [
                    {type: LexemeType.OPENING_PARENTHESIS},
                    {type: LexemeType.CONSTANT, value: 1},
                    {type: LexemeType.OPERATOR, value: getOperator('*')},
                    {type: LexemeType.CONSTANT, value: 0},
                    {type: LexemeType.CLOSING_PARENTHESIS}
                ]
            },
            {
                input: "x - (2 / x)",
                expected: [
                    {type: LexemeType.VARIABLE, value: 'x'},
                    {type: LexemeType.OPERATOR, value: getOperator('-')},
                    {type: LexemeType.OPENING_PARENTHESIS},
                    {type: LexemeType.CONSTANT, value: 2},
                    {type: LexemeType.OPERATOR, value: getOperator('/')},
                    {type: LexemeType.VARIABLE, value: 'x'},
                    {type: LexemeType.CLOSING_PARENTHESIS},
                ]
            }
        ]
        for (let i = 0; i < testData.length; i++) {
            var output = parseExpression(testData[i].input);
            assert.ok(arraysEqual(output, testData[i].expected, JSON.stringify(output)));
        }
    });

    QUnit.test("parseExpression правильно обрабатывает некорректные выражения", function(assert) {
        const testData = [
            "-1", "()", "1x", "( +"
        ]
        for (let i = 0; i < testData.length; i++) {
            assert.throws(function(input) {
                parseExpression(testData[i]);
            }, INVALID_EXPRESSION_ERROR);
        }
    });
});

QUnit.module("Тестируем функцию evalVariables", function() {
    QUnit.test("evalVariables работает правильно", function(assert) {
        const lexemes = [
            {type: LexemeType.OPENING_PARENTHESIS},
            {type: LexemeType.CONSTANT, value: 1},
            {type: LexemeType.OPERATOR, value: getOperator('*')},
            {type: LexemeType.VARIABLE, value: 'a'},
            {type: LexemeType.CLOSING_PARENTHESIS},
            {type: LexemeType.VARIABLE, value: 'b'}
        ];
        const variables = [
            { name: "a", value: 3 },
            { name: "b", value: 5 }
        ];
        const expected = [
            {type: LexemeType.OPENING_PARENTHESIS},
            {type: LexemeType.CONSTANT, value: 1},
            {type: LexemeType.OPERATOR, value: getOperator('*')},
            {type: LexemeType.CONSTANT, value: 3},
            {type: LexemeType.CLOSING_PARENTHESIS},
            {type: LexemeType.CONSTANT, value: 5}
        ];

        assert.ok(arraysEqual(evalVariables(lexemes, variables), expected));
    });
});

QUnit.module('Тестируем функцию solve', function () {
	QUnit.test('solve работает правильно ', function (assert) {
		assert.strictEqual(solve('x + 1', 1), 2);
		assert.strictEqual(solve('2 + x - 1', 5), 6);
		assert.strictEqual(solve('2 * x - 1', 5), 9);
		assert.strictEqual(solve('2 * ( x - 1 )', 5), 8);
		assert.strictEqual(solve('(5 - x) * (x + 5)', 3), 16);
		assert.strictEqual(solve('((5 - x) * (x + 5)) * x * x', 3), 144);
	});
});
