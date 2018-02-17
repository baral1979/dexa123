var rp = require('request-promise'),
    url = 'https://www.bitsler.com/api/bet',
    chalk = require('chalk');
//     params: {
//         access_token: '',
//         username: 'Baral1979',
//         type: 'dice',
//         amount: 0.00000001,
//         condition: '<',
//         game: 49.5,
//         devise: 'btc'
//     }
// };

module.exports = {
    bet: function (params) {
        return new Promise((resolve, reject) => {

            var req = rp.post(url);
            var form = req.form();


            for (prop in params) {
                if (prop !== 'balance')
                    form.append(prop, params[prop]);
            }
            console.log(chalk.gray('=============================================================================================================='));
            console.log(chalk.gray('bet', params.amount), chalk.cyan(params.condition, params.game));
            req.then(response => {
                var data = JSON.parse(response);
               // console.log('bitsler response', data.return);
                //data = data.JSON.parse(data.return);
                if (data.return.success === 'true') {
                    console.log(chalk.gray('rolled number'), chalk.yellow(data.return.roll_number));
                    resolve({ result: data.return })
                } else {
                    //console.log('fuck you',data.return.success);
                    reject(data.return.value);
                }
            })
                .catch(error => { reject(error) });
        });
    }
}