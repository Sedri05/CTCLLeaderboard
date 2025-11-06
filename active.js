import {formatHeight, formatDate, calculateFloor, toggleTheme} from "./utils.js";

async function fetchActiveRuns() {
    const tbody = document.getElementById('leaderboardBody');
    try {
        const resp = await fetch('https://coffeecupstudios.org/api/runs/active');
        const runs = await resp.json();

        tbody.innerHTML = '';

        if (!Array.isArray(runs) || runs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="loading">No active runs right now.</td>
                </tr>
            `;
            return;
        }

        runs.sort((a, b) => {
            return b.maxHeight - a.maxHeight
        });

        // Helper: get height change text/class since last load (stored in localStorage)
        function getHeightChange(name, currentRaw) {
            try {
                const stored = JSON.parse(localStorage.getItem('previousActiveHeights') || '{}');
                const prevRaw = stored[name];
                if (prevRaw === undefined) {
                    return { text: 'New', class: '' };
                }
                // Use formatted meters for human-readable diff (same conversion used elsewhere)
                const curM = parseFloat(formatHeight(currentRaw));
                const prevM = parseFloat(formatHeight(prevRaw));
                if (Number.isNaN(curM) || Number.isNaN(prevM)) return { text: '━', class: '' };
                const diff = +(curM - prevM).toFixed(1);
                if (diff > 0) return { text: `↑${diff}m`, class: 'position-up' };
                if (diff < 0) return { text: `↓${Math.abs(diff)}m`, class: 'position-down' };
                return { text: '━', class: '' };
            } catch (e) {
                return { text: '━', class: '' };
            }
        }

        function updateStoredHeights(runsArray) {
            try {
                const map = {};
                runsArray.forEach(r => {
                    map[r.playerName] = r.maxHeight;
                });
                localStorage.setItem('previousActiveHeights', JSON.stringify(map));
            } catch (e) {
                // ignore storage errors
            }
        }

        runs.forEach(run => {
            const row = document.createElement('tr');
            
            const formattedHeight = formatHeight(run.maxHeight);
            const currentHeight = `${formattedHeight}m`;
            // Height change since last load
            const heightChange = getHeightChange(run.playerName, run.maxHeight);
            // Calculate floor and completion (mirrors leaderboard logic)
            const floorNumber = calculateFloor(formattedHeight);
            const completionPercentage = Math.max(0, ((formattedHeight / 1000) * 100).toFixed(1));
            const timeElapsed = Date.now() - new Date(run.startedAt).getTime();
            const secondsElapsed = Math.floor(timeElapsed / 1000);
            const minutesElapsed = Math.floor(secondsElapsed / 60);
            const formattedElapsed = `${minutesElapsed}m ${secondsElapsed % 60}s`;

            row.innerHTML = `
                <td>${run.playerName}</td>
                <td class="height">${currentHeight} <span class="position-change ${heightChange.class}">${heightChange.text}</span></td>
                <td class="height">${floorNumber}</td>
                <td class="height">${completionPercentage}%</td>
                <td>${formattedElapsed}</td>
            `;
            tbody.appendChild(row);
        });

        // Persist current heights for next load comparison
        try {
            updateStoredHeights(runs);
        } catch (e) {
            // ignore
        }
    } catch (err) {
        console.error('Error fetching active runs', err);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="error">Error loading active runs. Try again later.</td>
            </tr>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchActiveRuns();
    // Refresh every 20 seconds for active runs
    setInterval(fetchActiveRuns, 60000);
});