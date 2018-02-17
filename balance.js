var profit = 0,
    initial = 0.00984,
    current = initial

    function set(amount) {
        initial = amount;
        current = initial;
    }

    function add(amount) {
       
        current += amount;
        profit = current - initial;
       
    }

module.exports = {
    profit : function () { return  current - initial} ,
    set,
    add,
    get: function () { return  current; }
}    