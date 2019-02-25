const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const knex = require('knex');
const knexConfig = require('./knexfile.js');

const db = knex(knexConfig.development);

const server = express();

server.use(express.json());
server.use(helmet());



const port = 3000;
server.listen(port, function() {
  console.log(`\n Listening on port http://localhost:${port} ===\n`);
});

