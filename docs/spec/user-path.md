# USER PATHS

U = User
E = Extension

### Main flow

1. U performs one of the following:
   - Clicks the extension icon with the left mouse button
   - Presses `Ctrl+Shift+X`→`D` (on Mac, `Cmd+Shift+X`→`D`)
2. E starts
3. U hovers over a page element
4. E highlights the corresponding DOM element
5. U clicks the element
6. E performs all of the following:
   - Removes the element and all its children
   - Shows a deletion notification
   - Highlights another element, if one exists under the cursor
7. U performs one of the following:
   - Clicks the extension icon again with the left mouse button
   - Presses `Ctrl+Shift+X`→`D` (on Mac, `Cmd+Shift+X`→`D`)
   - Presses `Esc`
8. E stops

### Multiple deletions

- Steps 3-6 can be repeated any number of times before the extension is stopped

### Restore

7a. U clicks the restore button in the notification
8a. E restores the related element

### Alternative restore

7b. U presses `Cmd+Z` / `Ctrl+Z` (depending on the operating system)
8b. E restores the related element

### Multiple restores

- Steps 7b-8b can be repeated any number of times before the extension is stopped

### Delete an element with the right mouse button

> [!NOTE]
> Numbering is not related to the flows above.

0. E is not running
1. U right-clicks an element
2. U selects the extension from the context menu
3. E removes the element

### Welcome window

> [!NOTE]
> Numbering is not related to the flows above.

1. U installs the extension
2. E detects the user's language
3. E opens a welcome window with:
   - An option to change the language
   - A recommendation and instructions for pinning the extension
   - Information about its capabilities
4. U pins the extension to the browser toolbar

### Other capabilities

- Open settings and the "About" section:
   - From a button in the notification
   - From the extension context menu
- If U attempts to use the extension on a page where it is unavailable, E does not operate and clearly notifies U