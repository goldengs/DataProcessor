# DataProcessor
Data Processor written as Node CLI Application. Spits out JSON after processing Orders



GETTING STARTED:
----------------

Install/Build:
> yarn Install

Sample Data:
* Put into the path as ./data/sample-data.csv 

Running:
> yarn task1
> yarn task2
> yarn task3

Results:
* You can view the results under ./results



ASSUMPTIONS:
------------

* Do not use TypeScript, question seemed to specifically NodeJS focused
* Hardcoding file names, clean CSV file - no need to check inputs (TODO: Should fix this as a sanity check)
* Do not desire to store data into database and query it for results needed (big data warehousing etc)
* Examples give a nice formated JSON output, JSON is for machines to read, not humans, so have opted 
    for smaller JSON outputs
* Dates are in UTC form (considering that no time provided, it matters as to what it means at 00:00:00.000)
* Order of the JSON output is not sorted, this may or may not be an issue as it depends on the Map hashes.
* CODING STANDARDS: Every organisation is different and consistent code matters, code can easily be
    adjusted to suit organisation style if needed
* No mention was made on DP, I've only considered DP on the average values, but this should be considered



DESIGN CONCERNS:
----------------

* Map are much faster than Arrays (2020). Use Maps over Arrays for hashing information
* Read the CSV in chunks in ASIO, seems the files can be huge, do not load entire file into memory
* JSON.stringify() can be bad, long strings have limits and take huge performance hits. *HOWEVER*, using
    JSON.stringify() is much faster on small objects. This really needs to be benchmark on production resources. 
* I've opted for a simple implementation to make the code more maintainable as opposed to optimise focused
    as we do not know whether effort to improve it is faster (i.e. is customers complaining?). There is
    further improvements that we can do make it go faster but...
* Just used existing librarys for csv-parsing and big-JSON. *More* research is needed to confirm whether
    these are the best choices, or whether improvements are needed and effort to do so is justified
* I have had a lot of experience in data warehousing, and improvements can be made especially in the 
    Year/Month data, however, more requirements etc would be needed



ENVIRONMENT:
------------

* Setup for project
> npm -v
6.14.8

> node -v
v12.18.3

> yarn -v 
1.22.5
