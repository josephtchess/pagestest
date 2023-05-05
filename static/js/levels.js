const b1 = document.getElementById("sel1");
const b2 = document.getElementById("sel2");
const b3 = document.getElementById("sel3");
const currUser = document.getElementById("u1").innerHTML;
console.log("user is " + currUser);

function updateButtons() {
  fetch(`/getLevel/${currUser}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (text) {
      console.log("GET response:");
      console.log(text);
      let level = text;
      console.log("level is", level);
      if (level == 1) {
        b2.disabled = true;
        b2.innerHTML = "Level Two LOCKED";
        b3.disabled = true;
        b3.innerHTML = "Level Three LOCKED";
      } else if (level == 2) {
        b3.disabled = true;
        b3.innerHTML = "Level Three LOCKED";
      }
    });
}
updateButtons();
