function TestCollection() {

}

TestCollection.prototype = {
    
    store_id: null,
    store_location_id: null,
    customer_id: null,
    till_id: null,
    collection: [],
    statuses: [],
    taxes: [],
    lmap: {},
    
    addLayaway: function(layaway) 
    {
        var that = this;
        that.layaways.push(layaway);
    },
    
    load: function(callback) 
    {		
        var that = this;
        var test = new Test();
        test.id     = 1;
        test.name = 'Product 1';
        test.text = 'This is Product One Text';
        that.collection.push(test);
        var test2 = new Test();
        test2.id = 2;
        test2.name = 'Product 2';
        test2.text = 'This is Product Two Text';
        that.collection.push(test2);
        callback();
    },
    
    setCollection: function(rows)
    {
        if(rows !== null)
        {
            var that = this;
            that.collection = [];
            for(var i = 0; i < rows.length; i++)
            {
                var layaway = new Layaway();
                var lay = rows[i];
                layaway.setProperties(lay);
                layaway.setDetails(lay);
                that.collection.push(layaway);
                that.lmap[layaway.id] = layaway;
            }
        }
    }
};


function Test() {
    
    var that = this;
    that.pickup_time = '12:00pm';
    that.items = [];
    that.payments = [];
    that.scheduled_payments = [];
    that.collected_amount = 0;
    that.name = null;
    that.text = null;
}

