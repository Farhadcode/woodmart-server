const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;


// midelwer
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f6j7z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("woodMart");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");
        const reviewCollection = database.collection("review");
        const usersCollection = database.collection('usersData');

        //get API 

        //user data

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.send({ admin: isAdmin });

        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            //console.log(result);
            res.send(result);

        })


        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const update = { $set: user };
            const result = await usersCollection.updateOne(filter, update, options);
            console.log(result);
            res.json(result);
        });
        // admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('makeAdmin', user);
            const filter = { email: user.email };
            const update = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, update);
            console.log(result);
            res.json(result);
        });


        // all product
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // all review display in Home UI
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        })

        //GET Single Service
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service id :', id);
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.json(product);

        })

        // get My Order 

        app.get("/myOrders/:email", async (req, res) => {
            const result = await orderCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        // Delete  Order

        app.delete("/orders/:id", async (req, res) => {
            console.log(req.params.id);
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });

        // All order
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        })

        //Post API

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.post('/order', async (req, res) => {
            const product = req.body;
            const result = await orderCollection.insertOne(product);
            res.send(result);
        })

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', function (req, res) {
    res.send('WoodMart server')
})

app.listen(port, () => {
    console.log(`woodMart server ${port}`);
})