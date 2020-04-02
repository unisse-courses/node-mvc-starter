$(document).ready(function() {
  // Adds the student to the parent div given
  function addStudentDiv(item, parentDiv) {
    var rowDiv = document.createElement('div');
    var imgCol = document.createElement('div');
    var nameCol = document.createElement('div');

    var imgWrapper = document.createElement('p');
    var img = document.createElement('img');
    var nameHeading = document.createElement('p');
    var idnum = document.createElement('p');

    $(rowDiv).addClass("row student");
    $(imgCol).addClass("col s2");
    $(nameCol).addClass("col s10");

    $(img).attr("src", item.img);
    $(nameHeading).text(item.name);
    $(nameHeading).addClass("studentname");
    $(idnum).text(item.id);

    $(imgWrapper).append(img);
    imgCol.append(imgWrapper);

    nameCol.append(nameHeading);
    nameCol.append(idnum);

    rowDiv.append(imgCol);
    rowDiv.append(nameCol);

    parentDiv.append(rowDiv);
  }


  // POST called
  $('#addStudent').click(function() {
    // Get the data from the form
    var name = $('#name').val();
    var idnum = $('#idnum').val();
    var gender = $("input[name='gender']:checked").val();

    var newStudent = {
      name: name,
      id: idnum,
      gender: gender
    };

    $.post('/students/add', newStudent, function(data, status) {
      console.log(data);

      if (data.success) {
        $('#msg').text(data.message);
        $('#msg').removeClass('fail');
        $('#msg').addClass('success');

        $('#name').val('');
        $('#idnum').val('');
        $("input[name='gender']:checked").prop("checked", false);
      } else {
        $('#msg').text(data.message);
        $('#msg').removeClass('success');
        $('#msg').addClass('fail');
      }

    });
  });

  // #findStudent POST call
  $('#findStudent').click(function() {
    // Get the data from the form
    var name = $('#searchName').val();

    $.post('/', { name: name }, function(data, status) {
      console.log(data);

      var studentListContainer = $('#studentList');
      studentListContainer.empty(); // clear children every time (refresh results)

      data.forEach((item, i) => {
        addStudentDiv(item, studentListContainer);
      });

    });
  });
});
