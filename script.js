// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    // Save preference
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Check for saved theme preference
const savedTheme = localStorage.getItem('darkMode');
if (savedTheme === 'true') {
    document.body.classList.add('dark-mode');
}

// Check system preference on load
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && savedTheme === null) {
    document.body.classList.add('dark-mode');
}

// Array of cumulative heights for each floor (to be filled in)
const FLOOR_HEIGHTS = [ // NUMBER IS START OF THE FLOOR
    0,      // Ground floor (1)
    40,     // Floor 2 height
    80,     // Floor 3 height
    120,    // Floor 4 height
    160,    // Floor 5 height
    200,    // Floor 6 height
    240,    // Floor 7 height
    280,    // Floor 8 height
    320,    // Floor 9 height (Sedri)
    360,    // Floor 10 height (DoggieBoo)
    400,    // Floor 11 height (LadyLinQ)
    480,    // Floor 12 height (SeaShark)
    520,    // Floor 13 height (PM477)
    580,    // Floor 14 height (Van Thias)
    620,    // Floor 15 height (Rosati)
    680,    // Floor 16 height (Nether Bat)
    720,    // Floor 17 height (Rock Monster)
    760,    // Floor 18 height (COUQ)
    840,    // Floor 19 height (Another User)
    880,    // Floor 20 height (Skarbels)
    900,    // Floor 21 Height (Roof)
];

function calculateFloor(height) {
    // Find the highest floor where the player's height exceeds the floor's base height
    for (let i = FLOOR_HEIGHTS.length - 1; i >= 0; i--) {
        if (height >= FLOOR_HEIGHTS[i]) {
            return i+1;
        }
    }
    return 0; // Ground floor if below all heights
}

function getPositionChange(playerId, currentPosition) {
    const previousPositions = JSON.parse(localStorage.getItem('previousPositions') || '{}');
    const previousPosition = previousPositions[playerId];
    
    if (previousPosition === undefined) {
        return { text: 'New', class: '' };
    }
    
    const change = previousPosition - currentPosition;
    if (change > 0) {
        return { text: `↑${change}`, class: 'position-up' };
    } else if (change < 0) {
        return { text: `↓${Math.abs(change)}`, class: 'position-down' };
    }
    return { text: '━', class: '' };
}

function updateStoredPositions(players) {
    const positions = {};
    players.forEach((player, index) => {
        positions[player.name] = index + 1;
    });
    localStorage.setItem('previousPositions', JSON.stringify(positions));
}

async function fetchLeaderboard() {
    try {
        const response = await fetch('https://coffeecupstudios.org/api/players');
        const data = await response.json();
        
        // Sort players by maxHeight in descending order
        const sortedPlayers = data.sort((a, b) => b.maxHeight - a.maxHeight);
        
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = ''; // Clear loading message
        
        sortedPlayers.forEach((player, index) => {
            const row = document.createElement('tr');
            
            // Format the date
            const lastUpdated = new Date(player.updatedAt);
            const dateString = lastUpdated.toLocaleDateString() + ' ' + 
                             lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Format the height with 2 decimal places
            const formattedHeight = ((player.maxHeight / 100) - 131.7515).toFixed(1);
            
            // Calculate which floor the player is on
            const floorNumber = calculateFloor(parseFloat(formattedHeight));
            
            // Calculate completion percentage (1000 is max height)
            const completionPercentage = ((formattedHeight / 1000) * 100).toFixed(1);
            
            const positionChange = getPositionChange(player.name, index + 1);
            
            row.innerHTML = `
                <td class="rank">${index + 1}
                    <span class="position-change ${positionChange.class}">${positionChange.text}</span>
                </td>
                <td>${player.name}</td>
                <td class="height">${formattedHeight}m</td>
                <td class="height">${floorNumber}</td>
                <td class="height">${completionPercentage}%</td>
                <td>${dateString}</td>
            `;
            
            tbody.appendChild(row);
        });

        // Store current positions for next update
        updateStoredPositions(sortedPlayers);
    } catch (error) {
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="error">
                    Error loading leaderboard data. Please try again later.
                </td>
            </tr>
        `;
        console.error('Error fetching leaderboard:', error);
    }
}

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', () => {
    // Fetch data immediately when page loads
    fetchLeaderboard();

    // Refresh data every 60 seconds
    //setInterval(fetchLeaderboard, 60000);
});