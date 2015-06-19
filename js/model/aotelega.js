function Aotelega() {
    
}

Aotelega.prototype = {
    
    currentNuu: null,
	currentMotu: null,
	currentItumalo: null,
	tutuila: new Tutuila(),
	upolu: Object.create(Upolu.prototype),
	savaii: Object.create(Savaii.prototype),
	  
    getMotus: function() {
        var tempArray = [
            {name:'Upolu'},
            {name:'Savai\'i'},
            {name:'Tutuila'}
        ];    
        return tempArray;
    },
	
	getItumalos: function() {
        var tempArray = [
            {name:'Upolu'},
            {name:'Savai\'i'},
            {name:'Tutuila'}
        ];    
        return tempArray;
    },
	
	getNuus: function() {
		var that = this;
        var tempArray = [];
		//tempArray = tempArray.concat(that.upolu.getNuus());
		//tempArray = tempArray.concat(that.savaii.getNuus());
        return tempArray;
    }
};



