/**
	Synchronization functions.
	Pozbierane zo starych frameworkov a trocha zovesobecnene.
	@testcase	\GL_LANG\gjaxXB\_testcases\Sync\Bakery\				(ale pouziva iny fajl Bakery.js)!
	@docs		\GL_LANG\gjaxXB\_docs\stories\Bakery\Bakery.html	(ale pouziva iny fajl Bakery.js)!
	**/
function Bakery() {
        this.choosing = [];
        this.number = [];
    }
    /**
	@originalFunction
	@explicitNumber		- optional, if specified, ticket choosing is performed in 
	createSynchronizedDelegate not in newFunction call
	and explicit number is set as number[i]
	if not specified, original 1+max algorithm is used
	**/
Bakery.prototype.synchronizedDelegate = function(originalFunction, explicitNumber) {
    var b = this,
        i = b.choosing.length;

    b.choosing[i] = 0;
    b.number[i] = 0;

    if (explicitNumber != null) //extra optional choosing block in creation
    {
        b.choosing[i] = 1;
        b.number[i] = explicitNumber;
        b.choosing[i] = 0;
    }

    function newFunction() {
        // store original context and params of method call 
        var that = this,
            args = Array.prototype.slice.call(arguments);

        if (explicitNumber == null) // if chosen in creation, skip
        {
            // original choosing block in run
            b.choosing[i] = 1;
            b.number[i] = 1 + Math.max.apply(null, b.number);
            b.choosing[i] = 0;
        }

        var j = 0, // declared and incialized outside method scope
            L2 = false; // flag label L2, already passed	

        (function attempt() {
            for (; j < b.choosing.length;) //for loop with out of scope variable
            {
                if (!L2) //check only if not already passed for j
                {
                    if (b.choosing[j] != 0) {
                        setTimeout(attempt, 1);
                        return;
                    }
                }
                L2 = true; //L2 passed, don't chcek on next timeout, if next if fails
                if (b.number[j] != 0 && (b.number[j] < b.number[i] || b.number[j] == b.number[i] && j < i)) {
                    setTimeout(attempt, 1);
                    return;
                }
                j++;
                L2 = false;
            }
            //	critical section
            //	call originalFunction in original context with original params
            originalFunction.apply(that, args);
            that = null;
            args = null; // release pointers (WTF ?)
            b.number[i] = 0;
        })(); //declare+call
    }
    return newFunction;
};

module.exports=Bakery;
