
const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const upload = require('../multerConfig');
const IciciBankStatment = require('../Models/IciciBankStatment');


router.post('/IciciBank/statement', upload.single('excelFile'), async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);

        const worksheet = workbook.getWorksheet(1);
        if (worksheet) {
            const dataToSave = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) {
                    const withdrawalAmt = typeof row.getCell(7).value === 'number' ? row.getCell(7).value : (row.getCell(7).value !== null ? parseFloat(row.getCell(7).value.replace(/,/g, '')) : null);
                    const depositAmt = typeof row.getCell(8).value === 'number' ? row.getCell(8).value : (row.getCell(8).value !== null ? parseFloat(row.getCell(8).value.replace(/,/g, '')) : null);
                    const balance = typeof row.getCell(9).value === 'number' ? row.getCell(9).value : (row.getCell(9).value !== null ? parseFloat(row.getCell(9).value.replace(/,/g, '')) : null);

                    const rowData = {
                        tranId: row.getCell(1).value || null,
                        valueDate: row.getCell(2).value || null,
                        transactionDate: row.getCell(3).value || null,
                        transactionPostedDate: row.getCell(4).value || null,
                        chequeNoRefNo: row.getCell(5).value || null,
                        transactionRemarks: row.getCell(6).value || null,
                        withdrawalAmt: isNaN(withdrawalAmt) ? null : withdrawalAmt,
                        depositAmt: isNaN(depositAmt) ? null : depositAmt,
                        balance: isNaN(balance) ? null : balance,
                    };
                    dataToSave.push(rowData);
                }
            });

            await IciciBankStatment.bulkCreate(dataToSave)
                .then(() => {
                    console.log('Data saved to the database.');
                })
                .catch(err => {
                    console.error('Error saving data to the database:', err);
                });

            res.json({ message: 'Excel data uploaded and saved to the database.' });
        } else {
            res.status(400).json({ error: 'No valid worksheet found in the Excel file.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});





module.exports = router;
