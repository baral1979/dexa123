var chalk = require('chalk'),
    clear = require('clear'),
    figlet = require('figlet'),
    inquirer = require('inquirer'),
    chance = 0,
    current_balance = 0,
    mode = 'pre',
    defaults = {
        balance: 0.00001098,
        starting_bet: 0.00000001,
        payout: 2,
        condition: '<'
    },
    lastbet = {},
    Random = require('rng'),
    mt = new Random.MT(),
    rp = require('request-promise');

clear();

console.log(
    chalk.yellow(
        figlet.textSync('Fast!', {
            horizontalLayout: 'full'
        })
    )
);


promptUser(function() {
    var values = arguments[0];

    // set all defaults values from arguments
    for (prop in values) {
        if (defaults[prop])
            defaults[prop] = values[prop];
    }

    chance = 99 / defaults.payout;
    current_balance = defaults.balance;
    clear();
    bet(defaults.starting_bet);
})

function bet(amount) {
    var validNumber = function(value) {
            if (Number(parseFloat(value)) == value) {
                return true;
            } else
                return 'Please enter a valid number!'
        },

        rollDiceCallback = function(result) {
            clear();

            last_bet = result;
            current_balance += result.amount;

            var nextBet = 0;
            if (result.win) {
                nextBet = defaults.starting_bet;
            } else {
                nextBet = Math.abs(result.amount * defaults.payout);
            }

            writeReport();
            bet(nextBet);

        },

        questionCallback = function() {

            rollDice(arguments[0].betsize, rollDiceCallback);
        },

        question = {
            name: 'betsize',
            type: 'input',
            message: 'Please enter your bet',
            default: amount,
            validate: validNumber
        };



    inquirer.prompt(question).then(questionCallback);
}

function writeReport() {
    clear();

    var maxLen = 0;


    for (prop in last_bet) {
        if (prop.length > maxLen)
            maxLen = prop.length;
    }

    var padder = "";
    for (var i = 0; i < maxLen; i++) {
        padder += " ";
    }


    if (last_bet.win === true) {
        console.log(
            chalk.green(
                figlet.textSync("WON!", {
                    horizontalLayout: 'full'
                })
            ));
    } else {
        console.log(
            chalk.red(
                figlet.textSync("LOST!", {
                    horizontalLayout: 'full'
                })
            ));
    }

    console.log("");
    console.log("");

    for (prop in last_bet) {

        console.log(chalk.grey(prop), chalk.cyan(last_bet[prop]));
    }

    console.log("");
    console.log("");

    var pos = chalk.green,
        neg = chalk.red,
        profit = current_balance - defaults.balance;

    console.log(chalk.white("balance"), chalk.cyan(current_balance.toFixed(8)));
    console.log(chalk.white("profit"), (profit > 0 ? pos : neg)(profit.toFixed(8)));
}

function rollDice(bet, callback) {

    var roll_number = -1;
    win = false,
        amount = -bet;

    var done = function() {
        callback({
            roll_number: roll_number,
            jackpot: roll_number === 77.77,
            win: win,
            amount: amount
        });
    }

    if (mode === 'sim') {
        roll_number = (mt.uniform() * 100).toFixed(2);

        if ((defaults.condition === '<' && roll_number < chance) ||
            (defaults.condition === '>' && roll_number > chance)) {
            amount = bet * defaults.payout;
            win = true;
        }

        done();
    } else if (mode === 'pre') {

        var req = rp.post('http://localhost:7799/api/bet');
        var form = req.form();
        form.append('amount', amount);
        form.append('condition', '<');
        form.append('game', 49.5);

        req.then(function(response) {
            var data = JSON.parse(response);

          //  throw error ('data.error is undefined');

            data = data.return;

            

            if ((defaults.condition === '<' && roll_number < chance) ||
                (defaults.condition === '>' && roll_number > chance)) {
                amount = bet * defaults.payout;
                win = true;
            }

            done();

        }).catch(function(err) {

            if (err.response && err.response.body)
                console.log(err.response.body);
            else if (err.response)
                console.log(err.response);
            else console.log(err);

        });
    } else if (mode === 'prd') {
        throw error('Prod mode not supported!');
    } else {
        throw error('mode not properly defined!');
    }
}

// Prompts
function promptUser(callback) {

    var validNumber = function(value) {
        if (Number(parseFloat(value)) == value) {
            return true;
        } else
            return 'Please enter a valid number!'
    }

    var questions = [{
            name: 'balance',
            type: 'input',
            message: 'Please enter your current balance',
            default: defaults.balance,
            validate: validNumber
        },
        {
            name: 'starting_bet',
            type: 'input',
            message: 'Please enter your starting bet',
            default: defaults.starting_bet,
            validate: validNumber
        },
        {
            name: 'payout',
            type: 'input',
            message: 'Please enter desired payout',
            default: defaults.payout,
            validate: validNumber
        },
        {
            name: 'condition',
            type: 'input',
            message: 'Please enter condition',
            default: defaults.condition,
            validate: function(value) {

                if (value !== '<' && value !== '>') {
                    console.log('value', value);
                    return 'Value must be < or >'
                }
                return true;
            }
        }
    ];

    inquirer.prompt(questions).then(callback);
}
