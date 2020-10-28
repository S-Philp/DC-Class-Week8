const express = require('express')
const app = express() 
const mustacheExpress = require('mustache-express')
const models = require('./models')
const { Op } = require("sequelize");
const { urlencoded } = require('express');

app.use(express.urlencoded())

app.use(express.static("css"))

// tell express to use mustache templating engine
app.engine('mustache',mustacheExpress())
// the pages are located in views directory
app.set('views','./views')
// extension will be .mustache
app.set('view engine','mustache')


app.get('/books', (req,res) => {
    models.Book.findAll()
    .then((books) =>{

        console.log(books)
        res.render('books', {books: books})
    })
})

app.post('/create-book',(req,res) => {

    const title = req.body.title
    const author = req.body.author
    const genre = req.body.genre
    const description = req.body.description

    // Building book object
    let book = models.Book.build ({
        title: title,
        author: author,
        genre: genre,
        description: description
    })

    // Saving book object to the Books Table in the familyLibrary Database
    book.save().then((savedBook) => {
        res.render('confirmSave', savedBook.dataValues)
    }).catch((error) => {
        res.render('error')
    })
})

app.post('/delete-book',(req,res) => {

    const bookId = req.body.bookId 

    models.Book.destroy({
        where: {
            id: bookId
        }
    }).then(deletedBook => {
        console.log(deletedBook)
        res.redirect('/books') 
    })

})

app.get('/filter', (req,res) => {

    res.render('filter')
})

app.post('/filter', (req,res) => {

    const genre = req.body.genre

    models.Book.findAll({
        where: {
            genre: genre
            }
        }).then((filteredBooks) => {

        console.log(filteredBooks)
        res.render('filter', {postFilter: filteredBooks})
    })
})

app.get('/update-book', (req,res) => {

    res.render('update-book')
})

app.post('/update-book', (req,res) => {

    const bookId = req.body.bookId

    // check for the user data 

    const title = req.body.title
    const author = req.body.author
    const genre = req.body.genre
    const description = req.body.description

    models.Book.update({
        title: title,
        author: author,
        genre: genre,
        description: description
    }, {
        where: {
            is: bookId
        }
    }).then(updateBook => {
        console.log(updatedBook)
        res.redirect('/books')
    })
})


app.listen(3000,() => {
    console.log('Server is running...')
})