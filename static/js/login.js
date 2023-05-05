const element = document.getElementById("u1");

function myFunction() {
  var name = "";
  do {
    name = prompt("Enter Username", "");
    console.log(name.length);
  } while (
    name.length < 4 ||
    name.length > 20 ||
    !isNaN(name) ||
    name === null
  );
  console.log(name.length);
  element.innerHTML = name;
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
