const express = require('express');
const db = require('./data/db');
const server = express();
const port = 8000;
server.use(express.json());
server.post('/api/users', (req, res) => {
  !req.body.name || !req.body.bio
    ? res
        .status(400)
        .json({ errorMessage: 'Please provide name and bio for the user.' })
    : db
        .insert(req.body)
        .then(id => {
          db.findById(id.id).then(user => {
            res.status(201).send(user);
          });
        })
        .catch(err => {
          res.status(500).json({
            error: 'There was an error while saving the user to the database'
          });
        });
});
server.get('/api/users', (req, res) => {
  db.find()
    .then(users => {
      res.send(users);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: 'The users information could not be retrieved.' });
    });
});
server.get('/api/users/:id', (req, res) => {
  db.findById(req.params.id)
    .then(user => {
      user
        ? res.send(user)
        : res
            .status(404)
            .json({
              message: 'The user with the specified ID does not exist.'
            });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: 'The user information could not be retrieved.' });
    });
});
server.delete('/api/users/:id', (req, res) => {
  db.remove(req.params.id)
    .then(count => {
      count === 0
        ? res
            .status(404)
            .json({ message: 'The user with the specified ID does not exist.' })
        : res.status(200).send(`Removed ${count} user(s).`);
    })
    .catch(err => {
      res.status(500).json({ error: 'The user could not be removed' });
    });
});
server.put('/api/users/:id', (req, res) => {
  db.findById(req.params.id).then(user => {
    user ?
      req.body.name || req.body.bio ? 
        db.update(req.params.id, req.body).then(() => {
          db.findById(req.params.id).then(user=>{
            res.status(200).json(user);
          })
        }).catch(err => {
          res.status(500).json({errorM: 'The user information could not be modified.'});
        }) : 
        res.status(400).json({ errorMessage: "Please provide name and bio for the user." }) :
      res.status(404).json({message: 'The user with the specified ID does not exist.'});
  }).catch(err => {
    res.status(500).json({ error: 'The user information could not be modified.' });
  });
});

server.listen(port, () => {
  console.log(`\n Running on port ${port} \n`);
});
