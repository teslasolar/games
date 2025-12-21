// Story data - main container
// Individual story parts are loaded from separate files
const STORY = {};

// Levels configuration
const LEVELS = ['Noob', 'Beginner', 'Developer', 'Hacker', 'Master'];

function getLevel(xp) {
    if (xp < 20) return 0;
    if (xp < 40) return 1;
    if (xp < 60) return 2;
    if (xp < 80) return 3;
    return 4;
}
