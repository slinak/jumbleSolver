const express = require('express');
const mongoose = require('mongoose');
const port = 3000;
const Submission = require('./api/models/SubmissionModel');
const app = express();
const bodyParser = require('body-parser');
const sanitize = require('mongo-sanitize');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/JumbleSubmissions');

var routes = require('./api/routes/SubmissionRoute');
routes(app);

var dictionary = new Map();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/newgame', function (req, res) {
    var gameStartText = GetRandomWordFromDictionary().list[0];
    console.log(gameStartText);
    res.render('game', {gameText: gameStartText, error: null});
});

app.post('/newgame', function(req, res) {
    var gameStartText = GetRandomWordFromDictionary().list[0];
    console.log(gameStartText);
    res.render('game', {gameText: gameStartText, error: null});
});

app.post('/submit', function(req, res) {
    //https://www.npmjs.com/package/mongoose-sanitizer
    Submission.create({Text: sanitize(req.body.jumbledText), SubmissionDate: Date.now()});

    var matchingWords = [];
    var returnBlob = new Map();
    var inputString = req.body.jumbledText.toLowerCase();

    var permutations = Tree(inputString.split(''));

    Array.prototype.forEach.call(permutations, function(p) {
        var sortedPermutation = p.join('').split('').sort().join('');

        if(dictionary[sortedPermutation] !== undefined && sortedPermutation.length > 2) 
            Array.prototype.forEach.call(dictionary[sortedPermutation].list, function(fw) {
                //should clean up, don't really need matchingWords
                //if(!matchingWords.includes(fw)) {
                if(matchingWords.indexOf(fw) == -1) {
                    matchingWords.push(fw);
                    AddItemToValue(returnBlob, fw.length, fw);
                }
            });
    });

    if(matchingWords.length > 0)
        res.render('index', {inputText: inputString, data: returnBlob, error: null});
    else
        res.render('index', {inputText: inputString, data: null, error: "No matches found"});
});

app.listen(port, function () {
  console.log('Unjumbler listening on port ' + port);
  BuildDictionary();
});

function GetRandomWordFromDictionary() {
    var keys = Object.keys(dictionary);
    return dictionary[keys[ keys.length * Math.random() << 0]];
}

function AddItemToValue(map, key, value) {
    if(map[key] !== undefined) {
        var temp = map[key].list;
        temp.push(value);
        map[key].list = temp;
    } else 
        map[key] = {list: [value]};
}

function BuildDictionary() {
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('data/words_concise.txt')
    });

    lineReader.on('line', function(line) {
        var sorted = line.split('').sort().join('');
        AddItemToValue(dictionary, sorted, line);
    });
}

function Tree (leafs) {
    var branches = [];      
    if (leafs.length == 1) 
        return leafs;       
    for (var k in leafs) {
        var leaf = leafs[k];
        Tree(leafs.join('').replace(leaf,'').split('')).concat("").map(function(subtree) {
            branches.push([leaf].concat(subtree));
        });
    }
    return branches;
}