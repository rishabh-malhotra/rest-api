var User = require('../models/user')
const { Router } = require('express')
var config = require('../config');
const route = Router()
var jwt1 = require('jwt-simple')
const sqlite3 = require('sqlite3');
var authorization = require('../auth')
let db = new sqlite3.Database('./models/database1.db');
var Follow = require('../models/follow')

//api to signup
route.post('/users', (req, res) => {

    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
        .then(user => {
            if (user) {
                const playload = {
                    sub: user.id,
                    expiresIn: 86400
                };
                var token = jwt1.encode(playload, config.secret, process.env.TOKEN_SECRET);
                var reguser = { email: req.body.email, token: token, username: req.body.username, bio: '', image: '' }
                res.status(201).json({ user: reguser })
            }
            else {
                res.status(400).json({ message: 'User can\'tt be created' })
            }
        })
});

//api to login the user
route.post('/users/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({ where: [{ email: email, password: password }] }).then(function (user) {
        if (!user) {
            res.status(404).json({ message: 'The requested User does not exist' })
        } else {
            const playload = {
                sub: user.id
            };
            var token = jwt1.encode(playload, config.secret, process.env.TOKEN_SECRET);
            var authuser = { email: req.body.email, token: token, username: user.username, bio: user.bio, image: user.image }
            res.status(201).json({ user: authuser })

        }

    })

});



//api to get the current user
route.get('/user', (req, res) => {
    var token = req.headers['token'];
    var id = authorization(token, req, res)
    User.findOne({ where: [{ id: id }] }).then(function (user) {
        if (!user) {
            res.status(404).json({ message: 'The requested User does not exist' })
        } else {
            var authuser = { email: user.email, token: token, username: user.username, bio: user.bio, image: user.image }
            res.status(201).json({ user: authuser })

        }
    });

})
//api to follow the particular user
route.post('/profiles/:username/follow', (req, res) => {
    var token = req.headers['token'];
    var id = authorization(token, req, res)
    var username = req.params.username
    User.findOne({ where: [{ id: id }] }).then(function (user) {
        if (!user) {
            res.status(404).json({ message: 'The requested User does not exist' })
        } else {
            Follow.create({
                followuser: req.params.username,
                followedby: user.username
            });
            User.findOne({ where: [{ username: username }] }).then(function (user1) {
                if (!user1) {
                    res.status(404).json({ message: 'The requested User does not exist' })
                } else {
                    var follow = user1.following = 'true'
                    var pro = { username: user1.username, bio: user1.bio, image: user1.image, following: follow }
                    res.status(200).json({ profile: pro })
                }

            })
        }
    })
})

//api to unfollow the user by loggedin user
route.delete('/profiles/:username/follow', (req, res) => {

    var token = req.headers['token'];
    var id = authorization(token, req, res)
    var username = req.params.username
    User.findOne({ where: [{ id: id }] }).then(function (user) {
        if (!user) {
            res.status(404).json({ message: 'The requested User does not exist' })
        } else {
            User.findOne({ where: [{ username: username }] }).then(function (user1) {
                if (!user) {
                    res.status(404).json({ message: 'The requested User does not exist' })
                } else {
                    User.findOne({ where: [{ username: username }] }).then(function (user1) {
                        if (!user) {
                            res.status(404).json({ message: 'The requested User does not exist' })
                        } else {
                            db.run(`delete from follows where followuser=? and followedby=? `, [user1.username, user.username])
                            var follow = user1.following = 'false'
                            var pro = { username: user1.username, bio: user1.bio, image: user1.image, following: follow }
                            res.status(200).json({ profile: pro })
                        }
        
                    })
                }
            })    
        }
    })
})

//update the current user
route.put('/user', (req, res) => {

    var token = req.headers['token'];
    var token1 = token
    var id = authorization(token, req, res)
    var email = req.body.email
    var username = req.body.username
    var password = req.body.password
    var image = req.body.image
    var bio = req.body.bio
    User.findOne({ where: [{ id: id }] }).then(function (user1) {
        if (!user1) {
            res.status(404).json({ message: 'The requested User does not exist' })
        } else {
            db.run(`update users set username=?,email=?,password=?,image=?,bio=? where id=?`, [username, email, password, image, bio, id])
            var updateduser = { email: user1.email, token: token1, username: user1.username, bio: user1.bio, image: user1.image }
            res.status(201).json({ user: updateduser })
        }

    })

});

module.exports = route