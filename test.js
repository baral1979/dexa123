var rp = require('request-promise'),

    bitsler = {
         url: 'https://www.bitsler.com/api/bet',
        //url: 'http://localhost:7799/api/bet',
        params: {
            access_token: 'd08986e553d7ad5405c4056172639044d89cb86282a177777e33b9c984e0c948798fd7d64573c83838f32163e031f64d69ed1ed57653656dbe1d35fbc13024b7',
            username: 'Baral1979',
            type: 'dice',
            amount: 0.00000001,
            condition: '<',
            game: 49.5,
            devise: 'btc'
        }
    };

var req = rp({
    method: 'POST',
    url: bitsler.url,
    // headers: {
    //     'Cookie': '__cfduid=d2cc073d6d7463b2928de536b76b640c11502196218; sk=nXh0CebGAFHHOyfWqHMXdw3%2FdzAsLPTd4ZJnjCOU6CFg3VfLY7GernV0vfSTWUU2; at=HK4H6mVF%2FLgzidLDDN3Z51vgQP2FHBxeej1lt0oo%2B6VZwRjqvuzO2aMdIwzNJDsLtTdYeebrLIoX0Hu1CfuEhbs%2F0BWq01KwPl7eRhUblEWQa9Vg%2BEfZAp5u2EiwlubyoDkjOJK%2BetVm6ruUlGE8ddiJdOPXefaPZauEPXMZSxY%3D; temp=LEWAdYfRfQOZC%2BDTIuNQ2w%3D%3D; night_mode=1; PHPSESSID=85f94c2if9lu1ds8e33ve0ul01; _ga=GA1.2.575443217.1502196220; _gid=GA1.2.1964524254.1502196220; sid=n%2BdvmvdICe9KMeEQNxMOJRhnqxW1Msq1VJje5q%2FGSLE%3D',
    //     'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
    //     'x-requested-with': 'XMLHttpRequest',
    //     'origin': 'https://www.bitsler.com',
    //     'referer': 'https://www.bitsler.com/play'
    // }
});

var form = req.form();

for (prop in bitsler.params) {
    form.append(prop.toString(), bitsler.params[prop]);
}

req.then(function(response) {
    var data = JSON.parse(response);
    console.log(data);
});
