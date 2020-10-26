const express = require('express')
const app = express()
//initialize promise library
const pgp = require('pg-promise')()

const connectionString = 'postgres://localhost:5432/blogapp'

const db = pgp(connectionString)

const mustacheExpress = require('mustache-express')
app.use(express.urlencoded())

app.use(express.static("css"))


app.engine('mustache', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'mustache')


/*  
to_char(date_created,"MM/DD/YYYY") AS date_created FROM blogPosts, to_char(date_updated, ,"MM/DD/YYYY") AS date_created FROM blogPosts
*/
app.get('/', (req,res) => {
    db.any('SELECT post_id, title, body, date_created, date_updated, is_published FROM blogposts;')
    .then(blogposts => {
        res.render('index', {blogposts: blogposts})
    })
})

app.post('/create-blogPost', (req,res) => {

    const title = req.body.title
    const body = req.body.body
    const date_created = req.date_created
    const date_updated = req.date_updated

    db.none('INSERT INTO blogposts(title, body) VALUES($1,$2)', [title, body, date_created, date_updated])
    .then(() => {
        res.redirect('/')
    })
})

app.post('/delete-blogPost', (req,res) => {

    const post_id = req.body.post_id

    db.none('DELETE FROM blogposts WHERE post_id =$1', [post_id])
    .then(() => {
        res.redirect('/')
    })

})

app.listen(3000, () => {
    console.log('Server is running...')
})