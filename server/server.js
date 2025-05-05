/*

Our Google Cloud server =
https://cs-467-shopping-app.uw.r.appspot.com/


*/


const express = require("express");


const app = express();

app.get("/", (req, res) => {
    res.send("Hi. hello. hi.");
});



const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});