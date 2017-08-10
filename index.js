var chalk = require('chalk'),
    clear = require('clear'),
    figlet = require('figlet'),
    inquirer = require('inquirer'),
    chance = 0,
    current_balance = 0,
    mode = 'sim',
    defaults = {
        balance: 0.001,
        starting_bet: 0.00000010,
        payout: 12,
        condition: '<',
        autobet: false,
        inscrease_on_loss: 15.55
    },
    stats = {
        wins: 0,
        loss: 0,
        streak_loss: 0,
        streak_wins: 0,
        max_streak_loss: 0,
        max_streak_wins: 0,
        max_bet: 0,
        total_bet: 0,
        count_bets: 0,
        biggest_win: 0,
        biggest_lose: 0,
        balance_high: 0,
        balance_low: 0
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
    current_balance = parseFloat(current_balance);
    defaults.starting_bet = parseFloat(defaults.starting_bet);
    stats.balance_high = current_balance;
    stats.balance_low = current_balance;

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
            //clear();

            last_bet = result;
            current_balance += result.amount;

            var nextBet = 0;
            if (result.win) {
                nextBet = defaults.starting_bet;
            } else {
                //  console.log('div', stats.streak_loss % defaults.payout);
                // if (stats.streak_loss > defaults.payout)
                //     //   throw stats.streak_loss / defaults.payout;
                //     nextBet = defaults.starting_bet * (stats.streak_loss / defaults.payout);
                // //   //  nextBet = Math.abs(result.amount * defaults.payout);
                // else
                    nextBet = Math.abs(result.amount) * (1 + defaults.inscrease_on_loss / 100);
            }

            if (current_balance > stats.balance_high)
                stats.balance_high = current_balance;

            if (current_balance < stats.balance_low)
                stats.balance_low = current_balance;


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
            default: amount.toFixed(8),
            validate: validNumber
        };


    if (!defaults.autobet)
        inquirer.prompt(question).then(questionCallback);
    else setTimeout(function () { questionCallback({
        betsize: amount
    }) }, 500);
}

function writeReport() {

    // if (stats.count_bets > 1 && defaults.autobet === true && stats.count_bets % 100 !== 0)
    //     return;

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
        console.log(chalk.green("WIN!"));
    } else {
        console.log(chalk.red("LOST!"));
    }

    console.log("");
    console.log("");

    for (prop in last_bet) {
        console.log(chalk.grey(prop), chalk.cyan(last_bet[prop]));
    }

    console.log("");
    console.log("");

    for (prop in stats) {
        val = stats[prop];
        if (val.toString().indexOf('e-') > 0)
            console.log(chalk.grey(prop), chalk.cyan(stats[prop].toFixed(8)));
        else
            console.log(chalk.grey(prop), chalk.cyan(stats[prop]));
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

        stats.count_bets++;
        stats.total_bet += Math.abs(amount);

        if (Math.abs(amount) > stats.max_bet)
            stats.max_bet = Math.abs(amount);



        if (win) {
            if (amount > stats.biggest_win)
                stats.biggest_win = amount;

            stats.streak_loss = 0;

            stats.wins++;
            stats.streak_wins++;

            if (stats.max_streak_wins < stats.streak_wins)
                stats.max_streak_wins = stats.streak_wins;
        } else {

            if (Math.abs(amount) > stats.biggest_lose)
                stats.biggest_lose = Math.abs(amount);

            stats.streak_wins = 0;

            stats.loss++;
            stats.streak_loss++;

            if (stats.max_streak_loss < stats.streak_loss)
                stats.max_streak_loss = stats.streak_loss;
        }

        callback({
            roll_number: roll_number,
            jackpot: roll_number === 77.77,
            win: win,
            amount: amount,
            condition: defaults.condition + ' ' + chance
        });
    }

    if (mode === 'sim') {
        roll_number = (mt.uniform() * 100).toFixed(2);

        if ((defaults.condition === '<' && roll_number < chance) ||
            (defaults.condition === '>' && roll_number > chance)) {
            amount = bet * defaults.payout - bet;
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

            if (!data)
                throw ('data not defined!')

            if (!data.return)
                throw ('return not defined!')
            //  throw error ('data.error is undefined');

            data = data.return;
            roll_number = data.roll_number;



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
            name: 'inscrease_on_loss',
            type: 'input',
            message: 'Increase on loss?',
            default: defaults.inscrease_on_loss,
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
