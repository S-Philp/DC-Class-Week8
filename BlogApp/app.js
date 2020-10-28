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



app.get('/', async (req,res) => {

    let result = await db.any("SELECT blogposts.post_id, title, body, to_char(blogposts.date_created,'MM/DD/YYYY') AS post_date_created, to_char(blogposts.date_updated,'MM/DD/YYYY') AS date_updated, blogposts.is_published, postcomments.user_name, postcomments.comment, to_char(postcomments.date_created,'MM/DD/YYYY') AS comment_date_created FROM blogposts FULL OUTER JOIN postcomments ON blogposts.post_id = postcomments.post_id;")

    let blogposts = formatCommentsforDisplay(result)

    console.log(blogposts)

    res.render('index', {blogposts: blogposts})

})


function formatCommentsforDisplay(list) {

    let blogposts = []

    list.forEach((item) => {
        if(blogposts.length == 0) {
            let blogpost = {postId: item.post_id, postTitle: item.title, postBody: item.body, postDateCreated: item.post_date_created,    postDateUpdated: item.date_updated, postPub: item.is_published, comments: [{commentUserName: item.user_name, commentContent: item.comment, commentDateCreated: item.comment_date_created}]}
            blogposts.push(blogpost)
        } else {
            let blogpost = blogposts.find(blogpost => blogpost.postId == item.post_id)
            if(blogpost) {
                blogpost.comments.push({commentUserName: item.user_name, commentContent: item.comment, commentDateCreated: item.comment_date_created})
            } else {
                let blogpost = {postId: item.post_id, postTitle: item.title, postBody: item.body, postDateCreated: item.post_date_created, postDateUpdated: item.date_updated, postPub: item.is_published, comments: [{commentUserName: item.user_name, commentContent: item.comment, commentDateCreated: item.comment_date_created}]}
                blogposts.push(blogpost)
            }
    }
    })

    return blogposts

}


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