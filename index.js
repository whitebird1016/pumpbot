// Initialize dotenv
const express = require('express');
const connectDB = require('./config/db');
const discordbot = require('./discordbot');
const cors = require('cors');
const bodyParser = require('body-parser');
const UserRoute = require("./routes");

// set Express
const app = express();

// Connect Database
connectDB();


/* Middleware -> Deals the Connections between database and the App */
app.use(cors({ origin: "*" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/* Socket.io Setup */
app.use(express.urlencoded({ extended: true }));

// Define Routes

app.use("/api", UserRoute);

discordbot()

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});