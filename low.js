var low_data = [{
    bal_st: 0.00001,
    bal_gt: NaN,
    amount: 0.00000005,
    chance: 15,
    payout: 6.6,
    increase: 16.0
}, {
    bal_st: 0.0001,
    bal_gt: 0.00001,
    amount: 0.00000002,
    chance: 66,
    payout: 1.5,
    increase: 660
}, {
    bal_st: 0.001,
    bal_gt: 0.0001,
    amount: 0.00000005,
    chance: 17,
    payout: 5.8235,
    increase: 26
}, {
    bal_st: 0.01,
    bal_gt: 0.001,
    amount: 0.0000001,
    chance: 10,
    payout: 9.9,
    increase: 12
}, {
    bal_st: 0.1,
    bal_gt: 0.01,
    amount: 0.000001,
    chance: 7.12,
    payout: 13.9045,
    increase: 12
}, {
    bal_st: NaN,
    bal_gt: 0.1,
    amount: 0.00001,
    chance: 4.95,
    payout: 20,
    increase: 7.77
}];

var med_data = [{
    bal_st: 0.00001,
    bal_gt: NaN,
    amount: 0.00000005,
    chance: 9.99,
    payout: 9.9099,
    increase: 12.0
}, {
    bal_st: 0.0001,
    bal_gt: 0.00001,
    amount: 0.00000010,
    chance: 9.9,
    payout: 10,
    increase: 12
}, {
    bal_st: 0.001,
    bal_gt: 0.0001,
    amount: 0.0000001,
    chance: 66,
    payout: 1.5,
    increase: 110
}, {
    bal_st: 0.01,
    bal_gt: 0.001,
    amount: 0.0000001,
    chance: 4.95,
    payout: 20,
    increase: 7.77
}, {
    bal_st: 0.1,
    bal_gt: 0.01,
    amount: 0.000001,
    chance: 7.12,
    payout: 13.9045,
    increase: 12
}, {
    bal_st: NaN,
    bal_gt: 0.1,
    amount: 0.00001,
    chance: 4.95,
    payout: 20,
    increase: 7.77
}];
function next(balance) {
     for(var i = 0; i < low_data.length - 1 ; i++) {
        var r = low_data[i];
       
        if ((balance <= r.bal_st || isNaN(r.bal_st)) &&
           (balance >= r.bal_gt || isNaN(r.bal_gt))) {
               return r;               
           }
     }

     return low_data[0];
}

module.exports = { next };