const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleWar
app.use(cors());
app.use(express.json());


// uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@bloodbridge.lumbbjn.mongodb.net/?appName=BloodBridge`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.get('/', (req, res) => {
    res.send('Server is Running Fine')
})

async function run() {
    try {
        await client.connect()

        const db = client.db('BloodBridgeDB');
        const usersCollection = db.collection('users-data');


        // User APIs
        // Create New User
        app.post('/users', async (req, res) => {
            const { name, email, image, bloodGroup, division, district, role, status } = req.body;
            const query = { email };
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'User already exists.' });
            }

            const newUser = {
                name: name || "Your Name",
                email,
                image: image || "/default-Profile.png",
                bloodGroup,
                division,
                district,
                role: role || "donor",
                status: true,
                createdAt: new Date()
            }
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        });

        // Get All the Users Based on BloodGroup
        app.get('/users', async (req, res) => {
            const { bloodGroup } = req.query;

            let query = {};

            if (bloodGroup) {
                query = { bloodGroup };
            }

            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });


        // APIs for Update user Data
        app.patch('/user/:email', async (req, res) => {
            const email = req.params.email;
            const { name, image, bloodGroup, division, district } = req.body;

            const query = { email };
            const update = {
                $set: {
                    ...(name && { name }),
                    ...(image && { image }),
                    ...(bloodGroup && { bloodGroup }),
                    ...(division && { division }),
                    ...(district && { district })
                }
            };

            const result = await usersCollection.updateOne(query, update);
            res.send(result);
        });


        await client.db('admin').command({ ping: 1 });
        console.log("Pinged Your Deployment. You Successfully Connected to MongoDB");
    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`This server is running on port: ${port}`)
})