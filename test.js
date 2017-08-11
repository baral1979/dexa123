var total = 0.00000750;
var bet = 0.00000001;
var int = 100/100;
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
