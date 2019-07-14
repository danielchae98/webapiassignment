//library
const express = require('express');
const server = express();
const hbs = require('hbs');
var mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

//db
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "webapi"
});

//variable
var tableData;
var dbData = [];

//settings (paul)
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.urlencoded({extended: true}));
server.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/template');
hbs.registerPartials(__dirname + '/views');

//index
server.get('/', (req, res) => {
    res.render('index.hbs');
});

//archive
server.get('/archive', (req, res) => {
    tableData = [];
    con.query("SELECT * FROM moviesystem", function (err, result, fields) {
        if (err) throw err;
        for(var pos = 0; pos < result.length; pos++){
            const Title = result[pos].title;
            const Year = result[pos].year;
            const imdbID = result[pos].movieId;
            const Type = result[pos].type;
            const Poster = result[pos].poster;

            tableData.push({'Title': Title, 'Year': Year, 'imdbID': imdbID, 'Type': Type, 'Poster': Poster});
        }
        setTimeout(function(){
            // insertDB(dataArray);
            res.render('searchHistory.hbs');
        }, 200)
    });
})

//Helper for display info - Block Helper
hbs.registerHelper('list', (items, options) => {
    items = tableData;
    var out ="";

    const length = items.length;

    for(var i=0; i<length; i++){
        out = out + options.fn(items[i]);
    }

    return out;
});

//SEARCH FUNCTION
server.post('/find', (req, res) => {
    var mName = req.body.mName;
    dbData = [];
    tableData = [];
    const querystr1 = `https://movie-database-imdb-alternative.p.rapidapi.com/?page=1&r=json&s=${mName}`;
    axios.get(querystr1, {headers: {"X-RapidAPI-Host": "movie-database-imdb-alternative.p.rapidapi.com", "X-RapidAPI-Key":  "612945212fmshf7123d37e8f7231p15dd0ejsn90085ca2148f"}}).then((response) => {
        for(var iterate = 0; iterate < response.data.Search.length; iterate++){
            const Title = response.data.Search[iterate].Title;
            const Year = response.data.Search[iterate].Year;
            const imdbID = response.data.Search[iterate].imdbID;
            const Type = response.data.Search[iterate].Type;
            const Poster = response.data.Search[iterate].Poster;

            dbData.push([Title, Year, imdbID, Type, Poster]);
            tableData.push({'Title': Title, 'Year': Year, 'imdbID': imdbID, 'Type': Type, 'Poster': Poster});
        }
        setTimeout(function(){
            insert(dbData);
            res.render('find.hbs');
        }, 200)
    })
});

server.listen(5000, () => {
    console.log('hello');
});

function insert(dbData){
    var sql = `INSERT INTO moviesystem (title, year, movieId, type, poster) VALUES ?`;
    con.query(sql, [dbData],function (err, result) {
        if (err) throw err;
        console.log("Multiple records inserted");
    });
}

server.post('/del', (req, res) => {
    var sql = `DELETE FROM moviesystem`;
    con.query(sql,function (err, result) {
        if (err) throw err;
        res.render('index.hbs');

    });
});