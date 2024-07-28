const { readCsv, delay, writeCsv, extractPersianWords } = require('./utils.js');
const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:vardast@1234@94.182.180.138:5432/vardast'); //.com
const fs = require('fs');
const path = require('path');

const inputFolder = './input';
const outputFolder = './output';

// ======================================================== findCategoryNameInDb
async function findCategoryNameInDb(categoryName, productName) {
    try {
        // ===========================
        const query = 'select * from base_taxonomy_categories btc where btc."title"=$1';
        const category = await db.oneOrNone(query, [categoryName]);
        if (category) {
            return category?.title || '';
        }

        // ===========================
        const persianProductName3 = extractPersianWords(productName, 3);
        const query_2 = `
              select * from base_taxonomy_categories btc 
              where btc.id in (select "categoryId" from products where "name" LIKE $1 limit 1)
              limit 1
          `;
        const category_2 = await db.oneOrNone(query_2, [`%${persianProductName3}%`]);
        if (category_2) {
            return category_2?.title || '';
        }

        // ===========================
        const persianProductName2 = extractPersianWords(productName, 2);
        const query_3 = `
              select * from base_taxonomy_categories btc 
              where btc.id in (select "categoryId" from products where "name" LIKE $1 limit 1)
              limit 1
          `;
        const category_3 = await db.oneOrNone(query_3, [`%${persianProductName2}%`]);
        if (category_3) {
            return category_3?.title || '';
        }

        // ===========================
        if (categoryName?.trim() != '') {
            const query_4 =
                'select * from base_taxonomy_categories btc where btc."title" like $1 limit 1';
            const category_4 = await db.oneOrNone(query_4, [`%${categoryName}%`]);
            if (category_4) {
                return category_4?.title || '';
            }
        }

        // ===========================
        if (categoryName?.trim() != '') {
            const categoryName3 = extractPersianWords(categoryName, 3);
            const query_5 =
                'select * from base_taxonomy_categories btc where btc."title" like $1 limit 1';
            const category_5 = await db.oneOrNone(query_5, [`%${categoryName3}%`]);
            if (category_5) {
                return category_5?.title || '';
            }
        }

        // ===========================
        if (categoryName?.trim() != '') {
            const categoryName2 = extractPersianWords(categoryName, 2);
            const query_6 =
                'select * from base_taxonomy_categories btc where btc."title" like $1 limit 1';
            const category_6 = await db.oneOrNone(query_6, [`%${categoryName2}%`]);
            if (category_6) {
                return category_6?.title || '';
            }
        }

        return '';
    } catch (error) {
        console.log(error);
        return '';
    }
}

// ======================================================== main
async function main() {
    try {
        if (!fs.existsSync(inputFolder)) fs.mkdirSync(inputFolder);
        if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

        const csvNames = fs
            .readdirSync(inputFolder)
            .filter((name) => name.toLowerCase().endsWith('.csv'));

        const csvName = csvNames[Math.floor(Math.random() * csvNames.length)];

        if (csvName) {
            console.log('==================================== start process csv : ', csvName);
            const csvInputPath = path.join(__dirname, inputFolder, csvName);
            const inputCsv = await readCsv(csvInputPath);
            // fs.unlinkSync(csvInputPath);

            const csvOutputPath = path.join(__dirname, outputFolder, csvName);
            const outputData = await Promise.all(
                inputCsv.map(async (row) => {
                    const cName = row.category;
                    const pName = row.name;
                    row.categoryAi = await findCategoryNameInDb(cName, pName);
                    return row;
                })
            );

            await writeCsv(outputData, csvOutputPath);
            console.log('End process :', csvName);
        } else {
            console.log('There is no csv file');
            process.exit(0);
        }
    } catch (error) {
        console.log('Error in main :', error);
    }
}

main();
