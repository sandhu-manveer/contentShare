// cli tool to check db

var users = require(__dirname + '/users.json');
var appDB = require('./appDB');
var User = appDB.User; 

// save encrypted password
var user = new User();

userFromUsersJson(user, users[0]);

function userFromUsersJson(user, jsonUser) {
  user.alias = jsonUser.alias;
  user.password = jsonUser.password;
}

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

// query and check password encryption
User.findOne({ alias: 'user1' }, function(err, user) {
            if (err) throw err;

            // test a matching password
            user.comparePassword('pass1', function(err, isMatch) {
                if (err) throw err;
                console.log('password:', isMatch); // -&gt; pass1: true
                appDB.close();
            });

            // test a failing password
            user.comparePassword('123Password', function(err, isMatch) {
                if (err) throw err;
                console.log('123Password:', isMatch); // -&gt; 123Password: false
                appDB.close();
            });
        });