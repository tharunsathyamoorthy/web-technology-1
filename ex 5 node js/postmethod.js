var http = require('http');
var querystring = require('querystring');

function onRequest(req, res) {
    if (req.method === 'POST' && req.url === '/login') {
        var body = '';

        req.on('data', function (chunk) {
            body += chunk;
        });

        req.on('end', function () {
            var params = querystring.parse(body);
            var username = params["username"];
            var id = params["id"];
            var branch = params["branch"];
            var mobileNo = params["phno"];
            var gender = params["gender"];
            var branchadd = params["branchadd"];
            var dob = params["dob"];
            var email = params["email"];

            var htmlResponse = `
                <html>
                <head>
                <title>User Details</title>
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
                <h2>User Details</h2>
                <table>
                <tr>
                    <th>Content</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Username</td>
                    <td>${username}</td>
                </tr>
                <tr>
                    <td>ID</td>
                    <td>${id}</td>
                </tr>
                <tr>
                    <td>Email id</td>
                    <td>${email}</td>
                </tr>
                <tr>
                    <td>Gender</td>
                    <td>${gender}</td>
                </tr>
                <tr>
                    <td>Date of birth</td>
                    <td>${dob}</td>
                </tr>
                <tr>
                    <td>Branch</td>
                    <td>${branch}</td>
                </tr>
                <tr>
                    <td>Branch Address</td>
                    <td>${branchadd}</td>
                </tr>
                <tr>
                    <td>Mobile No</td>
                    <td>${mobileNo}</td>
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

