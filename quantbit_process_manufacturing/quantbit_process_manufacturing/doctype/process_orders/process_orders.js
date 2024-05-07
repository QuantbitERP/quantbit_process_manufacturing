// Copyright (c) 2024, abhishek shinde and contributors
// For license information, please see license.txt

frappe.ui.form.on('Process Order Raw Material', {
	quantity: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		var total1 = 0;
		frm.doc.materials.forEach(function (d) { total1 += d.quantity })
		frm.set_value('materials_qty', total1)
		refresh_field('materials_qty')
	},
	amount: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		var total1 = 0;
		frm.doc.materials.forEach(function (d) { total1 += d.amount })
		frm.set_value('materials_amount', total1)
		refresh_field('materials_amount')
	},
	materials_remove: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		var totalQty = 0;
		var totalAmt = 0;
		frm.doc.materials.forEach(function (d) {
			totalQty += d.quantity
			totalAmt += d.amount
		})
		frm.set_value('materials_qty', totalQty)
		frm.set_value('materials_amount', totalAmt)
		refresh_field(['materials_qty', 'materials_amount'])
	}
});

frappe.ui.form.on('Process Order Operation Cost', {
	cost: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		var total1 = 0;
		frm.doc.operation_cost.forEach(function (d) { total1 += d.cost })
		frm.set_value('total_operation_cost', total1)
		refresh_field('total_operation_cost')
	},

	operation_cost_remove: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		var total1 = 0;
		frm.doc.operation_cost.forEach(function (d) { total1 += d.cost })
		frm.set_value('total_operation_cost', total1)
		refresh_field('total_operation_cost')
	},
});

frappe.ui.form.on('Process Order Finished Products', {
	quantity: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		var total1 = 0;
		frm.doc.finished_products.forEach(function (d) { total1 += d.quantity })
		frm.set_value('finished_products_qty', total1)
		refresh_field('finished_products_qty')
	},
	amount: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		var total1 = 0;
		frm.doc.finished_products.forEach(function (d) { total1 += d.amount })
		frm.set_value('finished_products_amount', total1)
		refresh_field('finished_products_amount')
	},

	finished_products_remove: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		var totalQty = 0;
		var totalAmt = 0;
		frm.doc.finished_products.forEach(function (d) {
			totalQty += d.quantity
			totalAmt += d.amount

		})
		frm.set_value('finished_products_qty', totalQty)
		frm.set_value('finished_products_amount', totalAmt)
		refresh_field(['finished_products_qty', 'finished_products_amount'])
	},
});

frappe.ui.form.on('Process Order Scrap Item', {
	amount: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		var total1 = 0;
		frm.doc.scrap.forEach(function (d) { total1 += d.amount })
		frm.set_value('scrap_amount', total1)
		// frm.set_value('total_all_amount',total1)
		// frm.set_value('diff_amt',-1*total1)
		refresh_field(['scrap_amount', 'total_all_amount', 'diff_amt'])
	},
	quantity: function (frm) {
		var total1 = 0;
		frm.doc.scrap.forEach(function (d) { total1 += d.quantity })
		frm.set_value('scrap_qty', total1)
		refresh_field('scrap_qty')
	},

	scrap_remove: function (frm, cdt, cdn) {
		var d = locals[cdt][cdn]
		var totalAmt = 0;
		var totalQty = 0;
		frm.doc.scrap.forEach(function (d) {
			totalAmt += d.amount
			totalQty += d.quantity
		})
		frm.set_value('scrap_qty', totalQty)
		frm.set_value('scrap_amount', totalAmt)
		// frm.set_value('total_all_amount',totalAmt)
		// frm.set_value('diff_amt',-1*totalAmt)
		refresh_field(['scrap_amount', 'total_all_amount', 'diff_amt', 'scrap_qty'])
	},
});

frappe.ui.form.on('Process Orders', {
	process_definitions: function (frm) {
		frm.call({
			method: 'get_data',
			doc: frm.doc
		})
	}
})

frappe.ui.form.on('Process Orders', {
	refresh: function (frm) {
		if (frm.doc.docstatus === 1 && frm.doc.start_button_flag === 1) {
			frm.add_custom_button(__('Start'), function () {
				frm.events.start_button(frm);
			}).addClass('btn-primary')
		}
		if (frm.doc.docstatus === 1 && frm.doc.finish_button_flag === 1) {
			frm.add_custom_button(__('Finish'), function () {
				frm.events.finish_button(frm);
			}).addClass('btn-danger');
		}

	},


	start_button: function (frm) {
		frm.call({
			method: 'add_materials_stock_entry',
			doc: frm.doc,
			callback: function (response) {
				if (response) {
					frm.remove_custom_button('Start');
				}
			}
		})

	},

	finish_button: function (frm) {
		frm.call({
			method: 'add_manufacture_stock_entry',
			doc: frm.doc,
			callback: function (response) {
				if (response.docs[0].start_button_flag==0) {
					frm.remove_custom_button('Finish');
				}
			}

		})
	}
});

// set sum of updated quantities from finished products table 

frappe.ui.form.on('Process Orders', {
	materials_qty: function (frm) {
		let total_qty = 0
		frm.call({
			method: "get_total_qty",
			doc: frm.doc,
			callback: function (r) {
				frm.doc.finished_products.forEach(function (d) { total_qty += d.quantity })
				frm.set_value("finished_products_qty", total_qty)
				refresh_field(["finished_products", "scrap", "finished_products_qty"])
				console.log(total_qty)
			}
		})


	}
})












