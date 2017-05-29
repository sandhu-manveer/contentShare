// cli tool to check db
require('dotenv').config(); 
var posts = require(__dirname + '/posts.json');
var appDB = require('./appDB');
var Post = appDB.Post; 

Post.insertMany(posts)
    .then(() => {
        console.log('Done');
        appDB.close();
    })
    .catch((err) => console.log(err))

// save
/*user.save()
    .then(response =>   {
        // check password verification
        User.findOne({ alias: 'user1' }, function(err, user) {
            if (err) throw err;

            // test a matching password
            user.comparePassword('pass1', function(err, isMatch) {
                if (err) throw err;
                console.log('password:', isMatch); // -&gt; Password123: true
            });

            // test a failing password
            user.comparePassword('123Password', function(err, isMatch) {
                if (err) throw err;
                console.log('123Password:', isMatch); // -&gt; 123Password: false
            });
        });
        console.log(response)
    });*/
