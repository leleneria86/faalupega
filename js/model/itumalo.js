function ItumaloCollection() {
}

ItumaloCollection.prototype = {
	itumalos: [],
	
	load: function()
	{
		var that = this;
		var itumalo = new Itumalo();
		that.itumalos.push(itumalo);
		
		var itumalo = new Itumalo();
		itumalo.name = "Ma'oputasi";
		itumalo.searchable_name = "maoputasi";
		itumalo.motu = "Tutuila";
		that.itumalos.push(itumalo);
		
		var itumalo = new Itumalo();
		itumalo.name = "Alataua";
		itumalo.searchable_name = "alataua";
		itumalo.motu = "Tutuila";
		that.itumalos.push(itumalo);
		
		var itumalo = new Itumalo();
		itumalo.name = "A'ana";
		itumalo.searchable_name = "aana";
		itumalo.motu = "Upolu";
		that.itumalos.push(itumalo);
		
		var itumalo = new Itumalo();
		itumalo.name = "Palauli";
		itumalo.searchable_name = "palauli";
		itumalo.motu = "Savai'i";
		that.itumalos.push(itumalo);
	},
	
	getCollection: function()
	{
		return this.itumalos;
	}
};

function Itumalo() {
    
}

Itumalo.prototype = {
    
    id: null,
    name: '',
	searchable_name: '',
    faalupega: null,
    malae: null,
    lagi: null,
    toga: null,
    vaevaega: [],
    nuu: [],
	motu: ''
};



