'use strict';

QUnit.module('Тестируем функцию solve', function () {
	QUnit.test('solve работает правильно ', function (assert) {
		assert.strictEqual(solve('x + 1', 1), 2);
		assert.strictEqual(solve('2 + x - 1', 5), 6);
		assert.strictEqual(solve('2 * x - 1', 5), 9);
		assert.strictEqual(solve('2 * ( x - 1 )', 5), 8);
		assert.strictEqual(solve('(5 - x) * (x + 5)', 3), 16);
		assert.strictEqual(solve('((5 - x) * (x + 5)) * x * x', 3), 144);
	});

	const typeErr = new TypeError("Expected valid expression and 'x' value!");

	QUnit.test('solve обрабатывает некорректные входные данные ', function(assert) {
	    assert.throws(function() { solve(null, 1) }, typeErr);
        assert.throws(function() { solve(undefined, 1) }, typeErr);
        assert.throws(function() { solve('', 1) }, typeErr);
        assert.throws(function() { solve('1', null) }, typeErr);
        assert.throws(function() { solve('1', undefined) }, typeErr);
        solve('1', 0); // x может принимать значение 0
    });
});
