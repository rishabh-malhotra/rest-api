var User = require('../models/user')
var Article = require('../models/article')
var randomstring = require('randomstring')
const sqlite3 = require('sqlite3');
var authorization = require('../auth')
let db = new sqlite3.Database('./models/database.db');
var express = require('express')
var app = express()

app.route('/articles')
    .get((req, res) => {
        for (let key of Object.keys(req.query)) {
            switch (key) {
                case 'author':
                    author1 = req.query.author
                    User.findOne({ where: [{ username: author1 }] })
                        .then(function (user) {
                            Article.findAll({ where: { author: author1 } }).then(function (article) {
                                if (!article) {
                                    res.status(404).json('message:This article do not exist');
                                } else {
                                    var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                                    artic = new Array()
                                    article.forEach(function (art) {
                                        artic.push({ slug: art.slug, title: art.title, description: art.description, body: art.body, createdAt: art.createdAt, updatedAt: art.updatedAt, author: pro })
                                    });
                                    res.status(201).json({ article: artic })
                                }
                            })
                        })
                    break;
                case 'limit':
                    limit = req.query.limit
                    Article.findAll().then(function (article) {
                        if (!article) {
                            res.status(404).json('message:This article do not exist');
                        }
                        else {
                            i = parseInt(limit)
                            artic = new Array()
                            console.log('value of i ' + i)
                            article.forEach(function (art) {
                                User.findOne({ where: [{ username: art.author }] })
                                    .then(function (user) {
                                        if (i > 0) {
                                            var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                                            artic.push({ slug: art.slug, title: art.title, description: art.description, body: art.body, createdAt: art.createdAt, updatedAt: art.updatedAt, author: pro })
                                            i = i - 1
                                        }
                                        else {
                                            res.status(201).json({ article: artic })
                                        }
                                    })
                            })
                        }
                    })
                    break;
            }
        }
    });


//api to get the articles
app.route('/article')
    .get((req, res) => {
        abc = new Array()
        prof = new Array()
        Article.findAll().then(function (article) {
            res.status(201).json(article)
        })
    });

//api to post the article fully done acc to api checked
app.route('/articles')
    .post((req, res) => {
        var token = req.headers['token'];
        var id = authorization(token, req, res)
        var slug = randomstring.generate({
            length: 10,
            charset: 'alphanumeric'
        })
        User.findOne({ where: [{ id: id }] }).then(function (user) {
            if (!user) {
                res.status(404).json({ message: 'The requested User does not exist' })
            } else {
                Article.create({
                    title: req.body.title,
                    description: req.body.description,
                    body: req.body.body,
                    slug: slug,
                    author: user.username,
                    favcount:0
                })
                    .then(function (article) {
                        var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                        var artic = { slug: article.slug, title: article.title, description: article.description, body: article.body,favoritedCount:article.favcount, createdAt: article.createdAt, updatedAt: article.updatedAt, author: pro }
                        res.status(201).json({ article: artic })
                    })
            }
        })
    })

//api to get and update the particluar article   fully done acc to api
app.route('/articles/:slug')
    .get((req, res) => {
        const slug = req.params.slug
        Article.findOne({ where: { slug: slug } }).then(function (article) {
            if (!article) {
                res.status(404).json('message:This article do not exist');
            } else {
                var username = article.author
                User.findOne({ where: [{ username: username }] })
                    .then(function (user) {
                        var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                        var artic = { slug: article.slug, title: article.title, description: article.description, body: article.body, createdAt: article.createdAt, updatedAt: article.updatedAt, author: pro }
                        res.status(201).json({ article: artic })
                    })
            }
        });

    })
    // update the particular article fully done acc to api checked working fine
    .put((req, res) => {
        var token = req.headers['token'];
        var id = authorization(token, req, res)
        console.log('value of id ' + id)
        User.findOne({ where: [{ id: id }] }).then(function (user) {
            if (!user) {
                res.status(404).json({ message: 'The requested User does not exist' })
            } else {
                const slug = req.params.slug
                var newtitle = req.body.title;
                var description = req.body.description
                var body = req.body.body
                var slug1 = randomstring.generate({
                    length: 10,
                    charset: 'alphanumeric'
                })
                Article.findOne({ where: { author: user.username } }).then(function (article) {
                    db.run(`update articles set title=?, description=?,body=?,slug=? where slug=?`, [newtitle, description, body, slug1, slug])
                    var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                    var artic = { slug: slug1, title: newtitle, description: description, body: body, createdAt: article.createdAt, updatedAt: article.updatedAt, author: pro }
                    res.status(201).json({ article: artic })
                })
            }
        })
    });

//api to delete the particular article fully done acc to api checked
app.delete('/articles/:slug', (req, res) => {
    var token = req.headers['token'];
    var id = authorization(token, req, res)
    User.findOne({ where: [{ id: id }] })
        .then(function (user) {
            if (!user) {
                res.status(404).json({ message: 'The requested User does not exist' })
            } else {
                const slug1 = req.params.slug
                db.run(`delete from articles where slug=?`, [slug1])
                res.status(201).json({ message: 'article deleted successfully' })
            }
        })
})

//exprmnt with the favortie and unfav
app.route('/articles/:slug/favorite')
    .post((req, res) => {
        var token = req.headers['token'];
        var id = authorization(token, req, res)
        
        User.findOne({ where: [{ id: id }] }).then(function (user) {
            if (!user) {
                res.status(404).json({ message: 'The requested User does not exist' })
            } else {
                var slug=req.params.slug
                Article.findOne({ where: [{ slug: slug }] }).then(function (article) {
                    if (!article) {
                        res.status(404).json({ message: 'The requested User does not exist' })
                    } else {
                        
                        var favcount= article.favcount+1
                        var favorited='true'
                        db.run(`update articles set favcount=?`,[favcount])
                        var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                        var art={slug:article.slug,title:article.title,description:article.description,body:article.body,createdAt:article.createdAt,updatedAt:article.updatedAt,favorited:favorited,favoritescount:favcount,author:pro}

                        res.status(200).json({ article: art })
                    }
                })
            }
        })
    })
    app.route('/articles/:slug/favorite')
    .delete((req, res) => {
        var token = req.headers['token'];
        var id = authorization(token, req, res)
        var favcount;
        User.findOne({ where: [{ id: id }] }).then(function (user) {
            if (!user) {
                res.status(404).json({ message: 'The requested User does not exist' })
            } else {
                var slug=req.params.slug
                Article.findOne({ where: [{ slug: slug }] }).then(function (article) {
                    if (!article) {
                        res.status(404).json({ message: 'The requested User does not exist' })
                    } else {
                        if(article.favcount==0)
                       { favcount= article.favcount}
                        else{
                            favcount=article.favcount-1
                        }
                        var favorited='false'
                        var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                        db.run(`update articles set favcount=?`,[favcount])
                        var art={slug:article.slug,title:article.title,description:article.description,body:article.body,createdAt:article.createdAt,updatedAt:article.updatedAt,favorited:favorited,favoritescount:favcount,author:pro}

                        res.status(200).json({ article: art })
                    }
                })
            }
        })
    })


module.exports = app