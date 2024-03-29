This is a patched fork of the abandoned "eBay Seller Location" script:
https://greasyfork.org/en/scripts/410587-ebay-seller-location

It displays the location of the eBay seller on eBay product pages (in the info box on the right) and on search results.

GitHub repository: https://github.com/sonofevil/eBaySellerLocationFork

Changes to the original script (v0.1):

v1.2
- Skips requests for already known sellers.
- Visible counter in bottom right corner informs about script progress.

v1.1
- Completely reworked the code to load location info from html data after the old json API page was removed.
- Search results loop is now completely asynchronous. No more simultaneous GET requests.
- If present, seller location info is grabbed from item pages to avoid unnecessary requests.
- Massive code cleanup.
- Cures depression and removes pimples.
- Todo: Add visible counter for search results processing.

v1.0
- Optimized code.
- Various fixes.
- Updated selectors.
- Now works on search results internationally.
- Added delay to search results loop to prevent rate limiting.

v0.4
- I don't remember.

v0.3
- Script now also works on search results.

v0.2
- Updated info box selector in line 34 to reflect changes to eBay site code.
- Updated item-id selector in line 24 to reflect changes to eBay site code.
- Changed url scope to hopefully cover all regional eBay domains.
