const b1 = document.getElementById("sel1");
const b2 = document.getElementById("sel2");
const b3 = document.getElementById("sel3");
const currUser = document.getElementById("u1").innerHTML;
console.log("user is " + currUser);

let level = 1;

function updateButtons() {
  console.log("level is", level);
  if (level == 1) {
    b2.disabled = true;
    b2.innerHTML = "What is ";
    b3.disabled = true;
    b3.innerHTML = "dis";
  } else if (level == 2) {
    b3.disabled = true;
    b3.innerHTML = "dis";
  }
}

function getLevel() {
  fetch(`/getLevel/${currUser}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (text) {
      console.log("GET response:");
      console.log(text);
      level = text;
    });
}

getLevel();
updateButtons();
