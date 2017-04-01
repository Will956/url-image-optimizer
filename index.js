#!/usr/bin/env node
const mkdirp = require('mkdirp')
const psi = require('psi')
const async = require('async')
const each = require('async/each')
const findRemoveSync = require('find-remove')
const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')
const imageminGuetzli = require('imagemin-guetzli')
const imageDownloader = require('image-downloader')

if (process.argv.length <= 2) {
    console.log("You need an url parameter.")
    console.log("For example:")
    console.log("npm optimize https://your-url.com")
    process.exit(-1)
}

const Urlfor = process.argv[2]
const imagesList = []

const setOption = function (url, callback) {
  return options = {
    url: url,
    dest: 'img_not_optimised',
    done: (err, filename, image) => {
      if (err) throw err
      console.log('File saved to', filename)
      callback()
    }
  }
}

mkdirp('img_not_optimised', (err) =>  {
  if (err) throw err
})

findRemoveSync('img_not_optimised', {extensions: ['.jpg', '.png']})
findRemoveSync('img_optimised', {extensions: ['.jpg', '.png']})

psi(Urlfor)
  .then(data => {
    var urls = data.formattedResults.ruleResults.OptimizeImages.urlBlocks[0].urls
    urls.forEach(url => imagesList.push(url.result.args[0].value))
  })
  .then(() => {
    async.each(imagesList, (image, callback) => {
        imageDownloader(setOption(image.split('?')[0], callback))
    }, (err) => {
      if (err) throw err
      imagemin(['img_not_optimised/*.png'], 'img_optimised', {use: [imageminPngquant({quality: '65-80'})]}).then(files => {
        console.log('PNG optimised')
        files.forEach(file => console.log(file.path))
      })

      imagemin(['img_not_optimised/*.jpg'], 'img_optimised', {use: [imageminGuetzli()]}).then(files => {
        console.log('JPEG optimised')
        files.forEach(file => console.log(file.path))
      })
    })
})
