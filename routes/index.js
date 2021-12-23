var express = require('express');
const passport = require('passport');
var router = express.Router();
var UserModel = require('./users');
var postModel = require('./post');
var Comment = require('./comment');
const localStrategy = require('passport-local');
const { request } = require('express');
const post = require('./post');
const strorymodel = require('./story');
const mailer = require('./nodemailer')
const comment = require('./comment');
const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');
const schedule = require('node-schedule');
const SendmailTransport = require('nodemailer/lib/sendmail-transport');
var Jimp = require('jimp');

passport.use(new localStrategy(UserModel.authenticate()));
// mailer()
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/myupload/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/home', function(req, res, next) {
  UserModel.findByUsername(req.session.passport.user).then(function(u){
    postModel.find().populate('author')
    .then(function(dets){
      strorymodel.find().then(function(story){
        UserModel.findByUsername(req.session.passport.user).populate('shares').then(function(sher){
          console.log(sher);
          res.render('home',{u,dets,story,sher});

        })
      })
    }) 
  })
})

router.get('/share/:id',function(req,res,next){
  var postid= req.params.id;
  UserModel.find().then(function(val){
    res.render('sharepost',{all:val ,postkiid:postid,loghai:true ,page:"home"})
  })
})

router.get('/shareto/:userid/:postid',function(req,res,next){
    UserModel.findById(req.params.userid).then(function(user){
      postModel.findById(req.params.postid).then(function(post){
        user.shares.push(post._id)
        user.save().then(function(kuchbu){
          res.redirect('/home')
        })
      })
    })
  })

  router.get('/onepost/:id', function(req, res, next) {
    postModel.findById(req.params.id).populate('comments')
    .then(function (sare) {
      res.render('onepost', {sare , loghai:true ,page:'timeline'});
    });
});


router.get('/open/:name', function(req, res, next) {
  UserModel.findByUsername(req.params.name).then(function(u)
  {
    UserModel.findOne({username:req.params.name})
    .populate('posts')
    .then(function(dets){
       res.render('seefriend',{u,dets , loghai:true , page:'profile'});
      
  })
  })
});

router.get('/save/:id', function(req, res, next) {
 UserModel.findOne({username:req.session.passport.user})
 .then(function(user){
   postModel.findById(req.params.id).then(function(post){
     user.saves.push(post._id);
     user.save().then(function(val){
      res.redirect(req.get('referer'));
     })
   })
 })
});

router.get('/alluser', function(req, res, next) {
  UserModel.find().then(function(dets){
  res.render('alluser', {dets:dets,loghai:true ,page:"home"});
  })
  
});

router.get('/registerpage', function(req, res, next) {
  res.render('register');
});

router.get('/view', function(req, res, next) {
  strorymodel.find()
  .populate('suser')
  .then(function(elem){
    res.json({elem})
  })
    })

router.get('/loginpage', function(req, res, next) {
  res.render('index');
});

router.post('/changep/:id',function(req, res,next){
  UserModel.findOne({_id : req.params.id})
  .then(function(founduser){
  if(req.body.password1 === req.body.password2){
    founduser.setPassword(req.body.password1, function(err) {
      founduser.save(function(err){
          console.log(err);
          res.redirect("/profile");
      });
  });
  }
  })
})


router.post('/mail', function(req, res, next) {
    UserModel.findOne({email : req.body.email})
    .then(function(founduser){
      var a = uuidv4();
      founduser.secret = a;
      founduser.save().then(function(val){
       var new1 = `http://localhost:3000/createp/${founduser._id}/${a}`
       mailer(new1,req.body.email)
      })
      })
})

router.get('/addfriend/:id', function(req, res, next) {
  UserModel.findOne({_id:req.params.id})
  .then(function(val){
    console.log(val)
    UserModel.findOne({username:req.session.passport.user})
    .then(function(founduser){
      founduser.friends.push(val.username);
      val.friends.push(founduser.username);
      val.save();
      founduser.save().then(function(){
        res.redirect('/alluser');
      })
    })
  })
});



router.get('/createp/:id/:a', function(req, res, next) {
      UserModel.findOne({_id : req.params.id })
     
      .then(function(founduser){ 
        var i = req.params.id;
        if(founduser.secret === req.params.a){
          res.render('changep',{loghai:false ,page:"create new ", i:i})
        }
        else{
          res.send('badhiya nai')
        }
      })
});

router.get('/story', function(req, res, next) {
  UserModel.find().then(function(data){
    res.render('story', {data,loghai:true ,page:"create story"  });
  })

});
router.post('/imgupload', upload.single('uimage'), function (req, res, next) {
  console.log(req.file, req.body)
  UserModel.findOne({username : req.session.passport.user}).then(function(u){
    Jimp.read(`./public/images/myupload/${req.file.filename}`, (err, file) => {
      if (err) throw err;
      file
        .resize(file.bitmap.width*.5, file.bitmap.height*.5) // resize
        .quality(60) // set JPEG quality // set greyscale
        .write(`./public/images/myupload/${req.file.filename}`); // save
    })
    u.imageurl.push(req.file.filename)
    u.save()
    console.log(u)
    res.redirect('/profile')
  });
    
  })




  router.post('/story',upload.single('imageurl') ,function(req, res, next) {
    strorymodel.create({
      caption:req.body.content,
      imageurl:req.file.filename,
      time: Number(Date.now())
    }).then(function(nstory){
      UserModel.findByUsername(req.session.passport.user)
      .then(function(user){
        nstory.suser = user._id;
        user.story.push(nstory._id);
        user.save();
        nstory.save().then(function(){
          res.redirect(req.get('referer'));
        })
      })
    })
    })
