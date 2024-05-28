// Copyright (c) 2024, abhishek shinde and contributors
// For license information, please see license.txt

function change_date(frm){
	// console.log(frm.doc.materials+"=="+frm.doc.scrap)
	if(frm.doc.materials){
		frm.doc.materials.forEach(row=>{
			row.date = frm.doc.date
		})
	}
	if(frm.doc.store_materials_consumables){
	frm.doc.store_materials_consumables.forEach(row=>{
		row.date = frm.doc.date
	})
	}
	if(frm.doc.operation_cost){
		frm.doc.operation_cost.forEach(row=>{
			row.date = frm.doc.date
		})
	}
	if(frm.doc.finished_products){
	frm.doc.finished_products.forEach(row=>{
		row.date = frm.doc.date
	})
	}
	if(frm.doc.scrap){
		frm.doc.scrap.forEach(row=>{
			row.date = frm.doc.date
		})
	}
	

}

function set_data(frm) {
	if (frm.doc.materials) {
		frm.doc.materials.forEach(row => {
			row.season = frm.doc.season
		});
		frm.doc.materials.forEach(row => {
			row.cost_center = frm.doc.cost_center
		});
		frm.doc.materials.forEach(row => {
			row.branch = frm.doc.branch
			// console.log(frm.doc.branch)
		});
	}
}

frappe.ui.form.on("Process Definitions",{
	setup:function(frm){
		frm.set_query("cost_center", function (doc, cdt, cdn) { // Replace with the name of the link field
			return {
				filters: {
					"company": frm.doc.company
				}
			};
		});
		frm.set_query("branch", function (doc, cdt, cdn) { // Replace with the name of the link field
			return {
				filters: {
					"company": frm.doc.company
				}
			};
		});
	},
	season: function (frm) {
		set_data(frm)
	},
	cost_center: function (frm) {
		set_data(frm)
	},
	branch: function (frm) {
		set_data(frm)
	},
	
	refresh:function(frm){
		change_date(frm)
		set_data(frm)
	},
	date:function(frm){change_date(frm)},
})

frappe.ui.form.on("Process Definition Raw Material", {
	materials_add:function(frm){
		change_date(frm)
		set_data(frm)
	},
	quantity:function(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	var total1 = 0;
	frm.doc.materials.forEach(function(d) { total1 += d.quantity; });
	frm.set_value("total_quantity", total1);
	refresh_field("total_quantity");
  },
  materials_remove:function(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	var total1 = 0;
	frm.doc.materials.forEach(function(d) { total1 += d.quantity; });
	frm.set_value("total_quantity", total1);
	refresh_field("total_quantity");
   }
 });

 frappe.ui.form.on('Store Materials Consumables',{
	store_materials_consumables_add:function(frm){change_date(frm)}
})
 
 frappe.ui.form.on("Process Definition Operation Cost",{
	operation_cost_add:function(frm){change_date(frm)},
	cost: function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		var total1 = 0;
		frm.doc.operation_cost.forEach(function(d){total1+=d.cost;})
		frm.set_value("total_operation_cost",total1)
		refresh_field("total_operation_cost")
	},
	operation_cost_remove: function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		var total1 = 0;
		frm.doc.operation_cost.forEach(function(d){total1+=d.cost;})
		frm.set_value("total_operation_cost",total1)
		refresh_field("total_operation_cost")
	}
 })

 frappe.ui.form.on("Process Definition Finished Products", {
	finished_products_add:function(frm){change_date(frm)},
	quantity:function(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	var total1 = 0;
	frm.doc.finished_products.forEach(function(d) { total1 += d.quantity; });
	frm.set_value("finished_products_qty", total1);
	refresh_field("finished_products_qty");
  },

   amount:function(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	var total1 = 0;
	frm.doc.finished_products.forEach(function(d) { total1 += d.amount; });
	frm.set_value("finished_products_amount", total1);
	refresh_field("finished_products_amount");
  },

  finished_products_remove: function(frm, cdt, cdn) {
	var totalQty = 0;
	var totalAmount = 0;
	frm.doc.finished_products.forEach(function(d) {
		totalQty += d.quantity;
		totalAmount += d.amount;
	});
	frm.set_value("finished_products_qty", totalQty);
	frm.set_value("finished_products_amount", totalAmount);
	refresh_field(["finished_products_qty", "finished_products_amount"]);
}
 });

 frappe.ui.form.on("Process Definition Scrap Item",{
	scrap_add:function(frm){change_date(frm)},
	amount: function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		var total1 = 0;
		frm.doc.scrap.forEach(function(d){total1+=d.amount;})
		frm.set_value("scrap_amount",total1)
		frm.set_value("total_all_amount",total1)
		frm.set_value("diff_amt",-1*total1)
		refresh_field(["scrap_amount","total_all_amount","diff_amt"])
	},
	quantity: function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		var total1 = 0;
		frm.doc.scrap.forEach(function(d){total1+=d.quantity;})
		frm.set_value("scrap_qty",total1)
		refresh_field("scrap_qty")
	},
	scrap_remove: function(frm,cdt,cdn){
		var d = locals[cdt][cdn];
		var totalAmt = 0;
		var totalQty = 0;
		frm.doc.scrap.forEach(function(d){
			totalAmt+=d.amount;
			totalQty+=d.quantity;
		})
		frm.set_value("scrap_qty",totalQty)
		frm.set_value("scrap_amount",totalAmt)
		frm.set_value("total_all_amount",totalAmt)
		frm.set_value("diff_amt",-1*totalAmt)
		refresh_field(["scrap_amount","total_all_amount","diff_amt","scrap_qty"])
	},
 })