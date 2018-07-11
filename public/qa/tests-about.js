suite('About page tests', function(){
    test('the page should contain a link to contact page', function(){
        assert($('a[href="/contact"]').length);
    });
});