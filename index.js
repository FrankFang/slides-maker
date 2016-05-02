/*jshint esversion:6,es3:false*/
'use strict'
//var co = require('co')
var marked = require('marked')
var fs = require('fs-promise')
    //var util = require('util')
var p = require('path')
var htmlParser = require('htmlparser2')
var _ = require('lodash')

var renderer = new marked.Renderer()

var htmlStart = fs.readFileSync(p.join(__dirname, './templates/htmlStart.html'))
var htmlEnd = fs.readFileSync(p.join(__dirname, './templates/htmlEnd.html'))

renderer.heading = function(text, level) {
    var escapedText = text.replace(/\s+/g, '-');
    return '<h' + level + ' id=' + escapedText + '>' +
        text + '</h' + level + '>\n';
}
renderer.html = function(text) {
    var result = ''
    var waitForText
    var buffer = ''
    var parser = new htmlParser.Parser({
        onopentag: function(name, attribs) {
            //if(waitForText === true){}
            var temp = '<' + name
            for (var key in attribs) {
                temp += ' ' + key + '="' + attribs[key] + '"'
            }
            temp += ' >'
            if (name === 'slide' || name === 'div') {
                if (waitForText === true && buffer) {
                    result += marked(buffer, {
                        renderer: renderer
                    })
                    buffer = ''
                }
                waitForText = true
                result += temp
            } else {
                buffer += temp
            }
        },
        ontext: function(text) {
            buffer += text.replace(/</g, '&lt;')
        },
        onclosetag: function(name) {
            if (name === 'slide' || name === 'div') {
                if (waitForText === true && buffer) {
                    result += marked(buffer, {
                        renderer: renderer
                    })
                    buffer = ''
                }
                waitForText = false
                result += '</' + name + '>'
            } else {
                var voids = ['area', 'base', 'br', 'col', 'hr', 'img', 'input', 'link', 'meta', 'param', 'command', 'keygen', 'source']
                if (!_.includes(voids, name)) {
                    buffer += '</' + name + '>'
                }
            }
        }
    }, {
        decodeEntities: true
    })
    parser.write(text)
    parser.end()
    return result
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
    fs.ensureDir(outputDir).then(function() {

        let target = p.join(outputDir, filename + '.html')
        let p1 = fs.writeFile(target, result, {
            encoding: 'utf8',
            flag: 'w+'
        })
        let p2 = fs.copy(p.join(__dirname, './templates/'), p.join(outputDir, './'))
        Promise.all([p1, p2]).then(function() {
            console.log('done')
        })
    })
}, function(error) {
    console.log(error)
})
