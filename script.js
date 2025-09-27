document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("popup");
  const openBtn = document.getElementById("openPopupBtn");
  const closeBtn = document.getElementById("closePopupBtn");

  // Show popup
  openBtn.addEventListener("click", () => {
    popup.style.display = "flex";   // now visible
  });

  // Hide popup
  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";   // hide again
  });

  // Hide if clicking the background (outside the box)
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
});
