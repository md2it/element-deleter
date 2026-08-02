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
var SHIELD_CHECK = lucideUiIcon(shield_check_default);
var SQUARE_CHECK = lucideUiIcon(square_check_default);
var TERMINAL = lucideUiIcon(terminal_default);
var TRASH_2 = lucideUiIcon(trash_2_default);
var UNDO_2 = lucideUiIcon(undo_2_default);

export { stripComment, lucideUiIcon, ARROW_UP, CHART_COLUMN_INCREASING, CHEVRON_LEFT, CHEVRON_RIGHT, CHEVRONS_LEFT, CHEVRONS_RIGHT, CIRCLE_POWER, COG, COPY, EXTERNAL_LINK, FILE_DOWN, FILES, GIT_FORK, HEART, HISTORY, IMAGE_DOWN, IMAGES, INFO, KEYBOARD, PIN, PLAY, PUZZLE, ROTATE_CW, SETTINGS, SHIELD_CHECK, SQUARE_CHECK, TERMINAL, TRASH_2, UNDO_2 };
