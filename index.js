const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const knex = require('knex');
const knexConfig = require('./knexfile.js');

const db = knex(knexConfig.development);

const server = express();

server.use(express.json());
server.use(helmet());

server.post('/api/register',async(req,res)=>{
    try{
      const [id]= await db('users').insert(req.body);
      const user = await db('users').where({ id }).first();
      const hash = bcrypt.hashSync(user.password, 10); 
      user.password = hash;

      res.status(201).json(user);
    }catch(error){
      res.status(500).json(error);
      }
  });

  server.post('/api/login', (req, res) => {
    let { username, password } = req.body;
  
    db.where({ username })
      .first()
      .then(user => {
        // check that passwords match
        if (user && bcrypt.compareSync(password, user.password)) {
          res.status(200).json({ message: `Welcome ${user.username}!` });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });



const port = 3000;
server.listen(port, function() {
  console.log(`\n Listening on port http://localhost:${port} ===\n`);
});

