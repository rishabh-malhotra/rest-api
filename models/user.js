var Sequelize=require('sequelize')
var DT=Sequelize.DataTypes
var db=require('./index')

var User=db.define('user',{
    username:{
        type:DT.STRING(50),
        allowNull:false,
        unique:true
    },
    email:{
        type:DT.STRING(30),
        allowNull:false,
        unique:true
    },
    password:{
        type:DT.STRING(30),
        allowNull:false
    },
    image:{
        type:DT.STRING(200),
        allowNull:true
    },
    bio:{
        type:DT.STRING(500),
        allowNull:true
    },
    following:{
        type:DT.STRING(500),
        allowNull:true
    }
})

module.exports=User;

