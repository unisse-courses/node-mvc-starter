// All imports needed here
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const handlebars = require('handlebars');
const bodyParser = require('body-parser');

// Importing the model
const studentModel = require('./models/student');

// Creates the express application
const app = express();
const port = 9090;

// Creates an engine called "hbs" using the express-handlebars package.
app.engine( 'hbs', exphbs({
  extname: 'hbs',
  defaultView: 'main',
  layoutsDir: path.join(__dirname, '/views/layouts'),
  partialsDir: path.join(__dirname, '/views/partials'),
}));

// Setting the view engine to the express-handlebars engine we created
app.set('view engine', 'hbs');

// Configuration for handling API endpoint data
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// serve static files
app.use(express.static('public'));

// Listening to the port provided
app.listen(port, function() {
  console.log('App listening at port '  + port)
});

// Home route
app.get('/', function(req, res) {
  res.render('home', { title: 'Home' });
});

// Students route
app.get('/students', function(req, res) {
  studentModel.find({}).sort({ name: 1 }).exec(function(err, result) {
    var studentObjects = [];

    result.forEach(function(doc) {
      studentObjects.push(doc.toObject());
    });

    res.render('students', { title: 'Students', students: studentObjects });
  });
});

// Inserts a student in the database
app.post('/addStudent', function(req, res) {
  var student = new studentModel({
    name: req.body.name,
    id: req.body.id,
    img: `img/${req.body.gender}.png`
  });

  student.save(function(err, student) {
    var result;

    if (err) {
      console.log(err.errors);

      result = { success: false, message: "Student was not created!" }
      res.send(result);
    } else {
      console.log("Successfully added student!");
      console.log(student);

      result = { success: true, message: "Student created!" }

      res.send(result);
    }
  });
});

// Finds the students matching the name query from the database and returns the array
app.post('/searchStudents', function(req, res) {
  var pattern = "^" + req.body.name;
  studentModel.find({ name: { $regex: pattern } }, function(err, students) {
    console.log(students);
    res.send(students);
  });

});

// Updates a student to a set id number
app.post('/updateStudent', function(req, res) {
  var query = {
    name: req.body.name
  };

  var update = {
    $set: { id: '109' }
  };

  studentModel.findOneAndUpdate(query, update, { new: true }, function(err, user) {
    if (err) throw err;
    console.log(user);
    res.send(user);
  });
});
