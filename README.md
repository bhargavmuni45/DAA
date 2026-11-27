# Stockroom — Warehouse Inventory Optimizer

A responsive, browser-based Algorithm Explorer for the 0/1 Knapsack version of warehouse inventory selection.

## Files
- `index.html` — page structure and content
- `style.css` — responsive monochrome design and theme variables
- `script.js` — input validation and four algorithm implementations

## Run locally
1. Extract the ZIP file.
2. Open the folder in VS Code.
3. Open `index.html` with Live Server, or double-click `index.html` to open it in a browser.
4.karthikvarma bhargav siva 
## Problem definition
Given a set of products, each with a positive integer storage weight and a non-negative integer value, select each product zero or one time. Maximize the sum of selected product values without exceeding the warehouse's storage capacity.

This is the 0/1 Knapsack Problem.

## Algorithms
- Brute force: checks all subsets; O(2^n) time.
- Greedy: sorts by value-to-weight ratio; O(n log n) time. This is a heuristic and is not guaranteed to be optimal.
- Dynamic programming: O(nW) time and O(nW) space, where W is the integer capacity. This is pseudo-polynomial.
- Backtracking: explores include/exclude decisions and prunes overweight branches; O(2^n) worst-case time and O(n) recursion space.

All approaches use the same product list, capacity, and objective. The DP result is used as the optimal reference when labeling results.

## Theme
Appearance is set to System by default and follows the operating system preference. Users can also select Light or Dark manually. Warehouse photography remains in its original colour in both themes.

## Notes
- This is an educational prototype, not a live warehouse-management or logistics system.
- The execution times are browser measurements and can vary by device and browser.
- External Google Fonts and Unsplash photographs require an internet connection.
