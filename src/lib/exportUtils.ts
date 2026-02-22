import * as XLSX from "xlsx";

/** Export an array of objects to a .xlsx file and trigger browser download */
export function exportToExcel<T extends object>(
    data: T[],
    filename: string,
    sheetName = "Sheet1"
) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

/** Export an array of objects to a UTF-8 CSV file and trigger browser download */
export function exportToCSV<T extends object>(data: T[], filename: string) {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]) as (keyof T)[];
    const csvRows = [
        headers.join(","),
        ...data.map((row) =>
            headers
                .map((h) => {
                    const val = row[h] ?? "";
                    // Escape commas/quotes in cell values
                    const str = String(val).replace(/"/g, '""');
                    return str.includes(",") || str.includes("\n") ? `"${str}"` : str;
                })
                .join(",")
        ),
    ];

    // Add BOM for Thai character support in Excel when opening CSV
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
