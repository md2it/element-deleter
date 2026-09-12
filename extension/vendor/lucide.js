import { arrow_up_default, chart_column_increasing_default, chevron_left_default, chevron_right_default, chevrons_left_default, chevrons_right_default, circle_power_default, cog_default, copy_default, external_link_default, file_down_default, files_default, git_fork_default, heart_default, history_default, image_down_default, images_default, info_default, keyboard_default, pin_default, play_default, puzzle_default, rotate_cw_default, settings_default, shield_check_default, square_check_default, terminal_default, trash_2_default, undo_2_default } from "./lucide/index.js";

function stripComment(svg) {
  return svg.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
}

function lucideUiIcon(raw) {
  return stripComment(raw);
}

var ARROW_UP = lucideUiIcon(arrow_up_default);
var CHART_COLUMN_INCREASING = lucideUiIcon(chart_column_increasing_default);
var CHEVRON_LEFT = lucideUiIcon(chevron_left_default);
var CHEVRON_RIGHT = lucideUiIcon(chevron_right_default);
var CHEVRONS_LEFT = lucideUiIcon(chevrons_left_default);
var CHEVRONS_RIGHT = lucideUiIcon(chevrons_right_default);
var CIRCLE_POWER = lucideUiIcon(circle_power_default);
var COG = lucideUiIcon(cog_default);
var COPY = lucideUiIcon(copy_default);
var EXTERNAL_LINK = lucideUiIcon(external_link_default);
var FILE_DOWN = lucideUiIcon(file_down_default);
var FILES = lucideUiIcon(files_default);
var GIT_FORK = lucideUiIcon(git_fork_default);
var HEART = lucideUiIcon(heart_default);
var HEART_HANDSHAKE = lucideUiIcon(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-handshake"><path d="M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762"/></svg>`);
var HISTORY = lucideUiIcon(history_default);
var IMAGE_DOWN = lucideUiIcon(image_down_default);
var IMAGES = lucideUiIcon(images_default);
var INFO = lucideUiIcon(info_default);
var KEYBOARD = lucideUiIcon(keyboard_default);
var PIN = lucideUiIcon(pin_default);
var PLAY = lucideUiIcon(play_default);
var PUZZLE = lucideUiIcon(puzzle_default);
var ROTATE_CW = lucideUiIcon(rotate_cw_default);
var SETTINGS = lucideUiIcon(settings_default);
var SHARE = lucideUiIcon(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share"><path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12"/></svg>`);
var SHIELD_CHECK = lucideUiIcon(shield_check_default);
var SQUARE_CHECK = lucideUiIcon(square_check_default);
var TERMINAL = lucideUiIcon(terminal_default);
var TRASH_2 = lucideUiIcon(trash_2_default);
var UNDO_2 = lucideUiIcon(undo_2_default);

export { stripComment, lucideUiIcon, ARROW_UP, CHART_COLUMN_INCREASING, CHEVRON_LEFT, CHEVRON_RIGHT, CHEVRONS_LEFT, CHEVRONS_RIGHT, CIRCLE_POWER, COG, COPY, EXTERNAL_LINK, FILE_DOWN, FILES, GIT_FORK, HEART, HEART_HANDSHAKE, HISTORY, IMAGE_DOWN, IMAGES, INFO, KEYBOARD, PIN, PLAY, PUZZLE, ROTATE_CW, SETTINGS, SHARE, SHIELD_CHECK, SQUARE_CHECK, TERMINAL, TRASH_2, UNDO_2 };
