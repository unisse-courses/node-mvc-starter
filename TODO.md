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
