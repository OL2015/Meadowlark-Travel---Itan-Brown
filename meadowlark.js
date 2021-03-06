// https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
var VALID_EMAIL_REGEX = new RegExp('^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
'[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
'(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$');

var express = require("express");
var fortune = require('./lib/fortune.js');
var weather = require('./lib/weather.js');
var formidable=require("formidable");
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

app.use(require('cookie-parser') (credentials.cookieSecret));
// usage:
// res.cookie('monster', 'nom nom');
// res.cookie('signed_monster', 'nom nom', {signed:true});
// var monster = req.cookies.monster;
// var signedMonster = req.signedCookies.signed_monster;
// res.clearCookie('monster);
app.use(require('express-session')({
    resave:false,
    saveUninitialized:false,
    secret:credentials.cookieSecret,
}));
// usage:
// req.session.userName='Anonymous';
// var colorScheme = req.session.colorScheme || 'dark';
// delete seance:
// req.sessio.userName = null ; (not deleted, just null)
// delete req.session.colorScheme; (delete colorScheme)

 

app.use (function (req, res, next){
    res.locals.flash=req.session.flash;
    delete req.session.flash;
    if (!res.locals.partials) 
        res.locals.partials={};
        res.locals.partials.weatherContext = weather.getWeatherData();
    res.locals.showTests =  app.get('env') !== 'production' && 
        req.query.test==='1'; 
    next();
});

app.get('/contest/vacation-photo', function(req, res){
    var now=new Date();
    res.render('contest/vacation-photo', {
        year:now.getFullYear(), month: now.getMonth()
    });
});
app.post('/contest/vacation-photo/:year/:month', function (req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err,fields, files){
        if (err) 
            return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files;');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

app.get('/newsletter', function(req,res){
    res.render('newsletter',{csrf:'CSRF token goes here'});
});

app.post ('/newsletter', function (req, res){
    var name=req.body.name || '', email=req.body.email || '';
    if (!email.match (VALID_EMAIL_REGEX)) {
        if (req.xhr)
            return res.json({error:'email is incorrect'});
        req.session.flash={
            type:'danger',
            info: "varification error",
            message: 'e-mail address is incorrect',
        }
    }
})



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
    if (req.xhr || req.accepts('json,html')==='json') {
        //process request here
        res.send({success:true});
    } 
    else {
        res.redirect(303, '/thank-you');
    }  
});


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
