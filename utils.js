const { createObjectCsvWriter } = require('csv-writer');
const csv = require('csv-parser');
const path = require('path');
const fs = require('fs');

// ========================================================
function extractPersianWords(text, sliceNumber = 3) {
    const persianString = text?.replaceAll(/[^\u0600-\u06FF ]/g, '')?.replaceAll(/\s+/g, ' ');
    const words = persianString?.split(' ')?.slice(0, sliceNumber).join(' ');
    return words;
}

// ==================================== readCsv
async function readCsv(csvFilePath) {
    return new Promise((res, rej) => {
        const result = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => result.push(data))
            .on('end', () => {
                console.log(`CSV file ${path.basename(csvFilePath)} read successfully`);
                res(result);
            })
            .on('error', (err) => {
                console.log('Eror in readCsv function :', err);
                rej(err);
            });
    });
}

// ==================================== writeCsv
async function writeCsv(data, csvFilePath) {
    return new Promise((res, rej) => {
        try {
            const keys = Object.keys(data[0]);
            const csvWriter = createObjectCsvWriter({
                path: csvFilePath,
                header: keys.map((key) => ({ id: key, title: key })),
            });
            csvWriter
                .writeRecords(data)
                .then(() => {
                    console.log(`CSV file written successfully`);
                    res();
                })
                .catch((error) => {
                    console.error(`Error writing CSV `, error);
                    rej(error);
                });
        } catch (error) {
            rej(error);
        }
    });
}

// ============================================ delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = {
    extractPersianWords,
    readCsv,
    writeCsv,
    delay,
};