Test.prototype = {
    
    settings: null,
    name: null,
    text: null,
    items: [],
    payments: [],
    payments_by_type: [],
    scheduled_payments: [],
    store_id: null,
    store_location_id: null,
    pos_customer_id: null,
    customer_name: null,
    date: null,
    collected_amount: 0,
    deposit_percent: null,
    unpaid_balance: null,
    total_amount: null,
    total_tax: null,
    notes: null,
    next_payment_date: null,
    next_payment_amount: null,
    next_payment_id: null,
    next_payment: null,
    number_of_payments: null,
    last_payment_amount: null,
    last_payment_date: null,
    late_fees: 0,
    new_late_fees: 0,
    status: null,
    deposit: null,
    deposit_dollar_amount: null,
    description: null,
    sql_pickup_date: null,
    pickup_date: null,
    pickup_time: null,
    payment_interval: 'Bi-Weekly',
    deposit_type: 'percent',
    layaway_number: null,
    new_schedule: false,
    pslrs: [],
    id: null,
    
    init: function(callback)
    {
        var that = this;
        //var settings = Object.create(LayawaySettings.prototype);
        //settings.store_id = that.store_id;
        //settings.store_location_id = that.store_location_id;
        that.settings.load(function() {
            that.new_schedule = true;
            that.status = 'Current';
            that.setDefaultSettings();
            callback();
        });
    },
    
    getId: function()
    {
        return this.id;
    },
    
    getSubtotal: function()
    {
        return this.total_amount;
    },
    
    getTotal: function()
    {
        var that = this;
        return that.total_amount + that.total_tax + (that.settings.service_fee === null ? 0 : that.settings.service_fee);
    },
    
    getLateFees: function()
    {
        return this.late_fees + this.new_late_fees;
    },
    
    setDefaultSettings: function()
    {
        var that = this;
        that.store_id = that.settings.store_id;
        that.store_location_id = that.settings.store_location_id;
        that.payment_interval = that.settings.selected_payment_interval.name;
        var todayStr = todaysDateString();
        that.next_payment.date = getNextDate(todayStr, that.payment_interval);
        that.pickup_date = todayStr;
        that.date = todayStr;
        var dt = Date.parse(todayStr).add(checkAndParseFloat(that.settings.term_months)).months();
        that.pickup_date = dt.toString('M/d/yyyy');
        that.sql_pickup_date = dt.toString('yyyy-MM-dd');
        that.settings.minimum_purchase_amount = that.settings.minimum_purchase;
        that.settings.service_fee = checkAndParseFloat(that.settings.service_fee);
        that.settings.late_fee = checkAndParseFloat(that.settings.late_fee);
        if(!that.settings.cancellation_fee_same_as_deposit)
        {
            that.settings.cancellation_fee = checkAndParseFloat(that.settings.cancellation_fee);
        }
        if(that.settings.deposit_type === 'percent')
        {
            that.deposit_percent = that.settings.deposit_amount;
        }
        else
        {
            that.deposit_dollar_amount = that.settings.deposit_amount;
        }
    },
    
    setStatus: function(status, next)
    {
        var that = this;
        that.status = (next.isBefore(moment(todaysDateString())) ? 'Late' : status);
    },

    removeLineById: function(id) {
        var tmp = this.items;
        this.items = [];
        for(var i = 0; i < tmp.length; i++) {
            if(tmp[i].item_id !== id) {
                this.items.push(tmp[i]);
            }
        }
        this.recalculate();
    },

    removeAll: function()
    {
        this.items = [];
        this.recalculate();
    },
    
    showServiceFee: function()
    {
        return (this.total_amount > 0 && this.settings.service_fee !== null && this.settings.service_fee > 0);
    },

    getCollectedAmount: function()
    {
        var that = this;
        return that.collected_amount * -1;
    },

    recalculate: function()
    {
        this.calculateTotal();
        this.calculatePayment();
    },
    
    loadDetails: function(callback) 
    {		
            var that = this; 	
            var url  = "/pos-app/api/layaway/layaways.proc.php?storeid="+that.store_id+"&locid="+that.store_location_id+"&layid="+that.id+"&details=1";

            $.blockUI({});
            $.getJSON(url)
            .done(function( data ) {

                that.setDetails(data);
                $.unblockUI({});
                callback();
            });		
    },

    loadPslrs: function(callback)
    {
        var that = this;
        var url  = "/pos-app/api/layaway/layaways.proc.php?storeid="+that.store_id+"&locid="+that.store_location_id+"&layid="+that.id+"&pslrs="+1;

        $.blockUI({});
        $.getJSON(url)
            .done(function( data ) {

                that.pslrs = data.pslrs;
                $.unblockUI({});
                callback();
            });
    },

    setDetails: function(data)
    {
        var that = this;
        that.setPayments(data.payments);
        that.setItems(data.items);
        that.setScheduledPayments(data.scheduled_payments);
    },
    
    setPayments: function(payments)
    {
        if(payments !== undefined)
        {
            var that = this;
            that.collected_amount = 0;
            that.payments = [];
            that.payments_by_type = [];

            for(var i = 0; i < payments.length; i++)
            {
                var row = payments[i];
                var pmt = new LayawayScheduledPayment();
                pmt.date = row.date;
                pmt.setAmount(row.amount);
                that.payments.push(pmt);
                that.collected_amount += pmt.amount;
            }
        }
    },

    setScheduledPayments: function(payments)
    {
        if(payments !== undefined)
        {
            var today = moment(todaysDateString());
            var that = this;
            that.next_payment_amount = null;
            that.next_payment = null;
            that.scheduled_payments = [];
            var latePmtAmount = 0;
            var latePmtAmountPaid = 0;
            var latePmtFees = 0;
            for(var i = 0; i < payments.length; i++)
            {
                var row = payments[i];
                var pmtDate = moment(row.date);
                if(pmtDate.isBefore(today))
                {
                    that.status = "Late";
                    var item = Object.create(LayawayItem.prototype);
                    item.item_id    = row.id;
                    item.setPrice(that.settings.late_fee);
                    item.label      = "Late Fee (" + row.date +")";
                    item.quantity   = 1;
                    item.layaway_id = row.layaway_id;
                    //that.addItem(item);
                    that.items.push(item);
                    that.calculateTotal();
                    
                    latePmtAmount += checkAndParseFloat(row.amount);
                    latePmtAmountPaid += checkAndParseFloat(row.amount_paid);
                    latePmtFees += that.settings.late_fee;
                }
                else
                {
                    var pmt = new LayawayScheduledPayment();
                    var amount = checkAndParseFloat(row.amount);
                    var amount_paid = checkAndParseFloat(row.amount_paid);
                    if(latePmtAmount !== null)
                    {
                        amount += (latePmtAmount + latePmtFees);
                        amount_paid += latePmtAmountPaid;
                    }
                    pmt.amount      = amount;
                    pmt.amount_paid = amount_paid;
                    pmt.setAmountUnpaid();
                    pmt.id = row.id;
                    pmt.date = row.date;
                    that.scheduled_payments.push(pmt);
                    that.new_late_fees += pmt.late_fee;
                    if(that.next_payment === null && (row.amount_paid === null || pmt.amount > pmt.amount_paid))
                    {
                        that.next_payment = pmt;
                    }
                    latePmtAmount = null;
                }
            }
        }
    },
    
    setItems: function(items)
    {
        if(items !== undefined)
        {
            var that = this;
            that.items = [];
            that.total_amount = 0;
            for(var j = 0; j < items.length; j++)
            {
                var rowItem = items[j];
                var item = Object.create(LayawayItem.prototype);
                item.item_id    = rowItem.product_store_location_rel_id;
                item.setPrice(rowItem.price);
                item.tax        = checkAndParseFloat(rowItem.tax);
                item.label      = rowItem.label;
                item.quantity   = checkAndParseFloat(rowItem.quantity);
                item.layaway_id = rowItem.layaway_id;
                item.id         = rowItem.id;
                item.bitmap_tax = rowItem.bitmap_tax;
                item.taxes      = that.settings.taxes;
                //that.addItem(item);
                that.items.push(item);
                that.calculateTotal();
            }
        }
    },
    
    setPickupDate: function(pickup_date)
    {
        var that = this;
        var timestamp=Date.parse(pickup_date);

        if (isNaN(timestamp)===false)
        {
            that.sql_pickup_date = pickup_date;
            var dt = new Date(pickup_date);
            that.pickup_date = (dt.getMonth() + 1) + '/' + (dt.getDate() + 1) + '/' + dt.getFullYear();
        }
    },
    
    calculatePayment: function()
    {
        var that = this;
        var calculated = that.payment_calculator.calculate(that.getRemainingBalance(), 
                                            that.payment_interval, 
                                            that.last_payment_date,
                                            that.pickup_date);

        that.next_payment = null;
        if(calculated)
        {
            var next_payment = that.payment_calculator.getNextPayment(null);      
            if(next_payment)
            {
                that.next_payment =  that.toScheduledPayment(next_payment.date, next_payment.amount);
            }
            
            that.scheduled_payments = [];
            var pmts = that.payment_calculator.getPayments();
            for(var i = 0; i < pmts.length; i++)
            {
                that.scheduled_payments.push(that.toScheduledPayment(pmts[i].date, pmts[i].amount));
            }
            that.new_schedule = true;
        }
    },
    
    getRemainingBalance: function()
    {
        var that = this;
        if(that.total_amount !== null)
        {
            return checkAndParseFloat(that.total_amount) 
                    + checkAndParseFloat(that.settings.service_fee) 
                    + that.total_tax
                    + checkAndParseFloat(that.late_fees) 
                    + checkAndParseFloat(that.new_late_fees) 
                    - checkAndParseFloat(that.collected_amount);
        }
    },
    
    isDollarType: function()
    {
        var that = this;
        return (that.deposit_type === "dollar");
    },  
    
    getDepositAmount: function()
    {
        var that = this;
        return (that.isDollarType() ? that.deposit_dollar_amount : that.deposit);
    },
    
    calculateDeposit: function()
    {
        var that = this;
        if(that.id === null)
        {
            that.deposit = null;
            if(that.deposit_type === 'percent')
            {
                if(that.deposit_percent !== null && that.total_amount > 0)
                {
                    that.collected_amount = that.deposit = roundIt((checkAndParseFloat((that.total_amount) + checkAndParseFloat(that.settings.service_fee) + that.total_tax) * checkAndParseFloat(that.deposit_percent))/100);
                    if(that.settings.cancellation_fee_same_as_deposit)
                    {
                        that.settings.cancellation_fee = that.deposit;
                    }
                }
                else
                {
                    that.collected_amount = 0;
                }
            }
            else
            {
                if(that.deposit_dollar_amount !== null)
                {
                    that.collected_amount = that.deposit_dollar_amount = parseFloat(that.deposit_dollar_amount);
                    if(that.settings.cancellation_fee_same_as_deposit)
                    {
                        that.settings.cancellation_fee = that.deposit_dollar_amount;
                    }
                }
            }
        }
    },
    
    calculateItemTaxes: function()
    {
        var that = this;
        for(var i = 0; i < that.items.length; i++)
        {
            that.items[i].setTax();
        }
    },
    
    calculateTotal: function()
    {
        var that = this;
        that.total_amount = 0;
        that.total_tax = 0;
        for(var i = 0; i < that.items.length; i++)
        {
            var item = that.items[i];
            that.total_amount   += item.getExtPrice();
            that.total_tax    += item.tax;
        }
        that.calculateDeposit();
    },
    
    addItem: function(item, calcTax)
    {
        this.items.push(item);
        //that.calculateTotal();
    },
    
    getItemByItemId: function(item_id)
    {
        var item = null;
        if(item_id !== null)
        {
            var that = this;
            for(var i = 0; i < that.items.length; i++)
            {
                if(that.items[i].item_id === item_id)
                {
                    item = that.items[i];
                    break;
                }
            }
        }
        return item;
    },
    
    toScheduledPayment: function(date, amount)
    {
        var pmt =  new LayawayScheduledPayment();
        pmt.date = date;
        pmt.setAmount(amount);
        pmt.setAmountUnpaid();
        return pmt;
    },
    
    addPayment: function(pmt)
    {
        var that = this;
        that.payments.push(pmt);
        that.collected_amount += pmt.amount;
    },
    
    addLineFromProduct: function(product, callback) {
        if(typeof callback === 'undefined') {
                callback = function() {};
        }

        var that = this;
        for(var i = 0; i < this.items.length; i++) {
            if(this.items[i].item_id == product.product_store_location_rel_id) {
                    $.growlUI('Oops <i class="fa fa-exclamation text-danger"></i>', 'This item is already on the list');
                    return false;
            }
        }

        var item = Object.create(LayawayItem.prototype);
        item.item_id    = product.product_store_location_rel_id;
        item.setPrice(product.sale_price_item);
        if(item.price === 0)
        {
            item.setPrice(product.price_item);
        }
        item.label      = product.title;
        item.quantity   = 1;
        item.bitmap_tax = product.bitmap_tax;
        item.taxes      = that.settings.taxes;
///            // check to see if this item is already
        for(var i = 0; i < that.items.length; i++) {
                if(this.items[i].item_id == item.item_id) {
                        $.growlUI('Oops <i class="fa fa-exclamation text-danger"></i>', 'This item is already on the list');
                        return false;
                }
        }
        //var ret = that.addItem(item);
        that.items.push(item);
        that.calculateItemTaxes();
        that.calculateTotal();
        that.calculatePayment();
        //return ret;
    },
    
    load: function(callback)
    {
        var that = this; 	
        var url  = "/pos-app/api/layaway/layaways.proc.php?layid="+that.id;
        $.blockUI({});
        $.getJSON(url)
        .done(function( data ) {
            that.setProperties(data.layaway);
            that.setItems(data.layaway.items);
            that.setScheduledPayments((data.layaway.scheduled_payments));
            $.unblockUI({});
            callback();
        });
    },
    
    loadPmtsByType: function(callback)
    {
        var that = this; 	
        var url  = "/pos-app/api/layaway/layaways.proc.php?storeid="+that.store_id+"&layid="+that.id+"&pmts_by_type=1";
        $.blockUI({});
        $.getJSON(url)
        .done(function( data ) {
            that.payments_by_type = data.pmts;
            $.unblockUI({});
            callback();
        });
    },
    
    getItemsPrintContent: function()
    {
        var content = "<table class=\"table table-striped table-hover table-responsive\">"
                        + "             <tr>"
                        + "                 <th>Item</th>"
                        + "                 <th>Quantity</th>"
                        + "                 <th class=\"text-right\">Retail</th>"
                        + "                 <th class=\"text-right\">Total</th>"
                        + "             </tr>";
                
        var that = this;
        for(var i = 0; i < that.items.length; i++)
        {
            var item = that.items[0];
            var tr = "             <tr>"
                    + "                 <td>"+item.label+"</td>"
                    + "                 <td>"+item.quantity+"</td>"
                    + "                 <td class=\"text-right\">"+item.price.toFixed(2)+"</td>"
                    + "                 <td class=\"text-right\">"+item.getExtPrice().toFixed(2)+"</td>"
                    + "             </tr>";
            content += tr;         
        }
        content += "         </table>";
        return content;
    },
    
    getScheduledPaymentsPrintContent: function()
    {
        var content = "<table class=\"table table-striped table-hover table-responsive\">"
                        + "             <tr>"
                        + "                 <th>Payment Date</th>"
                        + "                 <th class=\"text-right\">Payment Amount</th>"
                        + "             </tr>";  
                
        var that = this;
        for(var i = 0; i < that.scheduled_payments.length; i++)
        {
            var pmt = that.scheduled_payments[0];
            var tr = "             <tr>"
                    + "             <tr>"
                    + "                 <td>&nbsp;&nbsp;&nbsp;"+pmt.getDate()+"</td>"
                    + "                 <td class=\"text-right\">"+pmt.amount.toFixed(2)+"</td>"
                    + "             </tr>";
            content += tr;         
        }
        content += "         </table>";
        return content;
    },
    
    getServiceFeeLi: function()
    {
        var that = this;
        if(that.settings.service_fee !== null && that.settings.service_fee > 0)
        {
            return "<li >A <b>service fee</b> of <b>$ "+that.settings.service_fee.toFixed(2)+"</b> has been charged.</li>";
        }
        return "";
    },
    
    getCancellationFeeLi: function()
    {
        var that = this;
        if(that.settings.cancellation_fee !== null && that.settings.cancellation_fee > 0)
        {
            return "  A cancellation fee of $ "+that.settings.cancellation_fee.toFixed(2)+" will be applied.";
        }
        return "";
    },
    
    getRemainingBalanceTr: function()
    {
        var that = this;
        return "<tr>"
                + "  <td colspan=\"2\"></td>"
                + "  <td><b>Remaining Balance</b></td>"
                + "  <td class=\"text-right\">"+that.getRemainingBalance().toFixed(2)+"</td>"
                + "</tr>";
    },
    
    getServiceFeeTr: function()
    {
        var that = this;
        if(that.settings.service_fee !== null && that.settings.service_fee > 0)
        {
            return  + "                         <tr>"
                    + "                             <td colspan=\"2\"></td>"
                    + "                             <td><b>Service Fee</b></td>"
                    + "                             <td class=\"text-right\">"+that.settings.service_fee.toFixed(2)+"</td>"
                    + "                         </tr>";
        }
        return "";
    },

    getContractPrintContent: function()
    {
        var that = this;
        that.calculateTotal();
        return "<div><h3>Layaway Agreement</h3></div>"
                    + "<br/>"
                    + "     <div>"
                    + "         <span ng-show=\"selected_layaway.items.length > 1\">"
                    + "             The following items have been placed on layaway."  
                    + "         </span>" 
                    + "         <span ng-show=\"selected_layaway.items.length == \">"
                    + "             The following item has been placed on layaway."  
                    + "         </span>"
                    + "         <br/><br/>"
                    +           that.getItemsPrintContent()
                    + " </div>"
                    + " <br/>"
                    + "         <div>"
                    + "             <ul>"
                    + "                 <li>A deposit of <b>$ "+that.deposit.toFixed(2)+"</b> has been collected.</li>"
                    +                   that.getServiceFeeLi()
                    + "                 <li>The remaining balance of <b>$ "+that.getRemainingBalance().toFixed(2)+"</b> is due by <b>"+that.pickup_date+"</b>.  Upon which the item(s) will be available for pick up.</li>"
                    + "                 <li>Payments are made on a <b>"+that.payment_interval.toLowerCase()+"</b> basis, and subject to the payment schedule below.</li>"
                    + "                 <li>The <b>first payment</b> is due on <b>"+that.next_payment_date+"</b>.</li>"
                    + "                 <li>A <b>late fee</b> of <b>"+that.settings.late_fee+" will be assessed to each late payment.</li>"
                    + "                 <li>The layaway will be canceled if a payment is late for more than 10 days." + that.getCancellationFeeLi() +"</li>"
                    + "             </ul>"
                    + "         </div>" 
                    + " <br/>"
                    + " <div>"
                    +       that.getScheduledPaymentsPrintContent()
                    + " </div>"
                    + " <br/>"
                    + " <div>"
                    + "             <div class=\"panel-heading\">Summary</div>"
                    + "                 <table class=\"table panel_body\">"
                    + "                     <tr>"
                    + "                         <td colspan=\"2\"></td>"
                    + "                         <td><b>Item(s) Total Amount</b></td>"
                    + "                         <td class=\"text-right\">"+that.total_amount.toFixed(2)+"</td>"
                    + "                     </tr>"
                    + "                     <tr>"
                    + "                         <td colspan=\"2\"></td>"
                    + "                         <td><b>Deposit</b></td>"
                    + "                         <td class=\"text-right\">-"+that.deposit.toFixed(2)+"</td>"
                    + "                     </tr>"
                    +                       that.getServiceFeeTr()
                    +                       that.getRemainingBalanceTr()
                    + "                 </table>"
                    + "         </div>"
                    + " <br/>"
                    + " <div>"
                    + "         I understand and accept terms of this layaway agreement."    
                    + "         <br/><br/><br/>"    
                    + "         Customer Signature ____________________________________________&nbsp;&nbsp;&nbsp;&nbsp;Date___________________"    
                    + "</div>";
    },

    getPaymentReceiptContent: function()
    {
        var that = this;
        return "<br/><br/><div>"
                + " <table>"
                + "     <tr>"
                + "         <td>Layaway</td><td>#"+that.layaway_number+"</td>"
                + "     </tr>"
                + "     <tr>"
                + "         <td>Remaining Balance</td><td>$"+that.getRemainingBalance().toFixed(2)+"</td>"
                + "     </tr>"
                + "     <tr>"
                + "         <td>Next Payment Date</td><td>"+that.next_payment_date+"</td>"
                + "     </tr>"
                + "     <tr>"
                + "         <td>Next Payment Amount</td><td>$"+that.next_payment.amount_unpaid.toFixed(2)+"</td>"
                + "     </tr>"
                + " </table>"
                + "</div>";
    },
    
    setProperties: function(row)
    {
        var that = this;
        that.id  = row.id;
        that.store_id = row.store_id;
        that.store_location_id = row.store_location_id;
        that.pos_customer_id = row.pos_customer_id;
        that.customer_name = row.customer_name;
        that.date = row.date;
        that.notes = row.notes;
        //that.total_tax = checkAndParseFloat(row.total_tax);
        that.payment_interval = row.payment_interval;
        that.layaway_number = row.layaway_number;
        var next = moment(row.next_payment_date);
        that.next_payment_date = next.format('M/D/YYYY');
        that.next_payment.date = next.format('M/D/YYYY');
        that.next_payment.amount    = row.next_payment_amount;
        that.next_payment.id = row.next_payment_id;
        that.setStatus(row.status, next);
        that.setPickupDate(row.pickup_date);
        that.pickup_time = row.pickup_time;
        that.description = row.description;
        that.settings.service_fee = checkAndParseFloat(row.service_fee);
        that.settings.cancellation_fee = checkAndParseFloat(row.cancellation_fee);
        that.settings.late_fee = checkAndParseFloat(row.late_fee);
        that.late_fees = checkAndParseFloat(row.late_fees);
        that.unpaid_balance = checkAndParseFloat(row.unpaid_balance);
        that.deposit = checkAndParseFloat(row.deposit);
        that.collected_amount = checkAndParseFloat(row.collected_amount);
    },
    
    setLayaway: function(layaway)
    {
        var that = this;
        that.setProperties(layaway);
        that.setItems(layaway.items);
        that.setScheduledPayments(layaway.scheduled_payments);
        that.calculateTotal();
    },
    
    validate: function()
    {
        var that = this;
        if(that.customer_name === null)
        {
            return 'Customer Name Missing.';
        }
        if(that.pickup_date === null)
        {
            return 'Pickup Date Missing.';
        }
        if(that.items.length === 0)
        {
            return 'No items to Layaway.';
        }
        if(that.settings.minimum_purchase_amount !== null)
        {
            if(that.settings.minimum_purchase_per === 'item')
            {
                for(var p = 0; p < that.items.length; p++)
                {
                    if(that.items[p].price < that.settings.minimum_purchase_amount)
                    {
                        return 'One or more items retail price is less than the minumum layaway item price requirement of $' + parseFloat(that.settings.minimum_purchase_amount).toFixed(2) + '.';
                    }
                }
            }
            else
            {
                if(that.total_amount < that.settings.minimum_purchase_amount)
                {
                    return 'Total layaway amount is less than the minumum layaway amount requirement of $' + parseFloat(that.settings.minimum_purchase_amount).toFixed(2) + '.';
                }
            }
        }
        return true;
    },
    
    save: function(callback)
    {
        $.blockUI({});
        var that = this;
        if(that.next_payment !== null)
        {
            that.next_payment_date = that.next_payment.date;
            that.next_payment_amount = that.next_payment.amount_unpaid;
        }
        $.post("/pos-app/api/layaway/layaways.proc.php", JSON.stringify(this), function(response){
            callback(response.new_layaway.layaway_id, response.new_layaway.layaway_number);
            $.unblockUI({});
         });
    },
    
    getPrintString: function()
    {
        var that = this;
        return "<div>"
                + that.customer_name
                + "</div>";
    }
};

