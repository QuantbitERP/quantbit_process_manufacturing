// Copyright (c) 2024, abhishek shinde and contributors
// For license information, please see license.txt

frappe.ui.form.on("Process Definition Raw Material", {
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
 
 frappe.ui.form.on("Process Definition Operation Cost",{
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