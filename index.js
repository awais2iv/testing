import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const port = 3000;
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

const filepath = path.join(__dirname, "blogs.json");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to store data
function storeData(req, res, next) {
    if (req.method === 'POST' && req.path === '/submit') {
        const title = req.body["title"];
        const content = req.body["content"];

        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                console.log(`Error reading file ${filepath}:`, err);
                res.status(500).send('Internal Server Error');
                return;
            }

            // Initialize blogs array if file is empty or doesn't exist
            let blogs = [];
            if (data) {
                blogs = JSON.parse(data);
            }

            // Append new blog entry
            blogs.push({ title, content });

            // Write updated data to file
            fs.writeFile(filepath, JSON.stringify(blogs, null, 2), (err) => {
                if (err) {
                    console.log(`Error while writing to file ${filepath}:`, err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                console.log("Data Saved Successfully");
                next(); // Proceed to the next middleware or route
            });
        });
    } else {
        next();
    }
}

// Serve the form and list blogs
app.get("/", (req, res) => {
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.log(`Error reading file ${filepath}:`, err);
            res.status(500).send('Internal Server Error');
            return;
        }

        let blogs = [];
        if (data) {
            blogs = JSON.parse(data);
        }

        res.render("index.ejs", { blogs });
    });
});

app.post("/submit", storeData, (req, res) => {
    res.redirect("/"); 
});

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});
