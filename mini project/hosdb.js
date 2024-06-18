const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // Replace 'localhost' and '27017' with your MongoDB server details
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
    const patientname = params["patientname"];
    const patientid = params["patientid"];
    const dob = params["dob"];
    const problem = params["problem"];
    const gender = params["gender"];
    const bloodtype = params["bloodtype"];
    const phno = params["phno"];
    const emergencycontact = params["emergencycontact"];
    const address = params["address"];
    const medicalhistory = params["medicalhistory"];

    if (req.url.includes("/insert")) {
        await insertData(req, res, patientname, patientid, dob, problem, gender, bloodtype, phno, emergencycontact, address, medicalhistory);
    } else if (req.url.includes("/delete")) {
        await deleteData(req, res, patientid);
    } else if (req.url.includes("/update")) {
        await updateData(req, res, patientid, phno);
    } else if (req.url.includes("/display")) {
        await displayTable(req, res);
    }
}

async function insertData(req, res, patientname, patientid, dob, problem, gender, bloodtype, phno, emergencycontact, address, medicalhistory) {
    try {
        const database = client.db('hospital'); // Replace 'hospital' with your actual database name
        const collection = database.collection('patients');

        const patient = {
            patientname,
            patientid,
            dob,
            problem,
            gender,
            bloodtype,
            phno,
            emergencycontact,
            address,
            medicalhistory
        };

        const result = await collection.insertOne(patient);
        console.log(`${result.insertedCount} document inserted`);

        // HTML content for displaying the message in a table
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
                            <td>${patientname}</td>
                        </tr>
                        <tr>
                            <td>Patient ID</td>
                            <td>${patientid}</td>
                        </tr>
                        <tr>
                            <td>Date of Birth</td>
                            <td>${dob}</td>
                        </tr>
                        <tr>
                            <td>Problem</td>
                            <td>${problem}</td>
                        </tr>
                        <tr>
                            <td>Gender</td>
                            <td>${gender}</td>
                        </tr>
                        <tr>
                            <td>Blood Type</td>
                            <td>${bloodtype}</td>
                        </tr>
                        <tr>
                            <td>Mobile No</td>
                            <td>${phno}</td>
                        </tr>
                        <tr>
                            <td>Emergency Contact</td>
                            <td>${emergencycontact}</td>
                        </tr>
                        <tr>
                            <td>Address</td>
                            <td>${address}</td>
                        </tr>
                        <tr>
                            <td>Medical History</td>
                            <td>${medicalhistory}</td>
                        </tr>
                    </table>
                    <a href="/display">View Inserted Table</a>
                </body>
            </html>
        `;

        // Write the HTML response
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
        const database = client.db('hospital'); // Replace 'hospital' with your actual database name
        const collection = database.collection('patients');

        // Construct the filter based on the patient ID
        const filter = { patientid: patientid };

        const result = await collection.deleteOne(filter);
        console.log(`${result.deletedCount} document deleted`);

        // Respond with appropriate message
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

async function updateData(req, res, patientid, newPhoneno) {
    try {
        const database = client.db('hospital'); // Replace 'hospital' with your actual database name
        const collection = database.collection('patients');

        // Construct the filter based on the patient ID
        const filter = { patientid: patientid };

        // Construct the update operation to set the new phone number
        const updateDoc = {
            $set: { phno: newPhoneno } // Assuming 'phno' is the field to update
        };

        const result = await collection.updateOne(filter, updateDoc);
        console.log(`${result.modifiedCount} document updated`);

        // Respond with appropriate message
        if (result.modifiedCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Phone number updated successfully');
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
        const database = client.db('hospital'); // Replace 'hospital' with your actual database name
        const collection = database.collection('patients');

        const cursor = collection.find({});
        const patients = await cursor.toArray();

        // Generate HTML table dynamically based on retrieved documents
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

// Create HTTP server
http.createServer(onRequest).listen(7050);
console.log('Server is running...');