const XLSX = require('xlsx');

try {
    const wb = XLSX.readFile('sample-decision-matrix.xlsx');
    console.log("Sheet names:", wb.SheetNames);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log("\n=== RAW DATA ===");
    data.forEach((row, idx) => {
        console.log(`Row ${idx}: ${JSON.stringify(row)}`);
    });

    console.log("\n=== PARSED DATA ===");
    console.log("Number of rows:", data.length);

    if (data.length < 4) {
        console.log("ERROR: Need at least 4 rows");
    } else {
        console.log("\nHeaders (Row 1, slice(1)):", data[0].slice(1));
        console.log("Types (Row 2, slice(1)):", data[1].slice(1));
        console.log("Weights (Row 3, slice(1)):", data[2].slice(1));
        console.log("Data rows:", data.slice(3).filter(row => row[0]));
    }
} catch (err) {
    console.error("Error:", err.message);
}
