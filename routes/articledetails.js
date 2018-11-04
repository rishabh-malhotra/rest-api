var User = require('../models/user')
var Article = require('../models/article')
var randomstring = require('randomstring')
const sqlite3 = require('sqlite3');
var authorization = require('../auth')
let db = new sqlite3.Database('./models/database1.db');
var Favorite = require('../models/favorite')
var Follow = require('../models/follow')
var Tag = require('../models/tags')
var express = require('express')
var app = express()


//api to get the articles according to the filters like tag, author, limits etc
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
                                    res.status(200).json({ article: artic })
                                }
                            })
                        }).catch(error => {
                            res.status(404).json({ message: 'Not Found' })
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
                                            res.status(200).json({ article: artic })
                                        }
                                    })
                            })
                        }
                    }).catch(error => {
                        res.status(404).json({ message: 'Not Found' })
                    })
                    break;
                case 'tag':
                    tag = req.query.tag
                    console.log('value of tag ' + tag)
                    Article.findAll({ where: [{ tags: tag }] }).then(function (article) {
                        if (!article) {
                            res.status(404).json('message:This article do not exist');
                        }
                        else {
                            res.status(200).json(article)
                        }
                    }).catch(error => {
                        res.status(404).json({ message: 'Not Found' })
                    })
                    break;
                case 'favorited':
                    favorited = req.query.favorited
                    Favorite.findAll({ where: { writer: favorited } }).then(function (fav) {
                        favs = new Array()
                        fav.forEach(function (art) {
                            Article.findOne({ where: [{ slug: art.slug }] })
                                .then(function (article) {
                                    favs.push(article)
                                    res.status(200).json({ article: favs })
                                })
                        })
                    }).catch(error => {
                        res.status(404).json({ message: 'Not Found' })
                    })
                    break;

            }
        }

    });

//api to get the feed articles
app.get('/articles/feed', (req, res) => {
    var token = req.headers['token'];
    var id = authorization(token, req, res)
    User.findOne({ where: [{ id: id }] }).then(function (user) {
        if (!user) {
            res.status(404).json({ message: 'The requested User does not exist' })
        } else {
            Follow.findOne({ where: [{ followedby: user.username }] }).then(function (arti) {
                var followeduser = arti.followuser
                Article.findAll({ where: [{ author: followeduser }] }).then(function (articles) {
                    res.status(200).json(articles)
                })
            })
        }
    }).catch(error => {
        res.status(403).json({ message: 'Forbidden' })
    })
});



//api to post the article user can only post if he is logged in
app.route('/articles')
    .post((req, res) => {
        var token = req.headers['token'];
        var id = authorization(token, req, res)
        var slug = randomstring.generate({
            length: 10,
            charset: 'alphanumeric'
        })
        var tagArray = new Array()
        //given this string so as to avoid not defined error if tags are not provided by post
        User.findOne({ where: [{ id: id }] }).then(function (user) {
            var tags = req.body.tags
            if (!user) {
                res.status(404).json({ message: 'The requested User does not exist' })
            } else {
                Article.create({
                    title: req.body.title,
                    description: req.body.description,
                    body: req.body.body,
                    slug: slug,
                    author: user.username,
                    favcount: 0,
                    tags: tags
                })
                    .then(function (article) {
                        var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                        var artic = { slug: article.slug, title: article.title, description: article.description, body: article.body, favoritedCount: article.favcount, createdAt: article.createdAt, updatedAt: article.updatedAt, tags: article.tags, author: pro }
                        if (tags) {   //wrote this condition as tags are optional
                            tagArray = article.tags.split(',')
                            for (i = 0; i < tagArray.length; i++) {
                                Tag.create({
                                    tags: tagArray[i]
                                })
                            }
                        }
                        res.status(201).json({ article: artic })
                    })
            }
        }).catch(error => {
            res.status(404).json({ message: 'Not Found' })
        })
    });

//api to get and update the particluar article 
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
                        var artic = { slug: article.slug, title: article.title, description: article.description, body: article.body, favoritedCount: article.favcount, createdAt: article.createdAt, updatedAt: article.updatedAt, author: pro }
                        res.status(200).json({ article: artic })
                    })
            }
        }).catch(error => {
            res.status(404).json({ message: 'Not Found' })

        })
    })

    // update the particular article 
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
                var tags = req.body.tags
                Article.findOne({ where: { author: user.username } }).then(function (article) {
                    if (article) {
                        console.log(article)
                        db.run(`update articles set title=?, description=?,body=?,slug=? where slug=?`, [newtitle, description, body, slug1, slug])
                        var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                        var artic = { slug: slug1, title: newtitle, description: description, body: body, tags: tags, createdAt: article.createdAt, updatedAt: article.updatedAt, author: pro }
                        res.status(201).json({ article: artic })
                    }
                    else {
                        res.status(404).json({ message: "cannot find the article with the given parameters" })
                    }
                })
            }

        })
    });

//api to delete the particular article 
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
                res.status(202).json({ message: 'article deleted successfully' })
            }
        }).catch(error => {
            res.status(400).json({ message: 'could not fullfill this delete request please try again:(' })
        })
})

//api to favorite the particular article
app.post('/articles/:slug/favorite', (req, res) => {
    var token = req.headers['token'];
    var id = authorization(token, req, res)
    User.findOne({ where: [{ id: id }] }).then(function (user) {
        if (!user) {
            res.status(404).json({ message: 'The requested User does not exist' })
        } else {
            var slug = req.params.slug
            Article.findOne({ where: [{ slug: slug }] }).then(function (article) {
                if (!article) {
                    res.status(404).json({ message: 'The requested Article does not exist' })
                } else {
                    Favorite.create({
                        slug: article.slug,
                        favcount: article.favcount + 1,
                        writer: article.author
                    })
                    var favorited = 'true'
                    var favcount = article.favcount + 1
                    var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                    db.run(`update articles set favcount=? where slug=?`, [favcount, slug])
                    var art = { slug: article.slug, title: article.title, description: article.description, body: article.body, createdAt: article.createdAt, updatedAt: article.updatedAt, favorited: favorited, favoritescount: favcount, author: pro }
                    res.status(202).json({ article: art })
                }
            })
        }
    }).catch(error => {
        res.status(404).json({ message: 'Not Found' })
    })
})

//api to unfavorite the article
app.route('/articles/:slug/favorite')
    .delete((req, res) => {
        var token = req.headers['token'];
        var id = authorization(token, req, res)
        var favcount;
        User.findOne({ where: [{ id: id }] }).then(function (user) {
            if (!user) {
                res.status(404).json({ message: 'The requested User does not exist' })
            } else {
                var slug = req.params.slug
                Article.findOne({ where: [{ slug: slug }] }).then(function (article) {
                    if (!article) {
                        res.status(404).json({ message: 'The requested User does not exist' })
                    } else {
                        if (article.favcount == 0) {
                            favcount = article.favcount
                        }
                        else {
                            favcount = article.favcount - 1
                        }
                        var favorited = 'false'
                        var pro = { username: user.username, bio: user.bio, image: user.image, following: 'false' }
                        db.run(`update articles set favcount=? where slug=?`, [favcount, slug])
                        var art = { slug: article.slug, title: article.title, description: article.description, body: article.body, createdAt: article.createdAt, updatedAt: article.updatedAt, favorited: favorited, favoritescount: favcount, author: pro }
                        res.status(200).json({ article: art })
                    }
                })
            }
        })
            .catch(error => {
                res.status(404).json({ message: 'Not Found' })
            })
    })


module.exports = app