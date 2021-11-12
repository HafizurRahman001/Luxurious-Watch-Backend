const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h7sw1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const productsCollection = client.db("luxurious-watch").collection("products");
    const purchaseInformation = client.db("luxurious-watch").collection("purchase-info");
    const reviewCollection = client.db("luxurious-watch").collection("reviews");
    const usersCollection = client.db("luxurious-watch").collection("usersInfo");
    // perform actions on the collection object

    //get all products from db by get method
    app.get('/products', async (req, res) => {
        const products = await productsCollection.find({}).toArray();
        res.send(products);
    });

    //find specific product by id
    app.get('/purchase/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const specificProduct = await productsCollection.findOne(filter);
        res.send(specificProduct);
    });

    // store purchase info data to database
    app.post('/purchase-info', async (req, res) => {
        const query = req.body;
        const purchaseInfo = await purchaseInformation.insertOne(query);
        res.send(purchaseInfo);
    });

    // get purchase ifo from the database
    app.get('/manage-all-orders', async (req, res) => {
        const purchaseDetails = await purchaseInformation.find({}).toArray();
        res.send(purchaseDetails);
    });

    //update data from database 
    app.put('/shipped/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const updateProduct = {
            $set: { status: 'Shipped' }
        };
        const result = await purchaseInformation.updateOne(filter, updateProduct);
        res.send(result);
    });

    //delete order from database
    app.delete('/delete-product/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const deleteOrder = await purchaseInformation.deleteOne(filter);
        res.send(deleteOrder);
    });

    app.delete('/manage-product/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const deleteProduct = await productsCollection.deleteOne(filter);
        res.send(deleteProduct);
    })

    //get user's all order
    app.get('/my-order/:email', async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const filteredOrder = await purchaseInformation.find(filter).toArray();
        res.send(filteredOrder);
    });

    //cancel order
    app.delete('/cancel-order/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const result = await purchaseInformation.deleteOne(filter);
        res.send(result);
    });

    //store review to database
    app.post('/review', async (req, res) => {
        const review = req.body;
        const storeReview = await reviewCollection.insertOne(review);
        res.send(storeReview);
    });

    //store user ifo to data base
    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);
    });
    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user?.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    });

    // update user info
    app.put('/admin', async (req, res) => {
        const userEmail = req.body.email;
        const filter = { email: userEmail };
        const updateRole = {
            $set: { role: 'admin' }
        };
        const result = await usersCollection.updateOne(filter, updateRole);
        res.send(result)
    });

    // check is admin or not
    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.send({ admin: isAdmin });
    });

    //find all user review from database
    app.get('/user-review', async (req, res) => {
        const userReviews = await reviewCollection.find({}).toArray();
        res.send(userReviews);
    });

    //add new product to database
    app.post('/add-product', async (req, res) => {
        const productInfo = req.body;
        const insertedProduct = await productsCollection.insertOne(productInfo);
        res.send(insertedProduct);
    });

});


app.get('/', (req, res) => {
    res.send('welcome home page');
});


app.listen(port, () => {
    console.log('surver running on port:', port);
});
