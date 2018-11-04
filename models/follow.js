var Sequelize = require('sequelize')
var DT=Sequelize.DataTypes
var db=require('./index')
 var Follow=db.define('follow',{
    followuser:{
        type: DT.STRING(50),
       
      
    },
    followedby:{
        type:DT.STRING(30),
       
       
    },
   
});
 module.exports=Follow;