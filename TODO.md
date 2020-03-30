# Instructions to Refactor to MVC Architecture

Follow these instructions to be able to refactor the current code to follow an MVC structure for our "Students App" sample. No need to create new files, there are already blank files available in the project.

## Splitting `index.js` to config and routes
In `index.js`, we only want server configurations here. All routes and their handling will be moved to [`routes/studentRoutes.js`](routes/studentRoutes.js).

1. Open [`index.js`](index.js). Move everything from line 44 and below to [`routes/studentRoutes.js`](routes/studentRoutes.js). **DO NOT MOVE THE HOME ROUTE.**
  ```JavaScript
  // Students route
  app.get('/students', function(req, res) {
    ...
  });

  ...

  app.post('/updateStudent', function(req, res) {
    ...
  });
  ```
2. Import the dependency `studentModel` in [`routes/studentRoutes.js`](routes/studentRoutes.js). _(Note here the `../` instead of just `./`)_
  ```JavaScript
  // Importing the model
  const studentModel = require('../models/student');
  ```

3. [`routes/studentRoutes.js`](routes/studentRoutes.js) is not usable yet since we haven't exported anything. But before we export it, we need to ensure that express is also imported to make the routes part of the main application.
  ```JavaScript
  // Import the express Router
  const router = require('express').Router();
  ```

  Replace all instances of `app` with `router` (since we changed the variable name).

4. Export the entire Router instance at the end of all the code.
  ```JavaScript
  module.exports = router;
  ```

5. Back in [`index.js`](index.js), import the `studentRoutes` module:
  ```JavaScript
  // Import the student routes
  const studentRouter = require('./routes/studentRoutes');
  ```
6. At the end of the file, add the configuration to use `studentRouter`.
  ```JavaScript
  app.use('/students', studentRouter);
  ```

  > At this point, [http://localhost:9090/students](http://localhost:9090/students) is still broken. But you can access [http://localhost:9090/students/students](http://localhost:9090/students/students) — the images will be broken though. (Try it out!)

7. To fix this issue, we need to update the route definitions in [`routes/studentRoutes.js`](routes/studentRoutes.js). Replace all the strings following this table:

  Old Route         | New Route
  ------------------|------------
  `/students`       | `/`
  `/addStudent`     | `/add`
  `/searchStudents` | `/search`
  `/updateStudent`  | `/:id/edit`

  > [http://localhost:9090/students](http://localhost:9090/students) should be working as before now.

8. But for the other routes, we need to fix the AJAX calls we have in `public/js/script.js`. The updated code should be as follows:
    ```JavaScript
    $.post('/students/add', newStudent, function(data, status) {
      ...
    });

    $.post('/students/search', { name: name }, function(data, status) {
      ...
    });
    ```

Test the application. It should be working as before.

## [Move database functions to `models`](#database-to-model)
Direct database function calls should not be in the controller according to [Item #3 in this article](https://www.infoworld.com/article/3204205/7-keys-to-structuring-your-nodejs-app.html). These should be handled in the model.

For the written instructions, I'll only illustrate the view all students for `/students`. The pattern is the same for converting everything to MVC.

We start with this code in [`routes/studentRoutes.js`](routes/studentRoutes.js):
```JavaScript
router.get('/', function(req, res) {
  studentModel.find({}).sort({ name: 1 }).exec(function(err, result) {
    var studentObjects = [];

    result.forEach(function(doc) {
      studentObjects.push(doc.toObject());
    });

    res.render('students', { title: 'Students', students: studentObjects });
  });
});
```

We need to move the call to `studentModel.find()` to the model since this is the direct function of `mongoose`.

1. In [`models/student.js`](models/student.js), replace the `module.exports` line with this:

  ```JavaScript
  const studentModel = mongoose.model('students', studentSchema);
  ```

  This prevents other modules to directly access the mongoose.model() object.

2. To allow controllers/routers to access the database, we need to export wrapper functions that are somewhat generic. In this case, we need to send all students to the controller. Add the following code to [`models/student.js`](models/student.js):

  ```JavaScript
  exports.getAll = function(sort, next) {
    studentModel.find({}).sort(sort).exec(function(err, result) {
      if (err) throw err;
      var studentObjects = [];

      result.forEach(function(doc) {
        studentObjects.push(doc.toObject());
      });

      next(studentObjects);
    });
  };
  ```

  In the model, you can specify whatever parameters needed for the function that the controller should call to get what's needed. In this case, we're creating a function that accepts an object that serves as the sorting parameter for the query.

  Take note of the `next` argument. That's the parameter for the callback function when the database call is complete. See the last line of code, we call that function passing the formatted `studentObjects`.

  The function is also directly added to the `module.exports` object so it's automatically exported and other modules can use it: `getAll(sort, next)`

3. Next, we update the [`routes/studentRoutes.js`](routes/studentRoutes.js) file to use this new function we've exported.

  ```JavaScript
  router.get('/', function(req, res) {
    studentModel.getAll({ name: 1 }, function(students) {
      res.render('students', { title: 'Students', students: students });
    });
  });
  ```

  In the new code above, we replaced the `find({}).sort().exec()` with the new function `getAll()` and the arguments we passed are:
  * `sort` = `{ name: 1 }`
  * `next`: Callback function
    ```JavaScript
    function(students) {
      res.render('students', { title: 'Students', students: students });
    });
    ```

  So when the model calls `next(studentObjects)`, it's executing the function above.

> **NOTE**: The other routes will no longer be working because the `studentModel` object no longer has the functions from mongoose. You'd need to update them all to ensure that it works.

You can end here and the [`routes/studentRoutes.js`](routes/studentRoutes.js) file will basically act as the controller. But to make things even more modularized, continue on and place the callback functions to a controller file.

## [Separating routes and controller functions]((#split-route-controller))
1. In [`controllers/studentController.js`](controllers/studentController.js), import the student model:

  ```JavaScript
  const studentModel = require('../models/student');
  ```

2. Move the entire callback function from the route in [`routes/studentRoutes.js`](routes/studentRoutes.js) to the `studentController.js` file:

  ```JavaScript
  exports.getAllStudents = function(req, res) {
    studentModel.getAll({ name: 1 }, function(students) {
      res.render('students', { title: 'Students', students: students });
    });
  };
  ```

  This is similar to how we exported a function in the model.

3. In [`routes/studentRoutes.js`](routes/studentRoutes.js), import the controller module:

  ```JavaScript
  const studentController = require('../controllers/studentController');
  ```
4. And update the route definition:

  ```JavaScript
  router.get('/', studentController.getAllStudents);
  ```

We're now left with just a reference to the function object here in the router. The implementation of the functions are all in the controller.

## Rinse and Repeat
Repeat the steps for [moving database functions to models](#database-to-model) and [route callback to controller](#split-route-controller) for the other routes.

As a guide, you can use the names for the `module.exports` in each file

Route       | Controller              | Model
------------|-------------------------|------------------------------
`/add`      | `addStudent(req, res)`  | `create(name, id, img, next)`
`/search`   | `search(req, res)`      | `query(query, sort, next)`
`/:id/edit` | `editStudent(req, res)` | `updateOne(doc, next)`

Make sure to return to the controller what it **needs**. Take a look at the `res.send()` or `res.render()` parameters.

## The End
You've successfully refactored the code (partially) to follow the MVC standards. Tedious? Yes. Confusing? A bit (too many callbacks!).

But now, whenever you start a new web application project, you know how to structure the code so you don't have to refactor and deal with spaghetti code.
