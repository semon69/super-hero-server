const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Super Heros are running')
})


const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.kyulyzl.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const toysCollection = client.db('superHeroDB').collection('allToys')
        const latestToysCollection = client.db('superHeroDB').collection('latestToys')


        app.get('/allToys', async (req, res) => {
            const result = await toysCollection.find().limit(20).toArray()
            res.send(result)
        })

        app.get('/latestToys', async (req, res) => {
            const result = await latestToysCollection.find().toArray()
            res.send(result)
        })

        app.get('/toySearch/:text', async (req, res) => {
            const searchText = req.params.text
            const query = {
                $or: [
                    { toyName: { $regex: searchText, $options: "i" } }
                ]
            }
            console.log(searchText)
            const result = await toysCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/myToys', async (req, res) => {
            const { email, sort } = req.query;
            let sortOptions = {};

            if (sort === 'asc') {
                sortOptions = { price: 1 };
            } else if (sort === 'desc') {
                sortOptions = { price: -1 }; 
            }
            const result = await toysCollection.find({ email }).sort(sortOptions).toArray();
            res.send(result)
        })

        app.get('/myToys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.find(query).toArray()
            res.send(result)
        })

        app.put('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateToy = req.body;
            console.log(updateToy)
            const toy = {

                $set: {
                    price: updateToy.price,
                    availableQuantity: updateToy.availableQuantity,
                    description: updateToy.description

                }
            }
            const result = await toysCollection.updateOne(filter, toy, options)
            res.send(result)
        })

        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query)
            res.send(result)
        })

        app.post('/allToys', async (req, res) => {
            const query = req.body
            const result = await toysCollection.insertOne(query)
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Heros are running on port ${port}`)
})