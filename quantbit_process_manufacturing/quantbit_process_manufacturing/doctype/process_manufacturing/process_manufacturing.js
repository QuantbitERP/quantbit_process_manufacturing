frappe.ui.form.on('Process Manufacturing', {
    onload: function(frm) {
        frm.call({
            method:'set_warehouses',
            doc:frm.doc
        })
    }
});

frappe.ui.form.on('Process Manufacturing Raw Material', {
    yeild: async function(frm) {
        await frm.call({
            method: "check_yield",
            doc: frm.doc,
            args: {
                child_table_name: "materials",
                field_name: "yeild"
            }
        });
    },	
    quantity: async function(frm) {
        await frm.call({
            method: "update_yield_per",
            doc: frm.doc,
            args: {
                child_table_name: "materials",
                field_name_1: "quantity",
                field_name_2: "yeild"
            }
        });
        await frm.call({
            method: "get_total_of_any_field",
            doc: frm.doc,
            args: {
                child_table_name: "materials",
                child_field_name: "quantity",
                parent_field_name: "materials_qty"
            }
        });
    },

    amount: async function(frm) {
        await frm.call({
            method: "get_total_of_any_field",
            doc: frm.doc,
            args: {
                child_table_name: "materials",
                child_field_name: "amount",
                parent_field_name: "materials_amount"
            }
        });
    }
});

frappe.ui.form.on('Process Manufacturing Operation Cost', {
    cost: async function(frm) {
        await frm.call({
            method: "get_total_of_any_field",
            doc: frm.doc,
            args: {
                child_table_name: "operation_cost",
                child_field_name: "cost",
                parent_field_name: "total_operation_cost"
            }
        });
    }
});


frappe.ui.form.on('Process Manufacturing Finished Products', {
    yeild: async function(frm) {
        await frm.call({
            method: "check_yield",
            doc: frm.doc,
            args: {
                child_table_name: "finished_products",
                field_name: "yeild"
            }
        });
    },	
    quantity: async function(frm,cdt,cdn) {
		var child=locals[cdt][cdn]
        await frm.call({
            method: "get_yield_per_according_item",
            doc: frm.doc,
            args: {
                curr_child_table_name: "finished_products",
                curr_field_name_1: "quantity",
                curr_field_name_2: "yeild",
				parent_field_name:"materials_qty"
            }
        });
        await frm.call({
            method: "get_total_of_any_field",
            doc: frm.doc,
            args: {
                child_table_name: "finished_products",
                child_field_name: "quantity",
                parent_field_name: "finished_products_qty"
            }
        });
    },

    amount: async function(frm) {
        await frm.call({
            method: "get_total_of_any_field",
            doc: frm.doc,
            args: {
                child_table_name: "finished_products",
                child_field_name: "amount",
                parent_field_name: "finished_products_amount"
            }
        });
    }
});




frappe.ui.form.on('Process Manufacturing Scrap Item', {
    yeild: async function(frm) {
        await frm.call({
            method: "check_yield",
            doc: frm.doc,
            args: {
                child_table_name: "scrap",
                field_name: "yeild"
            }
        });
    },	
    quantity: async function(frm,cdt,cdn) {
		var child=locals[cdt][cdn]
        await frm.call({
            method: "get_yield_per_according_item",
            doc: frm.doc,
            args: {
                curr_child_table_name: "scrap",
                curr_field_name_1: "quantity",
                curr_field_name_2: "yeild",
				parent_field_name:"materials_qty"
            }
        });
        await frm.call({
            method: "get_total_of_any_field",
            doc: frm.doc,
            args: {
                child_table_name: "scrap",
                child_field_name: "quantity",
                parent_field_name: "scrap_qty"
            }
        });
    },

    amount: async function(frm) {
        await frm.call({
            method: "get_total_of_any_field",
            doc: frm.doc,
            args: {
                child_table_name: "scrap",
                child_field_name: "amount",
                parent_field_name: "scrap_amount"
            }
        });
    }
});




frappe.ui.form.on('Process Manufacturing', {
    set_source_warehouse(frm) {
        if (frm.doc.set_source_warehouse){
            frm.doc.materials.forEach(function(i){
                i.source_warehouse = frm.doc.set_source_warehouse;
            });
           
        } frm.refresh_field('materials');
    }
});

frappe.ui.form.on('Process Manufacturing Raw Material', {
    item: function(frm, cdt, cdn) {
        var child = locals[cdt][cdn];
        if (frm.doc.set_source_warehouse) {
            frappe.model.set_value(child.doctype, child.name, 'source_warehouse', frm.doc.set_source_warehouse);
        }
        frm.refresh_field('materials');
    }
});

frappe.ui.form.on('Process Manufacturing', {
    set_target_warehouse(frm) {
        if (frm.doc.set_target_warehouse){
            frm.doc.finished_products.forEach(function(i){
                i.target_warehouse = frm.doc.set_target_warehouse;
            });
           
        } frm.refresh_field('finished_products');
    }
});

frappe.ui.form.on('Process Manufacturing Finished Products', {
    item: function(frm, cdt, cdn) {
        var child = locals[cdt][cdn];
        if (frm.doc.set_target_warehouse) {
            frappe.model.set_value(child.doctype, child.name, 'target_warehouse', frm.doc.set_target_warehouse);
        }
        frm.refresh_field('finished_products');
    }
});

frappe.ui.form.on('Process Manufacturing', {
    set_target(frm) {
        if (frm.doc.set_target_warehouse){
            frm.doc.scrap.forEach(function(i){
                i.target_warehouse = frm.doc.set_target;
            });
           
        } frm.refresh_field('scrap');
    }
});

frappe.ui.form.on('Process Manufacturing Scrap Item', {
    item: function(frm, cdt, cdn) {
        var child = locals[cdt][cdn];
        if (frm.doc.set_target) {
            frappe.model.set_value(child.doctype, child.name, 'target_warehouse', frm.doc.set_target);
        }
        frm.refresh_field('scrap');
    }
});



frappe.ui.form.on('Process Manufacturing Finished Products', {
	quantity: function(frm,cdt,cdn) {
		frm.call({
			method:'calculate_recovery',
			doc:frm.doc
		})
	}
});

