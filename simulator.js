
var Random = require('rng'),
    mt = new Random.MT();

module.exports = {
    bet: function (params) {
        return new Promise((resolve, reject) => {
            var roll_number = parseFloat((mt.uniform() * 100).toFixed(2));
            var amount_return = params.amount *
                (roll_number > params.game && params.condition === '>' ||
                    roll_number < params.game && params.condition === '<'
                    ? 99 / params.game : - 1);

                    console.log(params.game, params.condition, roll_number)
        
            resolve({
                result: {
                    "success": "true",
                    "username": params.username,
                    "id": "22495276467",
                    "type": "dice",
                    "devise": "btc",
                    "ts": 1518797064,
                    "time": "16:04:24",
                    "amount": params.amount,
                    "roll_number": roll_number,
                    "condition": params.condition,
                    "game": params.game,
                    "payout": 2,
                    "winning_chance": 49.5,
                    "amount_return": amount_return.toString(),
                    "new_balance": "0.00000199",
                    "event": false,
                    "notifications": []
                }
            });
        });
    }
}