async function fetchUpgrades() {
    try {
        const response = await fetch('js/upgrades.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const upgrade = await response.json();

        displayUpgradeCards(upgrade);
    } catch (error) {
        console.error('Error fetching upgrades:', error);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    fetchUpgrades();
});

function displayUpgradeCards(upgrades) {
    const container = document.getElementById('cards-container');
    if (!container) {
        console.error("Error: 'cards-container' element not found.");
        return;
    }

    container.innerHTML = '';

    upgrades.forEach(upgrade => {
        const card = document.createElement('div');
        card.classList.add('upgrade-card'); 
        card.innerHTML = `
            <img src="${upgrade.image_url}" alt="${upgrade.description}">
            <a href="#">${upgrade.upgrade}<a>
        `;
        container.appendChild(card);
    });
}