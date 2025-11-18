document.addEventListener("DOMContentloaded", () => {
 
  setTimeout(() => {

    // 1 - ضيف كلاس fade-out على الكونتينر بتاع الانيميشن
    document.querySelector(".logo-container").classList.add("fade-out");

    // 2 - استنى مدة fade قبل التحويل
    setTimeout(() => {
      window.location.href = "index.html";
    }, 800); // لازم نفس مدة الـ transition اللي في الـ CSS

  }, 3000); // وقت الانيميشن قبل fade-out


  const parts = document.querySelectorAll(".logo-part");

  let delay = 500;
  parts.forEach((part) => {
    setTimeout(() => {
      part.classList.add("show");
    }, delay);
    delay += 800; 

});

  },);

