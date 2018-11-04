var Sequelize = require('sequelize')
var db = new Sequelize({
    dialect: 'sqlite',
    storage: __dirname + '/realworld.db',
})
db.sync().then(() => console.log('table has been successfully created'))
.catch(error => console.log('This error occured', error));
module.exports=db