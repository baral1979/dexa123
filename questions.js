module.exports = 
    [
        {
            type: 'input',
            name: 'stopLoss',
            message: 'Stop Loss Limit:',
            default: '0.008'
        },
        {
            type: 'input',
            name: 'initialBalance',
            message: 'Type in your exact balance!!!:',
            default: '0.008'
        },
        {
            type: 'list',
            name: 'riskLevel',
            message: 'How much risk you want to have?',
            choices: ['1 - Low','2 - Medium','3 - High','4 - Auto Mode','5 - Super Power','6 - Switching Mode','7 - Super Save (new)','8 - Huge Profit']
        },
        {
            type: 'list',
            name: 'mode',
            message: 'How much risk you want to have?',
            choices: ['simulation', 'real']
        }
    ]
