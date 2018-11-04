var Sequelize = require('sequelize')
var DT=Sequelize.DataTypes
var db=require('./index')
 var Favorite=db.define('favorite',{
    slug: {
        type: DT.STRING(10),
        allowNull: true,
    },
    favcount:{
        type:DT.INTEGER(10)
    },
    writer:{
        type:DT.STRING(50)
    }
   
});
 module.exports=Favorite;