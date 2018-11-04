var Sequelize = require('sequelize')
var DT=Sequelize.DataTypes
var db=require('./index')
var Tag=db.define('tag',{
    tags:{
        type: DT.STRING(50)
    }


});
module.exports=Tag;