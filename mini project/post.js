var http = require('http');
var querystring = require('querystring');

function onRequest(req, res) {
    if (req.method === 'POST' && req.url === '/insert') {
        var body = '';

        req.on('data', function (chunk) {
            body += chunk;
        });

        req.on('end', function () {
            var params = querystring.parse(body);
            var patientname = params["patientname"];
            var patientid = params["patientid"];
            var dob = params["dob"];
            var problem = params["problem"];
            var gender = params["gender"];
            var bloodtype = params["bloodtype"];
            var phno = params["phno"];
            var emergencycontact = params["emergencycontact"];
            var address = params["address"];
            var medicalhistory = params["medicalhistory"];

            var htmlResponse = `
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
                </body>
                </html>
            `;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(htmlResponse);
            res.end();
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page Not Found');
    }
}

http.createServer(onRequest).listen(8000);
console.log('Server is running...');
