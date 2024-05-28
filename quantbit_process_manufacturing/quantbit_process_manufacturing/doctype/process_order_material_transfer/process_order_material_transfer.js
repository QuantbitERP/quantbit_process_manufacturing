// Copyright (c) 2024, abhishek shinde and contributors
// For license information, please see license.txt

function set_data(frm) {
	if (frm.doc.items) {
		frm.doc.items.forEach(row => {
			row.season = frm.doc.season
		});
		frm.doc.items.forEach(row => {
			row.cost_center = frm.doc.cost_center
		});
		frm.doc.items.forEach(row => {
			row.branch = frm.doc.branch
			// console.log(frm.doc.branch)
		});
	}
}

frappe.ui.form.on('Process Order Material Transfer', {
	setup: function (frm) {
		if(frm.doc.items){
			frm.doc.items.forEach(row=>{
				row.date = frm.doc.date
			})
		}
		frm.set_query("item_code", "items", function (doc, cdt, cdn) { // Replace with the name of the link field
			var d = locals[cdt][cdn]
			// console.log(frm.doc.company)
			return {
				filters: {
					"company": frm.doc.company
				}
			};
		});
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
	date:function (frm) {
		if(frm.doc.items){
			frm.doc.items.forEach(row=>{
				row.date = frm.doc.date
			})
		}

	}
});

frappe.ui.form.on('Process Order Material Transfer Details', {
	onload:function(frm){
		frm.doc.items.forEach(row=>{
			row.date = frm.doc.date
		})
		set_data(frm)
	},
	items_add: function (frm,) {
		frm.doc.items.forEach(row => {
			row.date = frm.doc.date
		})
		set_data(frm)
	},
	source_warehouse: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		if (d.source_warehouse && d.item_code) {
			frm.call({
				method: 'get_available_qty',
				doc: frm.doc
			})
		}
	},
	item_code: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		if (d.source_warehouse && d.item_code) {
			frm.call({
				method: 'get_available_qty',
				doc: frm.doc
			})
		}
	},

});
