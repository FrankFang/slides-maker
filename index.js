/*jshint esversion:6,es3:false*/
'use strict'
//var co = require('co')
var marked = require('marked')
var fs = require('fs-promise')
//var util = require('util')
var p = require('path')
var htmlparser = require("htmlparser");
var handler = new htmlparser.DefaultHandler(function(error, dom) {
    if (error) {
        return console.log(error)
    }
})
var parser = new htmlparser.Parser(handler);

var renderer = new marked.Renderer()

var htmlStart = fs.readFileSync(p.join(__dirname, './templates/htmlStart.html'))
var htmlEnd = fs.readFileSync(p.join(__dirname, './templates/htmlEnd.html'))

renderer.heading = function(text, level) {
    var escapedText = text.replace(/\s+/g, '-');
    return '<h' + level + ' id=' + escapedText + '>' +
        text + '</h' + level + '>\n';
}
renderer.html = function(text) {
    parser.parseComplete(text);

    function parseCollection(dom) {
        return dom.map(function(item) {
            if (item.type === 'tag') {
                return '<' + item.raw + '>' + parseCollection(item.children) + '</' + item.name + '>'
            } else {
                var m = marked(item.raw, {
                    renderer: renderer
                })
                return m
            }
        }).join('\n')
    }
    return parseCollection(handler.dom)
}

var length = process.argv.length
if (length < 3) {
    console.log('slides-maker path/to/markdown/file outputDir')
    process.exit(1)
}

let input = p.normalize(process.argv[2])
let outputDir = p.normalize(process.argv[3] || './output/')
let filename = p.basename(input, p.extname(input))

fs.readFile(input).then(function(data) {

    var content = data.toString('utf8')
    var html = marked(content, {
        renderer: renderer
    })
    let result = [htmlStart, html, htmlEnd].join('\n')
    fs.ensureDir(outputDir).then(function(){

        let target = p.join(outputDir, filename + '.html')
        let p1 = fs.writeFile(target, result, {
            encoding: 'utf8',
            flag: 'w+'
        })
        let p2 = fs.copy(p.join(__dirname,'./templates/assets/'), p.join(outputDir, 'assets/'))
        Promise.all([p1,p2]).then(function(){
            console.log('done')
        })
        
    })
}, function(error) {
    console.log(error)
})