router.post('/register',function(req,res ,next){
  var newUser = new UserModel({
    username : req.body.username,
    email:req.body.email,
    imageurl:req.body.imageurl,
  })
  UserModel.register(newUser , req.body.password )
  .then(function(u){
    passport.authenticate('local')(req,res,function(){
       UserModel.findOne({username:req.session.passport.user})
        .populate('posts')
        .then(function(dets){
      res.render('profile',{u, dets,page:"profile", loghai:true})
        })
    })
  }).catch(function(e){
    res.send(e);
    console.log(e);
  })
})



router.get("/profile" , isLoggedIn,  function(req,res){
      UserModel.findByUsername(req.session.passport.user).then(function(u){
        UserModel.findOne({username:req.session.passport.user})
        .populate('posts')
        .then(function(dets){
          UserModel.findByUsername(req.session.passport.user).populate('shares')
          .then(function(share){
             res.render('profile',{u,dets ,share:share ,loghai:true ,page:"profile"});
          }) 
          
      })
})
})



router.get("/upload" , isLoggedIn,  function(req,res){
      UserModel.findOne({username:req.session.passport.user})
      .populate('posts')
      .then(function(dets){
        res.render('upload' , {dets , loghai:true , page:'uppload'})
        
      })
})
    
router.post('/upload',  upload.single('imageurl'),function(req, res, next) {
    UserModel.findOne({username :req.session.passport.user})
    .then(function(v){
      postModel.create({
        caption : req.body.caption,
        desc: req.body.desc,
        imageurl: req.file.filename,
        author:v._id
      }).then(function(u){
      v.posts.push(u._id); 
      v.save().
      then(function(dets){
      res.redirect('/upload')
    })
   
    })
  })
})


router.get('/likecomment/:id',isLoggedIn,function(req, res) {
        UserModel.findOne({usernane: req.session.passport.user})
        .then(function(founduser){
          Comment.findOne({_id : req.params.id})
          .then(function(com){
            if(com.clikes.indexOf(founduser._id)=== -1){
              com.clikes.push(founduser._id);
            }
            else{
              var index= com.clikes.indexOf(founduser._id);
              com.clikes.splice(index,1)
            }
            com.save().then(function(value){
              res.redirect('/allpost')
            })
            
          })
          
        })
});

router.get('/forget', function(req, res, next) {
  res.render('forget', {loghai:false ,page:"forget password"});
});
  

router.post('/login', passport.authenticate('local',{
  successRedirect:'/home',failureRedirect:'/'
}), function(req,res ,next){
res.redirect('/profile')
})

router.get('/logout' , function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/allpost',(req, res) => {
    postModel.find().populate('comments')
      .then(function (sare) {
        res.render('all', {allp:sare , loghai:true ,page:'timeline'});
        
      })
      ;
  });

  
function isLoggedIn(req,res,next){
  if (req.isAuthenticated()){
    return next();

  }
  else{
    res.redirect('/');
  }
}
router.get('/like/:id',isLoggedIn,function(req, res) {
  UserModel.findOne({username: req.session.passport.user})
  .then(function(founduser){
    postModel.findOne({_id : req.params.id})
      .then(function(post){
        var index= post.likes.indexOf(founduser._id);
         if(index === -1){
                post.likes.push(founduser._id);
              }
              else{
                
                post.likes.splice(index,1)
              }
              post.save().then(function(value){
                res.redirect(req.get('referer'));
              })
              
            })
            
          })
});

router.get('/upload', function(req, res, next) {
  res.render('upload',{loghai:true ,page:'timeline'});
});

router.get('/delete/:id', function(req, res, next) {
  postModel.findByIdAndDelete({_id:req.params.id} ,{new:true})
  .then(function(val){
    res.redirect('/upload');
  })
});

router.post('/blog/:id/comments', isLoggedIn,function(req, res) {
  const comment = new   Comment({
    author :req.session.passport.user,
    comment:req.body.comment
  })
  comment.save((err,result) =>{
    if(err){
      console.log(err)
    }
    else{
      post.findById(req.params.id , (err,post) =>{
        if(err){
          console.log(err)
        }
        else{
          post.comments.push(result);
          post.save();
          res.redirect('/allpost')
          
        }
      })  
      console.log(result);
      
    }
  })
 });
 router.get('/story', function(req, res, next) {
  res.render('story', {loghai:false ,loghai:true,page:"home"});
});



router.get('/play', function(req, res, next) {
res.render('plau',{  loghai:true ,page:'timeline'})
});
router.get('/username/:value', function(req, res, next) {
  var exp = new RegExp('^' + req.params.value)
  UserModel.find({username:exp}).then(function(val){
  res.json({data:val})
  })
})

module.exports = router;
