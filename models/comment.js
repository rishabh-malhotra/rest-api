var Sequelize = require('sequelize')
var DT=Sequelize.DataTypes
var db=require('./index')

var CommentonArticle=db.define('comment',{
  
    body:{
        type:DT.STRING(30),
        allowNull:false       
    },
    
});

module.exports=CommentonArticle;