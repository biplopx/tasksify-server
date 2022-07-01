const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { reset } = require('nodemon');
const port = process.env.PORT || 5000;
const app = express();

// midleware
app.use(cors());
app.use(express.json());

// root route
app.get('/', (req, res) => {
  res.send('Tasksify server is running...')
});

// Verify Token
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.PH_ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

// MongoDB Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xvycg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    console.log('DB Connect');
    const usersCollection = client.db('tasksifydb').collection('users');
    // user creation
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      // sign a token in user
      const token = jwt.sign({ email: email }, process.env.TASKSIFY_ACCESSS);
      res.send({ result, token })
    });

  }
  finally {
    // 
  }
}
run();


app.listen(port, () => {
  console.log('Taskisfy running:', port)
});