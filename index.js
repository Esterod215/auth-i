const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const knex = require('knex');
const knexConfig = require('./knexfile.js');

const db = knex(knexConfig.development);
const Users = require('./Users/users-functions');

const server = express();

const sessionConfig = {
    name: 'cookie',
    secret: 'super secret',
    cookie: {
      maxAge: 1000 * 60 * 5, 
      secure: false, 
    },
    httpOnly: true, // cannot access the cookie from js using document.cookie
    resave: false,
    saveUninitialized: false, 
  
    store: new KnexSessionStore({
      knex: db,
      tablename: 'sessions',
      sidfieldname: 'sid',
      createtable: true,
      clearInterval: 1000 * 60 * 5,
    }),
  };

server.use(express.json());
server.use(helmet());
server.use(session(sessionConfig));

server.post('/api/register', (req, res) => {
    let user = req.body;
    
    const hash = bcrypt.hashSync(user.password,16)
    user.password = hash;
    
    Users.add(user)
      .then(saved => {
        res.status(201).json(saved);
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });

  
  server.post('/api/login', (req, res) => {
    let { username, password } = req.body;
  
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          
        //added cookie  
          req.session.user = user; 
          res
            .status(200)
            .json({ message: `Welcome ${user.username}!` });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });
  
//new way of writing restricted function
  function restricted(req, res, next) {
    if (req.session && req.session.user) {
      next();
    } else {
      res.status(401).json({ message: 'Unautharized' });
    }
  }

  //no longer need to write it like this
// function restricted(req, res, next) {
//     const { username, password } = req.headers;
  
//     if (username && password) {
//       Users.findBy({ username })
//         .first()
//         .then(user => {
//           if (user && bcrypt.compareSync(password, user.password)) {
//             next();
//           } else {
//             res.status(401).json({ message: 'Invalid Credentials' });
//           }
//         })
//         .catch(error => {
//           res.status(500).json({ message: 'Ran into an unexpected error' });
//         });
//     } else {
//       res.status(400).json({ message: 'No credentials provided' });
//     }
//   }

  server.get('/api/users', restricted, (req, res) => {
    Users.find()
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send(err));
  });

  //logout
  server.get('/api/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.send(
            'you can checkout any time you like, but you can never leave....'
          );
        } else {
          res.send('bye, thanks for playing');
        }
      });
    } else {
      res.end();
    }
  });
  

  



const port = 3000;
server.listen(port, function() {
  console.log(`\n Listening on port http://localhost:${port} ===\n`);
});

