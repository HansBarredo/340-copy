document.querySelectorAll('.favorite-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const invId = btn.dataset.invId;

    try {
      const response = await fetch(`/favorites/toggle/${invId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (data.status === 'removed') {
      
        const card = btn.closest('.favorite-card');
        card?.remove();

        if (document.querySelectorAll('.favorite-card').length === 0) {
          const container = document.querySelector('.grid-container') || document.body;
          container.innerHTML = "<p class='notice'>You don't have any favorites yet.</p>";
        }
      } else if (data.status === 'added') {
        btn.textContent = '❤️ Remove Favorite';
      }

    } catch (err) {
      console.error("Error sending favorite toggle request:", err);
    }
  });
});
