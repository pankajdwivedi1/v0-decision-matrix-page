# Enhanced Excel Import - Multiple Tables Support

## What's New

The Excel import dialog now supports **sheets with multiple tables**! You can now:

### ✅ **View Entire Sheet**
- See **all rows and columns** from your Excel sheet
- **Scroll through** the complete data to find your table
- **No initial selection** - Start with a clean view

### ✅ **Sheet Information Display**
When you upload an Excel file, you'll see:
```
📊 Excel Sheet Information:
   Total Rows: 50
   Total Columns: 12
```

This helps you understand the size of your sheet before selecting data.

### ✅ **Updated Instructions**
New step-by-step guide:
```
📋 How to select data:
1️⃣ Scroll through the sheet to find your table
2️⃣ Click on the first cell (top-left corner)
3️⃣ Drag to the last cell (bottom-right corner)
4️⃣ Include: Headers, Max/Min, Weights, and Data rows
```

## Example: Sheet with Multiple Tables

### Scenario:
Your Excel sheet contains:
```
Rows 1-10:   Table 1 (Project Alpha)
Rows 12-25:  Table 2 (Project Beta)  ← You want this one
Rows 27-40:  Table 3 (Project Gamma)
```

### How to Use:

1. **Upload Excel File**
   - Click "Upload Excel" button
   - Select your Excel file

2. **View Complete Sheet**
   - Dialog opens showing all 40 rows
   - You see "Total Rows: 40, Total Columns: 8"

3. **Find Your Table**
   - Scroll down to Row 12 (Project Beta starts here)
   - Identify where your table ends (Row 25)

4. **Select Your Table**
   - Click on Cell at Row 12, Col 0 (first cell of Project Beta)
   - Drag to Cell at Row 25, Col 7 (last cell with data)
   - Selected area turns blue with borders

5. **Verify Selection**
   - See: "✅ Selected: Row 12-25, Col 0-7 (14 rows × 8 cols)"
   - Verify it includes your Headers, Max/Min, Weights, and Data rows

6. **Import**
   - Click "Import Selected Data"
   - Only Project Beta data is imported!

## Visual Features

### Before Selection:
```
┌─────────────────────────────────┐
│ 📊 Sheet Info: 40 rows, 8 cols │
│ ⚠️ Click and drag to select     │
│                                 │
│ [Scrollable view of ALL data]  │
│ Row 1:  [Table 1 Header]       │
│ Row 2:  [Table 1 Max/Min]      │
│ ...                             │
│ Row 12: [Table 2 Header]  ← Start here
│ Row 13: [Table 2 Max/Min]      │
│ ...                             │
│ Row 25: [Table 2 Data]    ← End here
│ ...                             │
│ Row 27: [Table 3 Header]       │
└─────────────────────────────────┘
```

### After Selection:
```
┌─────────────────────────────────┐
│ ✅ Selected: Row 12-25, Col 0-7 │
│    (14 rows × 8 cols)           │
│                                 │
│ Row 12: [🔵🔵🔵🔵🔵🔵🔵🔵] ← Blue
│ Row 13: [🔵🔵🔵🔵🔵🔵🔵🔵]
│ Row 14: [🔵🔵🔵🔵🔵🔵🔵🔵]
│ ...                             │
│ Row 25: [🔵🔵🔵🔵🔵🔵🔵🔵]
│                                 │
│ [ Import Selected Data ] ✅     │
└─────────────────────────────────┘
```

## Key Improvements

### 1. **No Auto-Selection**
   - **Before:** Entire sheet was pre-selected
   - **After:** Nothing selected initially
   - **Benefit:** Easy to see all tables clearly

### 2. **Sheet Size Info**
   - Shows total rows and columns
   - Helps identify if entire sheet loaded correctly

### 3. **Maximum Height Control**
   - Table area limited to 60% of viewport height
   - Ensures instructions remain visible while scrolling

### 4. **Better Instructions**
   - First step: "Scroll through sheet to find your table"
   - Clear guidance for multi-table scenarios

### 5. **Scrollable View**
   - Full vertical and horizontal scrolling
   - Sticky row/column headers for easy navigation
   - See all data without limitations

## Technical Details

### Changes Made:

1. **Initial Selection** (Line 1521-1529)
```tsx
// Before: Selected all data
endRow: rows - 1,
endCol: cols - 1

// After: No selection
endRow: 0,
endCol: 0
```

2. **Sheet Information Display** (Line 6948-6971)
```tsx
<div className="text-xs text-blue-900">
  <strong>📊 Excel Sheet Information:</strong>
  {excelPreviewData && (
    <div>
      <div>Total Rows: <strong>{excelPreviewData.length}</strong></div>
      <div>Total Columns: <strong>{Math.max(...)}</strong></div>
    </div>
  )}
</div>
```

3. **Max Height for Scrolling** (Line 6984)
```tsx
<div className="... max-h-[60vh]">
  {/* Scrollable table */}
</div>
```

## Use Cases

### ✅ **Single Table in Sheet**
- Upload file
- See the entire table
- Click first cell, drag to last cell
- Import

### ✅ **Multiple Tables in Sheet**
- Upload file
- Scroll to find your specific table
- Select only that table
- Import just what you need

### ✅ **Large Sheets** 
- View sheets with 100+ rows
- Scroll easily with max-height control
- Still see instructions while scrolling

### ✅ **Complex Layouts**
- Skip empty rows between tables
- Select non-contiguous regions (future enhancement)
- Identify tables by scanning data

## Files Modified

- `app/application/page.tsx`
  - Line 1521-1529: Changed initial selection
  - Line 6948-6971: Added sheet info display
  - Line 6984: Added max-height for scrolling

## Testing

1. **Create Excel with Multiple Tables:**
```
Row 1:  Table1, C1, C2, C3
Row 2:  Alt,    max, max, min
Row 3:  Alt,    0.3, 0.4, 0.3
Row 4:  A1,     10,  20,  5
(empty rows)
Row 10: Table2, C1, C2, C3
Row 11: Alt,    max, min, max
Row 12: Alt,    0.5, 0.3, 0.2
Row 13: B1,     15,  8,   12
```

2. **Upload and Test:**
   - Should show "Total Rows: 13+"
   - Can scroll to see both tables
   - Can select only Table2 (rows 10-13)
   - Import should only get Table2 data

## Benefits

✅ **Flexibility** - Handle any sheet layout  
✅ **Clarity** - See entire sheet before selecting  
✅ **Control** - Choose exactly which data to import  
✅ **Information** - Know sheet size upfront  
✅ **Usability** - Easy scrolling and navigation  

---

**Status:** ✅ Ready to use! Upload Excel files with single or multiple tables!
