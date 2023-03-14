require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const router = require('../routers'); // Path relative to current file
const apiRouter = require('../routers/api'); // Path relative to current file
const errorHandlers = require('../middlewares/handlers/errorHandlers');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './app/views'); // Path relative to the location of the file that will require this server

app.use(multer().none()); // Handling multipart/form-data
app.use(express.urlencoded({ extended: true })); // To be able to read POST req.body content

app.use(express.static('public'));  // Path relative to the location of the file that will require this server

app.use(router);

app.use(cors());
app.use('/api', apiRouter);

// Error handlers
app.use(errorHandlers.notFound);
app.use(errorHandlers.errorsCollector);


app.set('port', process.env.PORT);
app.set('base_url', process.env.BASE_URL);

app.listen(app.get('port'), () => {
  console.log(`Listening on ${app.get('base_url')}:${app.get('port')}`);
});
