var inquirer = require('inquirer');
var questions = require('./questions');
var simulator = require('./simulator');
var balance = require('./balance');
var bitsler = require('./bitsler');
var dice = simulator;
var username = 'Baral1979';
var stopLoss = 0;
var n = require('./low');
var condition = '<'
var last_amount = 0;
var loss = 0;
var bets = 0;
var max_profit = 0.001;
var devise = 'bch';
var mode = 'simulation';
var max_streakloss = 0;
var chalk = require('chalk');
var initial_balance = 0;


// roll_dice({
//     username,
//     amount:0.00000001,
//     condition: '<',
//     game: 49.5,
//     type: 'dice',
//     devise: devise,
//     balance: balance,
//     access_token: 'c3a990c9c6f23d7388790ef56667ec2e5f159a1951cda8309fe50304ff4de0bc4d89e15953df88550125b83aeb675084441a38a72ff9ba80b15d2fda7387e8d6'
// }).then(data => {
//     console.log('response', data)
// });

// return;

inquirer.prompt(questions).then(answers => {

    balance.set(parseFloat(answers.initialBalance));
    initial_balance = balance.get();
    if (answers.mode === 'real') {
        dice = bitsler;
        mode = 'real';
    }
    stopLoss = answers.stopLoss;

    go();
});


function go() {
    var b = n.next(initial_balance);

    var params = {
        username,
        amount: b.amount,
        condition: '<',
        game: b.chance,
        balance: balance,
        type: 'dice',
        devise: devise,
        access_token: 'c3a990c9c6f23d7388790ef56667ec2e5f159a1951cda8309fe50304ff4de0bc4d89e15953df88550125b83aeb675084441a38a72ff9ba80b15d2fda7387e8d6'
    };

    if (loss > 0) {
        //console.log('increase bet', params.amount, '*', (1+(b.increase/100.0))^loss);
        params.amount = (params.amount * Math.pow(1 + b.increase / 100, loss)).toFixed(8);
    }

    roll_dice(params).then(data => {
        bets++;
        var won = parseFloat(data.result.amount_return);
        if (won > 0) {
            if (loss > max_streakloss)
                max_streakloss = loss;
            loss = 0;
        } else loss++;

        balance.add(won);
        var usdprofit = 1520.22 * balance.profit();
        if (data && data.result) {
            var isWin = data.result.amount_return > 0;
            var win = isWin ? chalk.green('won', data.result.amount_return) : chalk.red('lost', data.result.amount_return);
            var profit = balance.profit() > 0 ? chalk.green('profit', balance.profit() * 100000000,) : chalk.red('profit', balance.profit() * 100000000,);

            console.log(win, 'balance: ', balance.get().toFixed(8), profit, 'usd:', usdprofit.toFixed(4), 'bet: ', bets, 'loss:', loss, 'max_streak_loss:', max_streakloss > loss ? max_streakloss : loss);
        }
        if (-1 * stopLoss < balance.profit() && balance.get() > 0)
            setTimeout(function () { go(); }, mode === 'real' ? 750 : 250);
            else console.log('Done bro! lost all!!!');
    });
}

function roll_dice(params) {
    return new Promise((resolve, reject) => {
        dice.bet(params).then(result => {
            //console.log(result);
            resolve(result)
        }).catch(error => { console.log(chalk.red('ERR', error)) });
    });
}
