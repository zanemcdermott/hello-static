document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup");
  const openBtn = document.getElementById("openPopupBtn");
  const closeBtn = document.getElementById("closePopupBtn");

  openBtn.addEventListener("click", () => {
    popup.style.display = "flex";   // show popup
  });

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";   // hide popup
  });

  // Close if you click outside the popup box
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
});
