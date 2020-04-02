const studentModel = require('../models/student');

exports.getAllStudents = function(req, res) {
  studentModel.getAll({ name: 1 }, function(students) {
    res.render('students', { title: 'Students', students: students });
  });
};

exports.create = function(req, res) {
  var student = {
    name: req.body.name,
    id: req.body.id,
    img: `img/${req.body.gender}.png`
  };

  studentModel.create(student, function(err,student)
  {
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
};
