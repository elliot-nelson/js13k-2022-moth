// Constants

export const TITLE = 'WIZARD WITH A SHOTGUN';

// Spritesheet URI (produced during gulp build)
export const SPRITESHEET_URI = 'sprites.png';

// The game's desired dimensions in pixels - the actual dimensions can be adjusted
// slightly by the Viewport module.
export const TARGET_GAME_WIDTH = 240; //320; //480;
export const TARGET_GAME_HEIGHT = 135; //180; //270;

// Size in pixels of each map tile
export const TILE_SIZE   = 8;

export const INPUT_MODE_TOUCH = 1;
export const INPUT_MODE_MOUSE = 2;

// Tiles
export const TILE_FLOOR = 1;
export const TILE_WALL  = 8;
export const TILE_WALL_TOP = 9;
export const TILE_WALL_RIGHT = 10;
export const TILE_WALL_BOTTOM = 11;
export const TILE_WALL_LEFT = 12;
export const TILE_CORNER_OUTER = 13;
export const TILE_CORNER_INNER = 14;
export const TILE_DYNAMIC = 20;

export const TILE_DESCRIPTIONS = [
    'CAVE FLOOR',
    'CAVE FLOOR',
    'CAVE FLOOR',
    '',
    '',
    '',
    'DOOM PIT',
    'DOOM PIT'
];


// Handy IDs to represent the different dialog boxes / speech bubbles that can
// appear during the game.
export const DIALOG_START_A    = 0;
export const DIALOG_START_B    = 1;
export const DIALOG_HINT_1     = 2;
export const DIALOG_HINT_2     = 3;
export const DIALOG_HINT_3     = 4;
export const DIALOG_HINT_DEATH = 5;
export const DIALOG_HINT_E1    = 6;
export const DIALOG_HINT_E2    = 7;
export const DIALOG_HINT_DMG   = 8;

// Some pre-calculated radian values
export const R0          =   0;
export const R6          =   6 * Math.PI / 180;
export const R20         =  20 * Math.PI / 180;
export const R45         =  45 * Math.PI / 180;
export const R70         =  70 * Math.PI / 180;
export const R72         =  72 * Math.PI / 180;
export const R80         =  80 * Math.PI / 180;
export const R90         =  90 * Math.PI / 180;
export const R180        = 180 * Math.PI / 180;
export const R270        = 270 * Math.PI / 180;
export const R360        = 360 * Math.PI / 180;

// Moths must be within this number of pixels of their target
// to "act" (construct, gather, etc.).
export const ACTION_DISTANCE = 6;

// Entity behaviors (states)
export const SPAWN     = 1;
export const IDLE      = 2;
export const MOVE      = 3;
export const PICKUP    = 4;
export const DROPOFF   = 5;
export const CONSTRUCT = 6;
export const DEAD      = 9;

// Additional behaviors (enemies)
export const CHASE     = 11;
export const ATTACK    = 12;

// Additional behaviors (buildings)
export const WIP       = 21;
export const ONLINE    = 22;
