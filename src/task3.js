"use strict";


/**
 *  TODO: Add copyrights here, 2020
 */ 


const fs = require('fs');
const moment = require('moment');

//  Please see README for details on csv-parser & big-json
const csv = require('csv-parser');
const OrderStats = require('./processor/OrderStats');
const json = require('big-json');





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

        const oMomentOrder = moment.utc(row['Order Date'], 'MM/DD/YYYY')
        const oDateOrder = oMomentOrder.toDate()

        const oMomentShip = moment.utc(row['Ship Date'], 'MM/DD/YYYY')

        const oMapMonths = oMapYears[oDateOrder.getFullYear()] || (oMapYears[oDateOrder.getFullYear()] = new Map())
        const oMapRegions = oMapMonths[oDateOrder.getMonth()] || (oMapMonths[oDateOrder.getMonth()] = new Map())
        const oMapCountries = oMapRegions[row.Region] || (oMapRegions[row.Region] = new Map())
        const oOrderStats = oMapCountries[row.Country] || (oMapCountries[row.Country] = new OrderStats())

        oOrderStats.addOrder(oMomentShip.diff(oMomentOrder, 'days'))
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
                const oMapRegions = it[1]

                const oMonthTotalStats = new OrderStats()
                const oMonthRegions = Object.entries(oMapRegions).reduce((acc, it) => {

                    const sRegion = it[0]
                    const oMapCountries = it[1]

                    const oRegionTotalStats = new OrderStats()
                    const oCountryStats = Object.entries(oMapCountries).reduce((acc, it) => {

                        const sCountry = it[0]
                        const oStats = it[1]

                        //  Update total stats for Region
                        oRegionTotalStats.addObjStats(oStats)
    
                        //  Here we reduce into a Priority Order list 
                        acc[sCountry] = {
                            "AvgDaysToShip": oStats.averageShippingDays().toFixed(2),
                            "NumberOfOrders": oStats.orders
                        }
                        return acc
                    }, {})

                    //  Update total stats for Month
                    oMonthTotalStats.addObjStats(oRegionTotalStats)
    
                    //  Here we reduce into a Priority Order list 
                    acc[sRegion] = {
                        "AvgDaysToShip": oRegionTotalStats.averageShippingDays().toFixed(2),
                        "NumberOfOrders": oRegionTotalStats.orders,
                        "Countries": oCountryStats
                    }
                    return acc
                }, {})

                //  Here we reduce into Month + Priority Orders list
                acc[String(parseInt(sMonth) + 1).padStart(2, '0')] = {
                    "AvgDaysToShip": oMonthTotalStats.averageShippingDays().toFixed(2),
                    "NumberOfOrders": oMonthTotalStats.orders,
                    "Regions": oMonthRegions
                }
                return acc

            }, {})

            //  Here we reduce into Year + Month list
            acc[sYear] = oYearMonths
            return acc
            
        }, {})



        //  We build up the *big* POJO to dump out as JSON
        const oJsonData = oAllYears
        
        //  USE THE BIG JSON Stringify
        json.createStringifyStream({
            body: oJsonData
        }).on('data', (chunk) => {

            process.stdout.write(chunk)
        });

        /**
         * TODO: NOTE: If the objects are small enough, you can use the below instead, it is some what
         * faster but has huge penality on performance
         * 
         * process.stdout.write(JSON.stringify(oJsonData))
         */
    });
}
catch (err)
{
    console.error(err)
}