"use strict";


/**
 *  TODO: Add copyrights here, 2020
 */ 



/**
 * This keeps all the total tally as well as well as form a node for it's children.
 * 
 * TODO: We need more requirements to determine whether:
 * 1. Profit = Revenue - Cost; if yes, we can drop Profit and calculate it
 * 2. Tax varies between Country to Country, thus totals at higher levels probably is incorrect
 */
class TotalTally {
	
    constructor(bHasChildren = false) 
    {
		this.revenue = 0
        this.cost = 0
        this.profit = 0
    }
    
    /**
     * ASSUMPTION: The task specifically said that data is good clean data, thus no effort was made in
     * cleaning the data, for sanity sake it has been pushed through a float parser
     * @param {*} revenue 
     * @param {*} cost 
     * @param {*} profit 
     */
    addTotals(revenue, cost, profit) 
    {
        this.revenue += parseFloat(revenue)
        this.cost += parseFloat(cost)
        this.profit += parseFloat(profit)
    }


    addObjTotals(obj)
    {
        this.revenue += obj.revenue
        this.cost += obj.cost
        this.profit += obj.profit
    }
}

module.exports = TotalTally