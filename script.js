import {formatHeight, calculateFloor, formatDate, toggleTheme} from "./utils.js";

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
        
        const active_runs_response = await fetch('https://coffeecupstudios.org/api/runs/active');
        const active_runs_data = await active_runs_response.json();

        // Build a quick lookup map for players currently in a run (lowercased name => maxHeight)
        const activeMap = new Map();
        if (Array.isArray(active_runs_data)) {
            active_runs_data.forEach(run => {
                if (run && run.playerName) {
                    activeMap.set(run.playerName, run.maxHeight);
                }
            });
        }

        // Sort players by maxHeight in descending order
        const sortedPlayers = data.sort((a, b) => b.maxHeight - a.maxHeight);

        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = ''; // Clear loading message

        sortedPlayers.forEach((player, index) => {
            const row = document.createElement('tr');
            
            // Format the date
            const dateString = formatDate(player.updatedAt);
            
            // Format the height with 1 decimal place (project-specific conversion)
            const formattedHeight = formatHeight(player.maxHeight);

            // Current live height if the player is currently in a run
            const currentRaw = activeMap.get(player.name);

            const formattedCurrent = (currentRaw != null && !Number.isNaN(currentRaw)) ? `${formatHeight(currentRaw)}m` : '-';

            // Calculate which floor the player is on (use numeric value)
            const floorNumber = calculateFloor(formattedHeight);

            // Calculate completion percentage (1000 is max height)
            const completionPercentage = ((formattedHeight / 1000) * 100).toFixed(1);
            
            const positionChange = getPositionChange(player.name, index + 1);

            
            
            row.innerHTML = `
                <td class="rank">${index + 1}
                    <span class="position-change ${positionChange.class}">${positionChange.text}</span>
                </td>
                <td>${player.name}</td>
                <td class="height">${formattedHeight}m</td>
                <td class="height">${formattedCurrent}</td>
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
                <td colspan="7" class="error">
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