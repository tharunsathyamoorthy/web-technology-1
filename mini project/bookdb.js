const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB server details
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

connectDB();

async function onRequest(req, res) {
    const path = url.parse(req.url).pathname;
    console.log('Request for ' + path + ' received');

    const query = url.parse(req.url).query;
    const params = querystring.parse(query);

    if (req.url.includes("/insert")) {
        await insertData(req, res, params);
    } else if (req.url.includes("/delete")) {
        await deleteData(req, res, params.patientId);
    } else if (req.url.includes("/update")) {
        await updateData(req, res, params);
    } else if (req.url.includes("/display")) {
        await displayTable(req, res);
    }
}

async function insertData(req, res, params) {
    try {
        const database = client.db('medical');
        const collection = database.collection('appointments');

        const appointment = {
            patientId: params.patientId,
            name: params.name,
            contact: params.contact,
            email: params.email,
            date: params.date,
            time: params.time,
            message: params.message
        };

        const result = await collection.insertOne(appointment);
        console.log(`${result.insertedCount} document inserted`);

        const htmlResponse = `
            <html>
                <head>
                    <title>Appointment Details</title>
                    <style>
                        table {
                            font-family: Arial, sans-serif;
                            border-collapse: collapse;
                            width: 50%;
                            margin: 20px auto;
                        }
                        td, th {
                            border: 1px solid #dddddd;
                            text-align: left;
                            padding: 8px;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                    </style>
                </head>
                <body>
                    <h2>Appointment Details</h2>
                    <table>
                        <tr>
                            <th>Field</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>Patient ID</td>
                            <td>${params.patientId}</td>
                        </tr>
                        <tr>
                            <td>Patient Name</td>
                            <td>${params.name}</td>
                        </tr>
                        <tr>
                            <td>Contact Number</td>
                            <td>${params.contact}</td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td>${params.email}</td>
                        </tr>
                        <tr>
                            <td>Preferred Date</td>
                            <td>${params.date}</td>
                        </tr>
                        <tr>
                            <td>Preferred Time</td>
                            <td>${params.time}</td>
                        </tr>
                        <tr>
                            <td>Additional Information</td>
                            <td>${params.message}</td>
                        </tr>
                    </table>
                    <a href="/display">View Inserted Table</a>
                </body>
            </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(htmlResponse);
        res.end();
    } catch (error) {
        console.error('Error inserting data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function deleteData(req, res, patientId) {
    try {
        const database = client.db('medical');
        const collection = database.collection('appointments');

        const filter = { patientId: patientId };

        const result = await collection.deleteOne(filter);
        console.log(`${result.deletedCount} document deleted`);

        if (result.deletedCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Document deleted successfully');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Document not found');
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function updateData(req, res, params) {
    try {
        const database = client.db('medical');
        const collection = database.collection('appointments');

        const filter = { patientId: params.patientId };
        const updateDoc = {
            $set: {
                name: params.name,
                contact: params.contact,
                email: params.email,
                date: params.date,
                time: params.time,
                message: params.message
            }
        };

        const result = await collection.updateOne(filter, updateDoc);
        console.log(`${result.modifiedCount} document updated`);

        if (result.modifiedCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Appointment updated successfully');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Patient ID not found');
        }
    } catch (error) {
        console.error('Error updating data:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

async function displayTable(req, res) {
    try {
        const database = client.db('medical');
        const collection = database.collection('appointments');

        const cursor = collection.find({});
        const appointments = await cursor.toArray();

        let tableHtml = `
            <html>
                <head>
                    <title>Appointment Details</title>
                    <style>
                        table {
                            font-family: Arial, sans-serif;
                            border-collapse: collapse;
                            width: 100%;
                        }
                        th, td {
                            border: 1px solid #dddddd;
                            text-align: left;
                            padding: 8px;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                    </style>
                </head>
                <body>
                    <h2>Appointment Details</h2>
                    <table>
                        <tr>
                            <th>Patient ID</th>
                            <th>Patient Name</th>
                            <th>Contact Number</th>
                            <th>Email</th>
                            <th>Preferred Date</th>
                            <th>Preferred Time</th>
                            <th>Additional Information</th>
                        </tr>
        `;
        appointments.forEach(appointment => {
            tableHtml += `
                <tr>
                    <td>${appointment.patientId}</td>
                    <td>${appointment.name}</td>
                    <td>${appointment.contact}</td>
                    <td>${appointment.email}</td>
                    <td>${appointment.date}</td>
                    <td>${appointment.time}</td>
                    <td>${appointment.message}</td>
                </tr>
            `;
        });
        tableHtml += `
                    </table>
                </body>
            </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(tableHtml);
        res.end();
    } catch (error) {
        console.error('Error displaying table:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

// Create HTTP server
http.createServer(onRequest).listen(8080);
console.log('Server is running...');
