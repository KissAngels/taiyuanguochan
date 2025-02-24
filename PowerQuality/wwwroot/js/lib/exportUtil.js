class TableExporter {
    constructor() {
        this.xlsx = window.XLSX;
    }

    // 从表格DOM元素提取数据
    extractTableData(table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        const data = rows.map(row => {
            return Array.from(row.querySelectorAll('th, td')).map(cell => cell.textContent.trim());
        });
        return data;
    }

    // 导出Excel文件
    exportToExcel(tableId, fileName) {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error('Table not found:', tableId);
            return;
        }

        const data = this.extractTableData(table);
        const ws = this.xlsx.utils.aoa_to_sheet(data);
        const wb = this.xlsx.utils.book_new();
        this.xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        // 生成文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fullFileName = `${fileName}_${timestamp}.xlsx`;
        
        // 导出文件
        this.xlsx.writeFile(wb, fullFileName);
    }
}

// 添加到全局作用域
window.TableExporter = TableExporter;
