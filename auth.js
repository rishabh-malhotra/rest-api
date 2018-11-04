var jwt1 = require('jwt-simple')
var config = require('./config');
module.exports=function(token1,req,res){
     
if (!token1) { return res.status(401).send({ auth: false, message: 'No token provided.' }); }
const payload = jwt1.decode(token1, config.secret, process.env.TOKEN_SECRET);
var id = JSON.stringify(payload.sub)
return id
  
}