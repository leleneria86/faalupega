function Tutuila() {
    
}

Tutuila.prototype = {
    
	itumalos: null,
	nuus: [],
	
	getNuus: function() {
		return this.nuus;
    },  

	getItumalos: function() {
		return this.itumalos;
	},

	load: function(callback)
	{
            var that = this; 	
            var url  = "/test/php/nuus.php";

            $.blockUI({});
            $.getJSON(url)
            .done(function(data) {

                    that.nuus = data.nuus;
					that.itumalos = data.itumalos;
                    $.unblockUI({});
                    callback();
            })
            .fail(function() {
                    $.unblockUI();
            })
            .always(function() {
                    $.unblockUI();
            });
	}
};



