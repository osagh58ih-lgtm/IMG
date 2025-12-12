window.addEventListener("load", () => {
 
  setTimeout(() => {

    document.querySelector(".logo-container").classList.add("fade-out");

    setTimeout(() => {
      window.location.href = "home.html";
    }, 800); 

  }, 3000); 


  const parts = document.querySelectorAll(".logo-part");

  let delay = 500;
  parts.forEach((part) => {
    setTimeout(() => {
      part.classList.add("show");
    }, delay);
    delay += 800; 

});

  },);

