const path = require('path');
const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const router = require('../routers'); // Path relative to current file

app.set('view engine', 'ejs');
app.set('views', './app/views'); // Path relative to the location of the file that will require this server

app.use(express.static('public'));  // Path relative to the location of the file that will require this server

// Main router
app.use(router);

app.set('port', process.env.PORT);
app.set('base_url', process.env.BASE_URL);

app.listen(app.get('port'), () => {
  console.log(`Listening on ${app.get('base_url')}:${app.get('port')}`);
});
