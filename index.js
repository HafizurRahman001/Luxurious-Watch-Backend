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



// ${process.env.DB_USER}: ${process.env.DB_PASS}
//DB_USER=mydbuser1      DB_PASS=Q0AlzP3yLxbR7NDs

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h7sw1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

client.connect(err => {
    const productsCollection = client.db("luxurious-watch").collection("products");
    const purchaseInformation = client.db("luxurious-watch").collection("purchase-info");
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
        console.log(result);
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
        console.log(deleteProduct);
    })

    //get user's all order
    app.get('/my-order/:email', async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const myOrders = await purchaseInformation.find(filter).toArray();
        res.send(myOrders);
    });

    //cancel order
    app.delete('/cancel-order/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const result = await purchaseInformation.deleteOne(filter);
        res.send(result);
        console.log(result);
    });


















});


app.get('/', (req, res) => {
    res.send('welcome home page');
});


app.listen(port, () => {
    console.log('surver running on port:', port);
});