function TestItem() {
    
    var that = this;
    that.id = null;
    that.item_id = null;
    that.layaway_id = null;
    that.label = null;
    that.price = 0;
    that.quantity = 1;
    that.tax = 0;
    that.type = 'product'
    that.serial_number = false;
    that.reward_eligible = false;
    that.discount_eligible = true;
}

TestItem.prototype = {
    
    id: null,
    item_id: null,
    layaway_id: null,
    label: null,
    price: 0,
    quantity: 1,
    image: null,
    bitmap_tax: null,
    type: null,
    tax: 0,
    taxes: [],
    serial_number: false,
    reward_eligible: false,
    discount_eligible: true,
    wholesale: null,

    getExtPrice: function()
    {
        var that = this;
        return that.price * that.quantity;
    },
    
    getTotal: function()
    {
        var that = this;
        return (that.price * that.quantity) + that.tax;
    },
    
    setPrice: function(price)
    {
        if(!isNaN(price))
        {
            var that = this;
            that.price = parseFloat(price);
        }
    },
    
    setTax: function()
    {
        var that = this;
        that.tax = 0;
        for (key in that.taxes) {
            if ( (key & that.bitmap_tax) > 0) {
                that.tax += Math.round((parseFloat(that.taxes[key]) * (that.getExtPrice()))*100)/100;
            }
        }
    }
};



