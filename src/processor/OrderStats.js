"use strict";


/**
 *  TODO: Add copyrights here, 2020
 */ 



/**
 * This keeps all the priority orders details - simplifies logic
 */
class OrderStats  {
	
    constructor() 
    {
        this.orders = 0
		this.shippingDays = 0
    }
    
    /**
     * ASSUMPTION: The task specifically said that data is good clean data, thus no effort was made in
     * cleaning the data, for sanity sake it has been pushed through a float parser
     * @param {*} count 
     */
    addOrder(shippingDays) 
    {
        ++this.orders
        this.shippingDays += shippingDays
    }

    averageShippingDays()
    {
        return this.shippingDays / this.orders
    }


    addObjStats(obj)
    {
        this.orders += obj.orders
        this.shippingDays += obj.shippingDays
    }
}

module.exports = OrderStats 