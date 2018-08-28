"use strict";

const solve = function (expression = null, x = null) {
    if (!expression || (!x && x != 0)) {
        throw new TypeError("Expected valid expression and 'x' value!");
    }
    return math.eval(expression, { x: x });
}
