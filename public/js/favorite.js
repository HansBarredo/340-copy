document.querySelectorAll('.favorite-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const invId = btn.dataset.invId;

    try {
      const response = await fetch(`/favorites/toggle/${invId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ include cookies (for JWT)
      });

      const data = await response.json();
      console.log("Server response:", data);
    } catch (err) {
      console.error("Error sending favorite toggle request:", err);
    }
  });
});
