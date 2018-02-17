var total = 0.019;
var bet = 0.00000100;
var int = 15.55/100;
var games = [];

Number.prototype.toBTC = function() {
    return (parseFloat(this.toPrecision(8))).toFixed(8);
}

getStepBet = function(initialBet, increasePct, step) {
    return (initialBet * Math.pow((1 + increasePct), (step - 1))).toBTC();
}

getNumberOfSteps = function(balance, chance, initialBet) {
    var step = 0;
    while (balance > 0) {
        step++;
        balance -= getStepBet(initialBet, chance, step);
    }
    return step - 1;
}

console.log(getNumberOfSteps(total, int, bet));

process.stdout.write('\x07');
