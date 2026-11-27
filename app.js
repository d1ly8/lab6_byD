const PROJECT = {
  enrollmentLastFour: "5039",
  passwordMin: 7,
  nameMax: 25,
  studentCount: 5,
  myMarks: 68,
  passMark: 49
};

const registrationForm = document.querySelector("#registration-form");

function validateField(field) {
  const value = field.value.trim();
  let message = "";

  if (value === "") {
    message = "This field is required.";
  }

  else if (field.name === "name" && value.length > PROJECT.nameMax) {
    message = "Name must be " + PROJECT.nameMax + " characters or fewer.";
  }

  else if (
    field.name === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    message = "Please enter a valid email address.";
  }

  else if (field.name === "phone" && !/^\d{9}$/.test(value)) {
    message = "Phone number must contain exactly 9 digits.";
  }

  else if (
    field.name === "password" &&
    value.length < PROJECT.passwordMin
  ) {
    message = "Password must contain at least " +
      PROJECT.passwordMin + " characters.";
  }

  else if (
    field.name === "confirm-password" &&
    value !== document.querySelector("#password").value
  ) {
    message = "Passwords do not match.";
  }

  const errorElement = document.querySelector("#" + field.id + "-error");

  if (errorElement !== null) {
    errorElement.textContent = message;
  }

  field.classList.toggle("invalid", message !== "");

  field.setAttribute(
    "aria-invalid",
    message !== "" ? "true" : "false"
  );

  return message === "";
}

function showFormErrors(errors) {
  const errorList = document.querySelector("#form-errors");

  errorList.replaceChildren();

  errors.forEach(function(message) {
    const item = document.createElement("li");

    item.textContent = message;

    errorList.appendChild(item);
  });
}

if (registrationForm !== null) {

  const fields = Array.from(
    registrationForm.querySelectorAll("input, select")
  );

  const nameInput = document.querySelector("#name");
  const nameCounter = document.querySelector("#name-counter");

  const citySelect = document.querySelector("#city");
  const cityMessage = document.querySelector("#city-message");


  fields.forEach(function(field) {

    field.addEventListener("blur", function() {
      validateField(field);
    });

    field.addEventListener("input", function() {

      if (field.classList.contains("invalid")) {
        validateField(field);
      }

    });

    field.addEventListener("change", function() {

      if (field.tagName === "SELECT") {
        validateField(field);
      }

    });

  });


  nameInput.addEventListener("input", function() {

    const remaining =
      PROJECT.nameMax - nameInput.value.length;

    nameCounter.textContent =
      remaining + " characters left";

  });

  citySelect.addEventListener("change", function() {

    if (citySelect.value === "") {

      cityMessage.textContent =
        "You have not chosen a city yet.";

    } else {

      cityMessage.textContent =
        "You chose " + citySelect.value + ".";

    }

  });

  registrationForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const errors = [];

    fields.forEach(function(field) {

      if (!validateField(field)) {

        const errorElement = document.querySelector(
          "#" + field.id + "-error"
        );

        const label = field.labels[0].textContent;

        errors.push(
          label + ": " + errorElement.textContent
        );

      }

    });

    showFormErrors(errors);


    if (errors.length === 0) {

      const studentName = nameInput.value.trim();

      const accepted = confirm(
        'Register "' + studentName + '"?'
      );

      if (accepted) {

        window.location.href =
          "board.html?name=" +
          encodeURIComponent(studentName);

      }

    }

  });

}


function grade(marks) {

  if (marks < PROJECT.passMark) {

    return "Fail";

  }

  else if (marks <= 75) {

    return "Pass";

  }

  return "Distinction";

}

async function loadStudents() {

  const marksBody = document.querySelector("#marks-body");

  const boardMessage =
    document.querySelector("#board-message");

  if (marksBody === null || boardMessage === null) {
    return;
  }

  try {

    const response = await fetch("students.json");

    if (!response.ok) {

      throw new Error(
        "Could not load students.json. HTTP status: " +
        response.status
      );

    }

    const students = await response.json();


    if (
      !Array.isArray(students) ||
      students.length !== PROJECT.studentCount
    ) {

      throw new Error(
        "The JSON file must contain exactly " +
        PROJECT.studentCount +
        " students."
      );

    }


    const sortSelect =
      document.querySelector("#sort-select");



    function renderTable() {

      const sortedStudents = students.slice();



      if (sortSelect.value === "marks") {

        sortedStudents.sort(function(a, b) {

          return b.marks - a.marks;

        });

      }

      else {

        sortedStudents.sort(function(a, b) {

          return a.name.localeCompare(b.name);

        });

      }


      marksBody.replaceChildren();


      sortedStudents.forEach(function(student, index) {

        const row = document.createElement("tr");

        const values = [
          String(index + 1),
          student.name,
          student.city,
          String(student.marks),
          grade(student.marks)
        ];


        values.forEach(function(value) {

          const cell = document.createElement("td");

          cell.textContent = value;

          row.appendChild(cell);

        });

        marksBody.appendChild(row);

      });

    }



    sortSelect.addEventListener("change", renderTable);

    renderTable();

    boardMessage.textContent =
      "Loaded " + students.length + " student records.";

  }

  catch(error) {

    boardMessage.textContent =
      "Unable to load student records: " + error.message;

    console.error(error);

  }

}

const welcomeHeading = document.querySelector("#welcome");

if (welcomeHeading !== null) {


  const params =
    new URLSearchParams(window.location.search);

  const studentName = params.get("name");

  if (studentName !== null && studentName.trim() !== "") {

    welcomeHeading.textContent =
      "Welcome, " + studentName + "!";

  }



  const loadTime = document.querySelector("#load-time");

  loadTime.textContent =
    "Page loaded at: " +
    new Date().toLocaleTimeString();



  const backButton =
    document.querySelector("#back-button");

  backButton.addEventListener("click", function() {

    history.back();

  });


  loadStudents();

}



console.log(
  "Student Portal project enrollment: " +
  PROJECT.enrollmentLastFour
);
