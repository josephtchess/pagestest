const element = document.getElementById("u1");

function myFunction() {
  var name;
  do {
    name = prompt("Enter Username", "");
  } while (name.length < 4 || name.length > 20);
  console.log(name.length);
  element.innerHTML = "The Current User is: " + name;
  console.log(name);

  fetch(`${window.origin}/`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(name),
    cache: "no-cache",
    headers: new Headers({
      "content-type": "application/json",
    }),
  });
}
myFunction();
