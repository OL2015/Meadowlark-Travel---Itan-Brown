suite ('Global Tests', function(){
    test('Title is good', function(){
        assert(document.title && document.title.match(/\S/)
        && document.title.toUpperCase()!=='TODO');
    });
});