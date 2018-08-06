const express = require('express');
const app = express();
const bodyParser = require('body-parser');

var dictionary = new Map();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/', function(req, res) {
    var matchingWords = [];
    var returnBlob = new Map();
    var inputString = req.body.jumbledText.toLowerCase();

    var permutations = Tree(inputString.split(''));

    Array.prototype.forEach.call(permutations, function(p) {
        var sortedPermutation = p.join('').split('').sort().join('');

        if(dictionary[sortedPermutation] !== undefined && sortedPermutation.length > 2) 
            Array.prototype.forEach.call(dictionary[sortedPermutation].list, function(fw) {
                if(!matchingWords.includes(fw))
                    matchingWords.push(fw);
            });
    });

    Array.prototype.forEach.call(matchingWords, function(w) {
        AddItemToValue(returnBlob, w.length, w);
    });

    res.render('index', {inputText: inputString, data: returnBlob, error: null});
});

app.listen(3000, function () {
  console.log('Unjumbler listening on port 3000!');
  BuildDictionary();
});

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