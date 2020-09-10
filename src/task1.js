"use strict";


/**
 *  TODO: Add copyrights here, 2020
 */ 


const fs = require('fs');

//  Please see README for details on csv-parser & big-json
const csv = require('csv-parser')
const json = require('big-json');

const TotalTally = require('./processor/TallyTotal.js')



try
{
    const oMapRegions = new Map()

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
        const oMapCountries = oMapRegions[row.Region] || (oMapRegions[row.Region] = new Map())
        const oMapItemTypes = oMapCountries[row.Country] || (oMapCountries[row.Country] = new Map())
        const oTotalTally = oMapItemTypes[row['Item Type']] || (oMapItemTypes[row['Item Type']] = new TotalTally())

        oTotalTally.addTotals(row['Total Revenue'], row['Total Cost'], row['Total Profit'])
    })
    .on('end', () => {

        /***
         * CALCULATE, BUILD OBJECT AND DUMP JSON
         */

        //  Need map for all Item Types - this was done to minimise calculations
        const oMapAllItemTypes = new Map()

        //  We build up our Regions object
        const oAllRegions = Object.entries(oMapRegions).reduce((acc, it) => {

            const sRegion = it[0] 
            const oMapCountries = it[1]

            const oRegionTotalTally = new TotalTally()
            const oRegionCountries = Object.entries(oMapCountries).reduce((acc, it) => {

                const sCountry = it[0]
                const oMapItemItems = it[1]

                const oCountryTotalTally = new TotalTally()
                const oCountryItemTypes = Object.entries(oMapItemItems).reduce((acc, it) => {

                    const sItemTypes = it[0]
                    const oItemTypesTally = it[1]

                    //  Here we just add to the country totals
                    oCountryTotalTally.addObjTotals(oItemTypesTally)

                    //  Update our all Item Types
                    const oItemTypes = oMapAllItemTypes[sItemTypes] || (oMapAllItemTypes[sItemTypes] = new TotalTally()) 
                    oItemTypes.addObjTotals(oItemTypesTally)

                    //  Here we reduce into a Item Type list 
                    acc[sItemTypes] = oItemTypesTally
                    return acc
                }, {})


                //  Here we just add to the region totals
                oRegionTotalTally.addObjTotals(oCountryTotalTally)

                //  Here we reduce into Country Totals + Item Type list
                acc[sCountry] = {
                    "Total": oCountryTotalTally,
                    "ItemTypes": oCountryItemTypes
                }
                return acc
            }, {})

            //  Here we reduce into Region Totals + Countries list
            acc[sRegion] = {
                "Total": oRegionTotalTally,
                "Countries": oRegionCountries
            }
            return acc            
        }, {})


        //  We build up our all Item Types object
        const oAllItemTypes = Object.entries(oMapAllItemTypes).reduce((acc, it) => {

            const sItemTypes = it[0]
            const oItemTypesTally = it[1]

            //  Here we reduce into a Item Type list
            acc[sItemTypes] = oItemTypesTally
            return acc
        }, {})


        //  We build up the *big* POJO to dump out as JSON
        const oJsonData = {
            "Regions": oAllRegions,
            "ItemTypes": oAllItemTypes
        }

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