var express = require("express");
var fortune = require('./lib/fortune.js');
var weather = require('./lib/weather.js');
var app = express();

// set up handlebars view engine
var handlebars = require('express-handlebars').
                create({defaultLayout:'main',
                    helpers:{
                        section: function(name, options){
                            if (!this._sections)
                                this._sections={};
                            this._sections[name]=options.fn(this);
                            return null;
                        }
                    }
            });
app.set('view engine', 'handlebars');                
app.engine('handlebars', handlebars.engine); 


app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

app.use(require('body-parser').urlencoded({extended:true}));



app.use (function (req, res, next){
    if (!res.locals.partials) 
        res.locals.partials={};
        res.locals.partials.weatherContext = weather.getWeatherData();
    res.locals.showTests =  app.get('env') !== 'production' && 
        req.query.test==='1'; 
    next();
});

app.get('/newsletter', function(req,res){
    res.render('newsletter',{csrf:'CSRF token goes here'});
});

app.get('/tours/hood-river', function(req, res){
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res){
    res.render('tours/request-group-rate');
});

app.get ('/', function (req, res) {
    res.render('home'); 
});

app.get ('/jquery-test', function (req, res) {
    res.render('jquery-test'); 
});
app.get('/about', function(req, res){ 
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    }
    );
});
app.get('/headers', function(req, res){ 
    res.set('Content-Type','text/plain');
    var s='';
    for (var name in req.headers)
        s+= name + ": " + req.headers[name] + '\n';
    res.send(s);
});
app.get('/nursery-rhyme', function(req, res){
    res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function(req, res){
    res.json( {
            animal: 'бельчонок',
            bodyPart: 'хвост',
            adjective: 'пушистый',
            noun: 'черт',   
        });
});



app.get ('/api/tours', function (req, res){
    var tours = fortune.getTours();
    var toursXML='<?xml version="1.0"?><tours>'+
    tours.map (function(p) {
                    return '<tour price="' +p.price + 
                            '" id="' + p.id + '">' + p.name + '</tour>';
            }).join('') +'</tours>';
    var toursText = tours.map(function (p){
        return p.id + ': ' + p.name + ' (' +p.price + ')';
    }).join('\n');
    res.format ({
        'application/json' : function(){
            res.json(tours);
        },
        'application/xml': function () {
            res.type('application/xml');
            res.send(toursXML);
        },
        'text/xml': function(){
            res.type('text/xml');
            res.send (toursXML);
        },
        'text/plain': function(){
            res.type('text/plain'); 
            res.send(toursText);
        }
    });
});

app.del('/api/tours:id', function(req, res){
    var tours = fortune.getTours();
    var i;
    for (  i=tours.length-1; i>-0; i--)
        if (tours[i].id ==req.params.id ) break;
    if (i>=0) {
        tource.splice(i,1);   // todo call some middle layer function here
        res.json ({success:true});
    } else {
        res.json({error: 'tour not found'});
    }
});

app.post('/process-contact', function (req, res){
    console.log ('got contact from' +req.body.name +
        ' <' + req.body.email +'>');
    try {
        return res.xhr ?  res.render({success:true}) : res.redirect (303, '/thank-you'); 
    } catch (ex) {
        return res.xhr ? res.json({error: 'DB error'}) :
                        res.redirect (303, '/database-error'); 
    }
});
app.post('/process', function(req, res){
    console.log('Form (from querystring):' + req.query.form);
    console.log('CSRF token (from hidden form field):' + req.body._csrf);
    console.log('Name (from visible form field):' + req.body.name);
    console.log('Email (from visible form field):' + req.body.email);
    res.redirect(303, 'Thank you!');
})


//page 404
app.use( function (req, res)
{ 
    res.status (404);
    res.render ('404');
});

//page 500
app.use( function (err, req, res, next)
{
    console.error(err.stack);
    res.status (500);
    res.render ('500');
});

app.use (function (req, res, next){
    if (!res.locals.partials) 
        res.locals.partials={};
    res.locals.partials.weatherContext = weather.getWeatherData();
    next();
});

app.listen (app.get('port'), 
    function(){
        console.log ('server started at http:\\localhost: '  +
        app.get('port') + ' Press Ctrl+C to stop');
});

if( app.thing  ==null ) console.log( 'Бе-е!'  );
