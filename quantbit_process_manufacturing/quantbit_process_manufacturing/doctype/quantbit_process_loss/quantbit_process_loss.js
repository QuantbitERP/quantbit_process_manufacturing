// Copyright (c) 2024, abhishek shinde and contributors
// For license information, please see license.txt

frappe.ui.form.on('Quantbit Process Loss', {
	// refresh: function(frm) {

	// }
});
frappe.ui.form.on('Quantbit Process Loss', {
    onload: function(frm) {
        frm.call({
            method:'set_diffaccount',
            doc:frm.doc
        })
    }
});

frappe.ui.form.on('Quantbit Process Loss', {
    set_source_warehouse(frm) {
        if (frm.doc.set_source_warehouse){
            frm.doc.process_loss_details.forEach(function(i){
                i.source_warehouse = frm.doc.set_source_warehouse;
            });
           
        } frm.refresh_field('process_loss_details');
    }
});

frappe.ui.form.on('Details Process Loss', {
    item_code: function(frm, cdt, cdn) {
        var child = locals[cdt][cdn];
        if (frm.doc.set_source_warehouse) {
            frappe.model.set_value(child.doctype, child.name, 'source_warehouse', frm.doc.set_source_warehouse);
        }
        frm.refresh_field('process_loss_details');
    }
});



frappe.ui.form.on('Quantbit Process Loss', {
    account(frm) {
        if (frm.doc.account){
            frm.doc.process_loss_details.forEach(function(i){
                i.account = frm.doc.account;
            });
           
        } frm.refresh_field('process_loss_details');
    }
});

frappe.ui.form.on('Details Process Loss', {
    item_code: function(frm, cdt, cdn) {
        var child = locals[cdt][cdn];
        if (frm.doc.account) {
            frappe.model.set_value(child.doctype, child.name, 'account', frm.doc.account);
        }
        frm.refresh_field('process_loss_details');
    }
});