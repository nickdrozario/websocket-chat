import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
    /* fs.readFile() reads a file asynchronously. You need to provide a callback function to receive the 
    file contents after Node.js finishes reading it.

    err: Contains an error if Node.js encounters a problem reading the file.
    data: Contains the actual contents of the HTML file.
    */
    fs.readFile("./public/index.html", (err, data) => {
        if(err){

            // res.json() is an Express method.
            res.writeHead(500, {"Content-Type": "text/plain"});

            /* res.end() signals to the server that all response headers and body content have been sent.
            .end() closes the request-responce cycle. 
            */
            res.end("Internal Server Error");
            return;
        }
        // You use writeHead because you need to send status code AND header information.
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(data);
    });
});

const wss = new WebSocketServer({server});

wss.on("connection", (socket, req) => {
    const username = new URL(req.url, "http://localhost").searchParams.get("username");
    const message = JSON.stringify({"type": "system", "text": `${username} joined`});

    wss.clients.forEach((client) => {
        client.send(message);
    });

    socket.on("message", (data) => {
        const { username, text} = JSON.parse(data);
        const message = JSON.stringify({type: "chat", username, text});

        wss.clients.forEach((client) => {
            client.send(message);
        });
    });

    socket.on("close", () => {
        const message = JSON.stringify({type: "system", text: `${username} left`});

        wss.clients.forEach((client) => {
            client.send(message);
        });
    });
});

server.listen(PORT, () => {
    console.log("Chat server running at http://localhost:3001");
});
