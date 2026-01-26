# Multi-Sheet Excel Support

## What's New

The Excel import dialog now supports **Excel files with multiple sheets**! 🎉

### ✅ Features

1. **Automatic Sheet Detection**
   - Detects all sheets in your Excel file
   - Shows total number of sheets available

2. **Sheet Selector Dropdown**
   - Choose which sheet to import from
   - Switch between sheets without re-uploading

3. **Sheet Information Display**
   - See how many sheets are available
   - Know which sheet you're currently viewing
   - View rows/columns for each sheet

## How It Works

### Single Sheet Files
If your Excel file has only **1 sheet**:
- Loads that sheet automatically
- No sheet selector shown
- Works exactly as before

### Multi-Sheet Files  
If your Excel file has **2+ sheets**:
- Shows "Available Sheets: 3" (or however many)
- Displays a dropdown to select sheets
- Initially loads Sheet1 (first sheet)
- Switch sheets using the dropdown

## Example Usage

### Your Excel File Structure:
```
📊 MyData.xlsx
├── Sheet1 (Schools Data)
├── Sheet2 (Projects Data)  
└── Sheet3 (Survey Data)
```

### Steps to Import from Sheet2:

1. **Upload Excel File**
   - Click "Upload Excel" button
   - Select MyData.xlsx

2. **See Sheet Information**
   ```
   📊 Excel Sheet Information:
      Total Rows: 15
      Total Columns: 8
      Available Sheets: 3
      [Dropdown showing: Sheet1]
   ```

3. **Select Your Sheet**
   - Click the dropdown
   - See options: Sheet1, Sheet2, Sheet3
   - Select "Sheet2"

4. **View Sheet2 Data**
   - Data preview updates automatically
   - Shows Sheet2 rows and columns
   - Selection is reset to empty

5. **Select Data Range**
   - Click first cell of your table
   - Drag to last cell
   - See blue highlighting

6. **Import**
   - Click "Import Selected Data"
   - Only Sheet2 data is imported!

## Visual Example

### Dialog with Multi-Sheet File:

```
┌─────────────────────────────────────────────┐
│ Select Data to Import                    × │
├─────────────────────────────────────────────┤
│ 📊 Excel Sheet Information:                │
│    Total Rows: 15                           │
│    Total Columns: 8                         │
│    Available Sheets: 3                      │
│    [Dropdown: Sheet2 ▼]  ← SELECT SHEET     │
│                                             │
│ 📋 How to select data:                      │
│ 1️⃣ Scroll through the sheet to find table   │
│ 2️⃣ Click on the first cell                  │
│ 3️⃣ Drag to the last cell                    │
│ 4️⃣ Include: Headers, Max/Min, Weights, Data │
├─────────────────────────────────────────────┤
│ ⚠️ Click and drag to select your data table │
│                                             │
│ [Data Preview for Sheet2]                   │
│ Row 0: [Header 1] [Header 2] ...            │
│ Row 1: [Max/Min ] [Max/Min ] ...            │
│ ...                                         │
├─────────────────────────────────────────────┤
│ [Cancel] [Import Selected Data]             │
└─────────────────────────────────────────────┘
```

## Technical Details

### State Management

Added new state variables:
```tsx
const [excelWorkbook, setExcelWorkbook] = useState<any>(null)
const [excelSheetNames, setExcelSheetNames] = useState<string[]>([])
const [selectedSheetName, setSelectedSheetName] = useState<string>("")
```

### Sheet Switching Function

```tsx
const handleSheetChange = (sheetName: string) => {
  if (!excelWorkbook) return
  
  setSelectedSheetName(sheetName)
  const sheet = excelWorkbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  setExcelPreviewData(jsonData as any[][])
  
  // Reset selection when changing sheets
  setSelectedDataRange({
    startRow: 0,
    endRow: 0,
    startCol: 0,
    endCol: 0
  })
}
```

### File Upload Updates

Now stores the entire workbook:
```tsx
// Store workbook and sheet names for multi-sheet support
setExcelWorkbook(workbook)
setExcelSheetNames(workbook.SheetNames)
setSelectedSheetName(workbook.SheetNames[0])
```

## UI Components

### Sheet Selector (only shown when multiple sheets exist)

```tsx
{excelSheetNames.length > 1 && (
  <div className="mt-2">
    <span>Available Sheets: <strong>{excelSheetNames.length}</strong></span>
    <div className="mt-1">
      <Select value={selectedSheetName} onValueChange={handleSheetChange}>
        <SelectTrigger className="w-48 h-7 text-xs bg-white">
          <SelectValue placeholder="Select sheet" />
        </SelectTrigger>
        <SelectContent>
          {excelSheetNames.map((sheetName) => (
            <SelectItem key={sheetName} value={sheetName}>
              {sheetName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
)}
```

## Files Modified

- `app/application/page.tsx`
  - Lines 778-791: Added state for workbook and sheets
  - Lines 1509-1534: Store workbook and sheet names
  - Lines 1597-1619: Added handleSheetChange function
  - Lines 6974-7006: Added sheet selector UI

## Benefits

✅ **Flexibility** - Import from any sheet in your file  
✅ **Convenience** - No need to create separate files per sheet  
✅ **Clarity** - See exactly which sheet you're importing from  
✅ **Efficiency** - Switch sheets without re-uploading  
✅ **Organization** - Keep related data in one Excel file  

## Use Cases

### 1. **Multiple Projects in One File**
```
ProjectData.xlsx
├── Project_Alpha (import this)
├── Project_Beta
└── Project_Gamma
```

### 2. **Different Scenarios**
```
DecisionMatrix.xlsx
├── Scenario_Optimistic
├── Scenario_Realistic (import this)
└── Scenario_Pessimistic
```

### 3. **Time Periods**
```
QuarterlyData.xlsx
├── Q1_2024
├── Q2_2024
├── Q3_2024 (import this)
└── Q4_2024
```

### 4. **Different Stakeholders**
```
Evaluations.xlsx
├── Team_A
├── Team_B (import this)
├── Team_C
└── Combined
```

## Testing

1. **Create Multi-Sheet Excel:**
   - Create Excel file with 3 sheets
   - Add different data to each sheet
   - Name sheets: "Test1", "Test2", "Test3"

2. **Upload and Verify:**
   - Upload the file
   - Should see "Available Sheets: 3"
   - Dropdown should show all 3 sheet names

3. **Switch Sheets:**
   - Select "Test2" from dropdown
   - Data preview should update
   - Selection should reset

4. **Import from Specific Sheet:**
   - Select data range from Test2
   - Import should use Test2 data only

---

**Status:** ✅ Multi-sheet support fully implemented and ready to use!
