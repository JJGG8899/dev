var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/nodeauth');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

// var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
  email:{
    type:String,
    unique: true,
    lowercase: true
  },
  profile:{
    userName:{
      type:String,
    },
    profileImage:{
      type: String
    }
  },
  password:{
    type:String
  },
  isAdmin:{
    type:Boolean,
    default: false
  }
  // 暂时不管这个，我们先用user._id 当做固定token
  // 如果要指给一个id,必须用Schema.Types.ObjectId,
  // token:{
  //   type: Schema.Types.ObjectId,
  //   ref:'Token',
  //   default: null
  // }
});

// var Schema = mongoose.Schema;
//
// var TokenSchema = mongoose.Schema({
//   value: String,
//   user:{
//     type: Schema.Types.ObjectId,
//     reft:'User'
//   },
//   expiresAt: {
//     type: Date,
//     expires: 60,
//     default: Date.now
//   }
// });

// var Token = module.exports = mongoose.model('Token', TokenSchema);
//
// UserSchema.methods.generateToken = function(){
//   var token = new Token();
//   // token.value = "test value";
//   token.value = randtoken.generate(32);
//   // this user calls this function, we have access to user
//   token.user = this._id;
//   // user 的 token此时设为token 的 id
//   this.token = token._id;
//   // 下面这个this 表示这个 user
//   this.save(function(err){
//     if(err) throw err;
//     token.save(function(err){
//       if(err)
//         throw err;
//     });
//   });
// }

var User = module.exports = mongoose.model('User',UserSchema);


module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err,salt){
    bcrypt.hash(newUser.password, salt, function(err,hash){
      newUser.password = hash;
        newUser.save(callback);
    });
  });
}

// We want to control every User.function in Models/user.js
// 即便是最最简单的User.findOne({ .. : ..});
module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}
module.exports.getUserByEmail = function(email, callback){
  var query = { email: email };
  User.findOne( query, callback );
}
module.exports.comparePassword = function(inputPassword,hash,callback){
  // bcrypt.compare(inputPassword,hash,function(err,isMatch){
  //   callback(null, isMatch);
  // });
  bcrypt.compare(inputPassword,hash,callback )
}
