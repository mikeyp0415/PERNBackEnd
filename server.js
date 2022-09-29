let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let pg = require('pg');
const PORT = 3000;

//set postgres connection strings 
let pool = new pg.Pool({
  port: 5432,
  password: '',
  database: 'userdb',
  max: 10,
  host: 'localhost',
  user: 'postgres'
});

/*//tell postgres to connect and initiate the query
pool.connect((err, db, done) => {
  //log that tasty error if one happens
  if(err) {
    console.log(err);
    //otherwise execture the query brah
  } else {
    db.query('SELECT * FROM country', (err, table) => {
      if (err) {
        return console.log(err)
      } else {
        console.log(table.rows)
      }
    })
  }
})*/


/*//INERT QUERY
pool.connect((err, db, done) => {
  //log that tasty error if one happens
  if(err) {
    console.log(err);
    //otherwise execture the query brah
  } else {
    var country_name = 'Spain';
    var continent_name = 'Europe';
    var id = Math.random().toFixed(3);
    db.query('INSERT INTO country (country_name, continent_name, id) VALUES ($1, $2, $3)',[country_name, continent_name, id],(err, table) => {
      if (err) {
        return console.log(err)
      } else {
        console.log('DATA INSERTED!')
        db.end();
      }
    })
  }
})*/

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

//From https://enable-cors.org/server_expressjs.html
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


    //Catch the request from the sign up form
  app.post('/api/new-user', function(request, response) {
    var user_name = request.body.user_name;
    var user_email = request.body.user_email;
    var user_password = request.body.user_password;
    //ALWAYS create a new user with the default role of user... Only an admin who already has admin rights can change a users role.
    var user_role = 'User';
    let values = [user_name, user_email, user_password, user_role];
pool.connect((err, db, done) => {
  //log that tasty error if one happens
  if(err) {
    console.log(err);
    //otherwise exectute the query brah
  } else {
    db.query('INSERT INTO users (user_name, user_email, user_password, user_role) VALUES ($1, $2, $3, $4)', [...values], (err, table) => {
      done();
      if (err) {
        return console.log(err)
      } else {
        console.log('DATA INSERTED')
        db.end();
      }
    })
  }
})
  });

    //Catch the request from the login form
  app.post('/api/userLogin', function(request, response) {
    var user_email = request.body.user_email;
    var user_password = request.body.user_password;
    pool.connect((err, db, done) => {
      //log that tasty error if one happens
      if(err) {
        console.log(err);
        //otherwise execture the query brah
      } else {
        db.query('SELECT * FROM users where user_email = $1 and user_password = $2',[user_email, user_password], (err, table) => {
          if (err) {
            return console.log(err)
          } else {
            console.log(table.rows)
            if (table.rows < 1) {
              response.status(200).json('failure')
            } else {
              response.status(200).json('success')
            }
          }
        })
      }
    })
  });

  //Fill the user dashboard with data (currently its only a name)
  app.post('/api/userDataPull', function(request, response) {
    var user_email = request.body.user_email;
    var user_password = request.body.user_password;
    pool.connect((err, db, done) => {
      //log that tasty error if one happens
      if(err) {
        console.log(err);
        //otherwise execture the query brah
      } else {
        db.query('SELECT user_name FROM users where user_email = $1 and user_password = $2',[user_email, user_password], (err, table) => {
          if (err) {
            return console.log(err)
          } else {
            console.log(table.rows.result)
            if (table.rows < 1) {
              response.status(200).json('failure')
            } else {
              response.status(200).json(table.rows)
            }
          }
        })
      }
    })
  });

    //Fill the user dashboard with data (currently its only a name)
    app.post('/api/alter-user', function(request, response) {
      var user_email = request.body.user_email;
      var user_password = request.body.user_password;
      var user_newname = request.body.user_newname;
      pool.connect((err, db, done) => {
        //log that tasty error if one happens
        if(err) {
          console.log(err);
          //otherwise execture the query brah
        } else {
          db.query('UPDATE users SET user_name = $3 where user_email = $1 and user_password = $2',[user_email, user_password, user_newname], (err, table) => {
            if (err) {
              return console.log(err)
            } else {
              console.log(table.rows.result)
              if (err) {
                response.status(200).json('failure')
              } else {
                response.status(200).json('name changed, refresh')
              }
            }
          })
        }
      })
    });

        //Catch the request to access the Admin pagea
  app.post('/api/try-admin-panel', function(request, response) {
    var user_name = request.body.user_name;
    pool.connect((err, db, done) => {
      //log that tasty error if one happens
      if(err) {
        console.log(err);
        //otherwise execture the query brah
      } else {
        db.query('SELECT user_role FROM users where user_name = $1',[user_name], (err, table) => {
          if (err) {
            return console.log(err)
          } else {
            response.status(200).json(table.rows)
          }
        })
      }
    })
  });


  //Catch the request from the login form
  app.post('/api/pullUsers', function(request, response) {
    pool.connect((err, db, done) => {
      //log that tasty error if one happens
      if(err) {
        console.log(err);
        //otherwise execture the query brah
      } else {
        db.query('SELECT * FROM users', (err, table) => {
          if (err) {
            return console.log(err)
          } else {
            response.status(200).json(table.rows)
          }
        })
      }
    })
  });

          //Catch the request to delete a user
          app.post('/api/deleteUser', function(request, response) {
            var user_email = request.body.user_email;
            pool.connect((err, db, done) => {
              //log that tasty error if one happens
              if(err) {
                console.log(err);
                //otherwise execture the query brah
              } else {
                db.query('DELETE from users where user_email = $1',[user_email], (err, table) => {
                  if (err) {
                    return console.log(err)
                  } else {
                    if (table.rows < 1) {
                      response.status(200).json('No user with this email')
                    } else {
                      response.status(200).json('User deleted')
                    }
                  }
                })
              }
            })
          });

                    //Catch the request to promote a user to admin
                    app.post('/api/promoteUser', function(request, response) {
                      var user_email = request.body.user_email;
                      var new_role = 'Admin';
                      pool.connect((err, db, done) => {
                        //log that tasty error if one happens
                        if(err) {
                          console.log(err);
                          //otherwise execture the query brah
                        } else {
                          db.query('UPDATE users set user_role = $2 where user_email = $1',[user_email, new_role], (err, table) => {
                            if (err) {
                              return console.log(err)
                            } else {
                              if (table.rows < 1) {
                                response.status(200).json('No user with this email')
                              } else {
                                response.status(200).json('User promoted')
                              }
                            }
                          })
                        }
                      })
                    });

  app.listen(PORT, () => console.log('Listening on port' + PORT))
