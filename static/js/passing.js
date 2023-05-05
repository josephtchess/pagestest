const element = document.getElementById("u1");

function passing() {
  fetch(`${window.origin}/level`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(element.innerHTML),
    cache: "no-cache",
    headers: new Headers({
      "content-type": "application/json",
    }),
  });
}
passing();
