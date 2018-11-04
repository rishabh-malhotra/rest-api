var User = require('../models/user')
var Article = require('../models/article')
var express = require('express')
var app = express()
var CommentonArticle = require('../models/comment')
const sqlite3 = require('sqlite3');
var authorization=require('../auth')
let db = new sqlite3.Database('./models/realworld.db');

//api to post the comment on the particular article
app.route('/api/articles/:slug/comments')
    .post((req, res) => {
        var token = req.headers['token'];
        var id=authorization(token,req, res)   
        User.findOne({ where: [{ id: id }] })
            .then(function (user) {
                if (!user) {
                    res.status(404).json({ message: 'The requested User does not exist' })
                } else {
                     const slug = req.params.slug
                        Article.findOne({ where: { slug: slug } }).then(function (artone) {
                            CommentonArticle.create({
                                body: req.body.body
                            })
                                .then(commenton => {
                                    var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                                    var comments = { id: commenton.id, createdAt: commenton.createdAt, updatedAt: commenton.updatedAt, body: commenton.body, author: pro }
                                    res.status(201).json(comments)
                                })
                                .catch(error => {
                                    res.status(403).json({message:'Forbidden'})
                                })                      
                    })}
            })
    })
//to get all the comments on the particular article
app.route('/api/articles/:slug/comments')
    .get((req, res) => {
        const slug = req.params.slug
        Article.findOne({ where: { slug: slug } }).then(function (article) {
            User.findOne({ where: { username: article.author } }).then(function (user) {
                CommentonArticle.findAll().then(function (art) {
                    var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                    var comments = { comment: art, author: pro }
                    res.status(200).json(comments)
                })
            })
        }).catch(error => {
            res.status(408).json({message:'Request Timeout'})
        }) 
    })

//api to delete the particular comment
app.delete('/api/articles/:slug/comments/:cid', (req, res) => {
    var token = req.headers['token'];
    var id=authorization(token,req, res)   
    User.findOne({ where: [{ id: id }] })
        .then(function (user) {
            if (!user) {
                res.status(404).json({ message: 'The requested User does not exist' })
            } else {
                const cid1 = parseInt(req.params.cid)
                db.run(`delete from comments where id=?`, [cid1])
                res.status(202).json({ message: 'comment deleted successfully' })
            }
        }) .catch(error => {
            res.status(400).json({message:'Could not proceed with your delete request,please try again:('})
        }) 
})
module.exports = app