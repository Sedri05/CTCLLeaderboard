export function formatHeight(height){
    return ((height / 100) - 132.1).toFixed(1);
}

export const FLOOR_HEIGHTS = [ // NUMBER IS START OF THE FLOOR
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
    700,    // Floor 16 height (Nether Bat)
    740,    // Floor 17 height (Rock Monster)
    780,    // Floor 18 height (COUQ)
    911,    // Floor 19 height (Another User)
    940,    // Floor 20 height (Skarbels)
    980,    // Floor 21 Height (Roof)
];

export function calculateFloor(height) {
    // Find the highest floor where the player's height exceeds the floor's base height
    for (let i = FLOOR_HEIGHTS.length - 1; i >= 0; i--) {
        if (height >= FLOOR_HEIGHTS[i]) {
            return i+1;
        }
    }
    return 0; // Ground floor if below all heights
}

export function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    // Save preference
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

export function formatDate(iso) {
    if (!iso) return '-';
    try {
        const d = new Date(iso);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return iso;
    }
}

// Check for saved theme preference
const savedTheme = localStorage.getItem('darkMode');
if (savedTheme === 'true') {
    document.body.classList.add('dark-mode');
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && savedTheme === null) {
    document.body.classList.add('dark-mode');
}

if (typeof window !== 'undefined') {
    window.toggleTheme = toggleTheme;
}