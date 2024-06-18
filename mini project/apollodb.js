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
        await deleteData(req, res, params.patientid);
    } else if (req.url.includes("/update")) {
        await updateData(req, res, params);
    } else if (req.url.includes("/display")) {
        await displayTable(req, res);
    } else if (req.url.includes("/calculateBill")) {
        await calculateBill(req, res, params);
    }
}

async function insertData(req, res, params) {
    try {
        const database = client.db('hospital');
        const collection = database.collection('patients');

        const patient = {
            patientname: params.patientname,
            patientid: params.patientid,
            dob: params.dob,
            problem: params.problem,
            gender: params.gender,
            bloodtype: params.bloodtype,
            phno: params.phno,
            emergencycontact: params.emergencycontact,
            address: params.address,
            medicalhistory: params.medicalhistory
        };

        const result = await collection.insertOne(patient);
        console.log(`${result.insertedCount} document inserted`);

        const htmlResponse = `
            <html>
                <head>
                    <title>Patient Details</title>
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
                    <h2>Patient Details</h2>
                    <table>
                        <tr>
                            <th>Field</th>
                            <th>Value</th>
                        </tr>
                        <tr>
                            <td>Patient Name</td>
                            <td>${params.patientname}</td>
                        </tr>
                        <tr>
                            <td>Patient ID</td>
                            <td>${params.patientid}</td>
                        </tr>
                        <tr>
                            <td>Date of Birth</td>
                            <td>${params.dob}</td>
                        </tr>
                        <tr>
                            <td>Problem</td>
                            <td>${params.problem}</td>
                        </tr>
                        <tr>
                            <td>Gender</td>
                            <td>${params.gender}</td>
                        </tr>
                        <tr>
                            <td>Blood Type</td>
                            <td>${params.bloodtype}</td>
                        </tr>
                        <tr>
                            <td>Mobile No</td>
                            <td>${params.phno}</td>
                        </tr>
                        <tr>
                            <td>Emergency Contact</td>
                            <td>${params.emergencycontact}</td>
                        </tr>
                        <tr>
                            <td>Address</td>
                            <td>${params.address}</td>
                        </tr>
                        <tr>
                            <td>Medical History</td>
                            <td>${params.medicalhistory}</td>
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

async function deleteData(req, res, patientid) {
    try {
        const database = client.db('hospital');
        const collection = database.collection('patients');

        const filter = { patientid: patientid };

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
        const database = client.db('hospital');
        const collection = database.collection('patients');

        const filter = { patientid: params.patientid };

        const updateDoc = {
            $set: {
                patientname: params.patientname,
                dob: params.dob,
                problem: params.problem,
                gender: params.gender,
                bloodtype: params.bloodtype,
                phno: params.phno,
                emergencycontact: params.emergencycontact,
                address: params.address,
                medicalhistory: params.medicalhistory
            }
        };

        const result = await collection.updateOne(filter, updateDoc);
        console.log(`${result.modifiedCount} document updated`);

        if (result.modifiedCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Patient record updated successfully');
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
        const database = client.db('hospital');
        const collection = database.collection('patients');

        const cursor = collection.find({});
        const patients = await cursor.toArray();

        let tableHtml = `
            <html>
                <head>
                    <title>Patient Details</title>
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
                    <h2>Patient Details</h2>
                    <table>
                        <tr>
                            <th>Patient Name</th>
                            <th>Patient ID</th>
                            <th>Date of Birth</th>
                            <th>Problem</th>
                            <th>Gender</th>
                            <th>Blood Type</th>
                            <th>Mobile No</th>
                            <th>Emergency Contact</th>
                            <th>Address</th>
                            <th>Medical History</th>
                        </tr>
        `;
        patients.forEach(patient => {
            tableHtml += `
                <tr>
                    <td>${patient.patientname}</td>
                    <td>${patient.patientid}</td>
                    <td>${patient.dob}</td>
                    <td>${patient.problem}</td>
                    <td>${patient.gender}</td>
                    <td>${patient.bloodtype}</td>
                    <td>${patient.phno}</td>
                    <td>${patient.emergencycontact}</td>
                    <td>${patient.address}</td>
                    <td>${patient.medicalhistory}</td>
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

async function calculateBill(req, res, params) {
    try {
        const services = params.services ? JSON.parse(params.services) : [];
        let total = 0;

        services.forEach(service => {
            const quantity = parseFloat(service.quantity);
            const unitPrice = parseFloat(service.unitPrice);
            total += quantity * unitPrice;
        });

        const htmlResponse = `
            <html>
                <head>
                    <title>Billing Details</title>
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
                    <h2>Billing Details</h2>
                    <table>
                        <tr>
                            <th>Service</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
        `;
        services.forEach(service => {
            htmlResponse += `
                <tr>
                    <td>${service.name}</td>
                    <td>${service.quantity}</td>
                    <td>${service.unitPrice}</td>
                    <td>${(service.quantity * service.unitPrice).toFixed(2)}</td>
                </tr>
            `;
        });
        htmlResponse += `
                    <tr>
                        <td colspan="3">Total</td>
                        <td>${total.toFixed(2)}</td>
                    </tr>
                    </table>
                </body>
            </html>
        `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(htmlResponse);
        res.end();
    } catch (error) {
        console.error('Error calculating bill:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

// Create HTTP server
http.createServer(onRequest).listen(8080);
console.log('Server is running...');

