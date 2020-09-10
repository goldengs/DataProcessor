"use strict";


/**
 *  TODO: Add copyrights here, 2020
 */ 


const fs = require('fs');
const moment = require('moment');

//  Please see README for details on csv-parser & big-json
const csv = require('csv-parser')
//  const json = require('big-json');

const PriorityOrders = require('./processor/PriorityOrders .js');



try
{
    const oMapYears = new Map()

    /**
     * LOAD DATA BY CHUNKS INTO FAST MAP
     * 
     * We want a small memory foot print, map data into the tree, using Map, this can be improved upon
     * and see README for details. *DO NOT* use Array, Maps are significantly faster (2020)
     * 
     * TODO: Should fix, hard coded magic constants, no data cleaning performed
     */
    fs.createReadStream('./data/sample-data.csv')
    .pipe(csv())
    .on('data', (row) => {

        const oMoment = moment.utc(row['Order Date'], 'MM/DD/YYYY')
        const oDate = oMoment.toDate()

        const oMapMonths = oMapYears[oDate.getFullYear()] || (oMapYears[oDate.getFullYear()] = new Map())
        const oMapOrderPriorties = oMapMonths[oDate.getMonth()] || (oMapMonths[oDate.getMonth()] = new Map())
        const oOrderPriority = oMapOrderPriorties[row['Order Priority']] || (oMapOrderPriorties[row['Order Priority']] = new PriorityOrders())

        oOrderPriority.addCount()
    })
    .on('end', () => {

        /***
         * CALCULATE, BUILD OBJECT AND DUMP JSON
         */

        //  We build up our Regions object
        const oAllYears = Object.entries(oMapYears).reduce((acc, it) => {

            const sYear = it[0] 
            const oMapMonths = it[1]

            const oYearMonths = Object.entries(oMapMonths).reduce((acc, it) => {

                const sMonth = it[0]
                const oMapItemItems = it[1]

                const oMonthPriorityOrders = Object.entries(oMapItemItems).reduce((acc, it) => {

                    const sPriorityOrder = it[0]
                    const oPriorityOrders = it[1]

                    //  Here we reduce into a Priority Order list 
                    acc[sPriorityOrder] = oPriorityOrders.count
                    return acc
                }, {})

                //  Here we reduce into Month + Priority Orders list
                acc[String(parseInt(sMonth) + 1).padStart(2, '0')] = oMonthPriorityOrders
                return acc

            }, {})

            //  Here we reduce into Year + Month list
            acc[sYear] = oYearMonths
            return acc
            
        }, {})



        //  We build up the *big* POJO to dump out as JSON
        const oJsonData = oAllYears
        
        //  JSON is actually small - so we use the faster way
        process.stdout.write(JSON.stringify(oJsonData))

        /**
         * TODO: USE THE BIG JSON Stringify *ONLY* if the data object is big, does not seem the case here
         *         
         json.createStringifyStream({
            body: oJsonData
        }).on('data', (chunk) => {

            process.stdout.write(chunk)
        });

         * 
         */
    });
}
catch (err)
{
    console.error(err)
}