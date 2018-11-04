var Sequelize=require('sequelize')
var DT=Sequelize.DataTypes
var db=require('./index')

var Article=db.define('article',{
    title:{
        type:DT.STRING(50),
        allowNull:false,
    },
    description:{
        type:DT.STRING(30),
        allowNull:true,
    },
    body:{
        type:DT.STRING(30),
        allowNull:true
    },
    slug: {
        type: DT.STRING(10),
        allowNull: false,
    },
    favcount:{
        type:DT.INTEGER(10)
    }
    ,
    author:{
        type:DT.STRING(30),
        allowNull: false,
    },
    tags:{
        type:DT.STRING(30),
        allowNull: true,   
     },
})

module.exports=Article;

