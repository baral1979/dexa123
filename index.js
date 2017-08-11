var chalk = require('chalk'),
    clear = require('clear'),
    figlet = require('figlet'),
    inquirer = require('inquirer'),
    chance = 0,
    current_balance = 0,
    mode = 'pre',
    exitWhenRolled = false,
    defaults = {
        balance: 0.001,
        starting_bet: 0.00000001,
        payout: 12,
        condition: '<',
        autobet: false,
        inscrease_on_loss: 15.55,
        access_token: 'd08986e553d7ad5405c4056172639044d89cb86282a177777e33b9c984e0c948798fd7d64573c83838f32163e031f64d69ed1ed57653656dbe1d35fbc13024b7'
    },
    delay = {
        min: 2500,
        max: 4500
    }
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
    rp = require('request-promise'),
    pre_url = 'http://localhost:7799/api/bet',
    bitsler = {
        url: 'https://www.bitsler.com/api/bet',
        //url: 'http://localhost:7799/api/bet',
        params: {
            access_token: '',
            username: 'Baral1979',
            type: 'dice',
            amount: 0.00000001,
            condition: '<',
            game: 49.5,
            devise: 'btc'
        }
    };


clear();

console.log(
    chalk.yellow(
        figlet.textSync('Fast!', {
            horizontalLayout: 'full'
        })
    )
);

var modeQuestion = {
    type: 'list',
    name: 'mode',
    message: 'Select mode:',
    choices: ['sim', 'pre', 'prod'],
    default: 'sim'
};

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.name === 'escape') {
    //process.exit();
    exitWhenRolled = true;
  }
  // else {
  //   console.log(`You pressed the "${str}" key`);
  //   console.log();
  //   console.log(key);
  //   console.log();
  // }
});

inquirer.prompt(modeQuestion).then(function(answer) {
    mode = answer.mode;
    init();
});

function init() {
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

        if (mode !== 'sim') {
            bitsler.params.access_token = defaults.access_token;
            bitsler.params.amount = defaults.starting_bet;
            bitsler.params.condition = defaults.condition;
            bitsler.params.game = chance
            console.log('TOKEN', defaults.access_token);
            defaults.balance = 0;
        }


        clear();
        bet(defaults.starting_bet);
    })
};

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
            if (mode === 'sim')
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
                //nextBet = Math.abs(result.amount) * 2;
                nextBet = Math.abs(result.amount) * (1 + defaults.inscrease_on_loss / 100);
            }

            if (current_balance > stats.balance_high)
                stats.balance_high = current_balance;

            if (current_balance < stats.balance_low)
                stats.balance_low = current_balance;


            writeReport();

            if (exitWhenRolled === true) {
              console.log("Done!");
              console.log("Profit", defaults.balance - current_balance);
            } else bet(nextBet);
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
    else setTimeout(function() {
        questionCallback({
            betsize: amount
        })
    }, mode === 'sim' ? 100 : Math.floor(Math.random() * (delay.max - delay.min + 1) + delay.min));
}

function writeReport() {

    clear();
    var bal = Math.round(current_balance * 100000000);

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

    var roll_number = -1,
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
    } else if (mode === 'pre' || mode === 'prod') {
        var url = mode === 'prod' ? bitsler.url : pre_url;

        var req = rp.post(url);
        var form = req.form();

        for (prop in bitsler.params) {
            if (prop !== 'amount')
                form.append(prop, bitsler.params[prop]);
        }

        form.append('amount', bet);

        req.then(function(response) {
            var data = JSON.parse(response);
            console.log('response', data);

            if (!data)
                throw ('data not defined!')

            if (!data.return)
                throw ('return not defined!')


            data = data.return;
            roll_number = data.roll_number;

            current_balance = parseFloat(data.new_balance);
            if (defaults.balance === 0)
                defaults.balance = current_balance - data.amount_return;

            win = data.amount_return > 0;
            amout = data.amount_return;

            done();

        }).catch(function(err) {

            if (err.statusCode === 429) {
                console.log("Too many requests.. retry in 5 seconds...");
                setTimeout(function() {
                    rollDice(bet, callback);
                }, 5000)
            } else {
                console.log(err.statusCode);
                console.log(err.status);
                console.log(err);
            }


            // if (err.response && err.response.body)
            //     console.log(err.response.body);
            // else if (err.response)
            //     console.log(err.response);
            // else console.log(err);

        });

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

    if (mode !== 'sim') {
        questions.shift();

        questions.push({
            name: 'access_token',
            type: 'input',
            message: 'Access Token?',
            default: defaults.access_token,
            validate: function(value) {
                return value.length > 0;
            }
        });
    }

    inquirer.prompt(questions).then(callback);
}
