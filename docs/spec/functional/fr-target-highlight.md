# Highlighting the target element

- Highlight the deepest DOM node under the cursor, even if the parent element is transparent and the same size
- Constraints:
   - Highlighting does not change the layout
   - Elements of this extension are not highlighted
- The highlight frame follows the element's shape, including complex shapes
- Tag information
   - Disableable option
   - The bottom-left corner of the label aligns with the top-left corner of the highlight frame
   - Displays the first matching option:
      1. `tag#id:pseudo-class` if ID and pseudo-class exist
      2. `tag#id` if ID exists
      3. `tag.class:pseudo-class` if class (all classes) and pseudo-class exist
      4. `tag.class` if class exists (all classes)
      5. `tag`
- iFrame has a separate handler
