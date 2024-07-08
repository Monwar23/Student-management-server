const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
const corsOptions = {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://student-management-server-sigma.vercel.app',
      'https://student-management-23.vercel.app'
  
    ],
    credentials: true,
    optionSuccessStatus: 200,
  }
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(cookieParser())

  
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.as3doaz.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {

  try {

    const studentCollection = client.db('Student-management').collection('Students')

    // app.get('/students', async (req, res) => {      
    //     const result = await studentCollection.find().toArray()
    //     res.send(result)
    //   })

      app.get('/students', async (req, res) => {
        try {
            let query = {};
            const { name, sort } = req.query;

            if (name) {
                query = {
                    $or: [
                        { firstName: { $regex: name, $options: 'i' } }, // Case insensitive search
                        { middleName: { $regex: name, $options: 'i' } },
                        { lastName: { $regex: name, $options: 'i' } }
                    ]
                };
            }

            let cursor;
            if (sort === 'asc') {
                cursor = studentCollection.find(query).sort({ rollNumber: 1 });
            } else if (sort === 'desc') {
                cursor = studentCollection.find(query).sort({ rollNumber: -1 });
            } else {
                cursor = studentCollection.find(query);
            }

            const students = await cursor.toArray();
            res.json(students);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });


      app.get('/students/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await studentCollection.findOne(query);
        res.send(result);
      })
  
      app.post("/addStudents", async (req, res) => {
        console.log(req.body);
        const result = await studentCollection.insertOne(req.body);
        console.log(result);
        res.send(result)
      })

      app.put('/students/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: req.body };
        const result = await studentCollection.updateOne(filter, updateDoc);
        res.send(result);
    });

    app.delete('/students/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await studentCollection.deleteOne(query);
        res.send(result);
    });


    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

  
  app.get('/', (req, res) => {
    res.send('running')
  })
  
  app.listen(port, () => {
    console.log(`server is running in port ${port}`);
  })