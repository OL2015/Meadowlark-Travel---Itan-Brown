var fortunes = [
        "Победи свои страхи, или они победят тебя.",
        "Рекам нужны истоки.",
        "Не бойся неведомого.",
        "Тебя ждет приятный сюрприз.",
        "Будь проще везде, где только можно.",
    ];

    exports.getFortune = function() {
        var idx = Math.floor(Math.random() * fortunes.length);
        return fortunes[idx];
        };

var tours = [
        {id:0, name:'River Hood', price:99.99},
        {id:1, name:'Oregon Coust', price:199.99},
    ];
    exports.getTours=function(){
        return tours;
    }