"use strict";


/**
 *  TODO: Add copyrights here, 2020
 */ 



/**
 * This keeps all the priority orders details - simplifies logic
 */
class PriorityOrders  {
	
    constructor() 
    {
		this.count = 0
    }
    
    /**
     * ASSUMPTION: The task specifically said that data is good clean data, thus no effort was made in
     * cleaning the data, for sanity sake it has been pushed through a float parser
     * @param {*} count 
     */
    addCount(count = 1) 
    {
        this.count += count
    }


    addObjTotals(obj)
    {
        this.count += obj.count
    }
}

module.exports = PriorityOrders 