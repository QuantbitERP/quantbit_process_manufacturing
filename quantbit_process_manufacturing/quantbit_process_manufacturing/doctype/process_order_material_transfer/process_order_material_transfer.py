# Copyright (c) 2024, abhishek shinde and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class ProcessOrderMaterialTransfer(Document):
	def on_submit(self):
		self.add_materials_stock_entry()

	@frappe.whitelist()
	def get_available_qty(self):
		for i in self.get("items"):
			qty = frappe.get_value("Bin",{"item_code":i.item_code,"warehouse":i.source_warehouse},"actual_qty")
			if(qty):
				i.available_qty = qty
			else:
				frappe.throw(f"Item <strong>{i.item_code}</strong> is not present in <strong>{i.source_warehouse}</strong>")
			
	
	@frappe.whitelist()
	def add_materials_stock_entry(self):
		doc = frappe.new_doc("Stock Entry")
		doc.stock_entry_type = "Material Transfer"
		doc.set_posting_time = True
		doc.posting_date = self.date
		doc.posting_time = self.time
		# frappe.throw(str(doc.posting_date))
		doc.season = self.season
		doc.cost_center = self.cost_center
		for d in self.get("items"):
			doc.append('items',{
				"item_code":d.item_code,
				"qty":d.qty,
				"s_warehouse":d.source_warehouse,
				"t_warehouse":d.target_warehouse,
				"season":d.season,
				"branch":d.branch,
				"cost_center":d.cost_center
				
				
			})   
		doc.custom_process_order_material_transfer = self.name    
		doc.insert()
		doc.save()
		doc.submit()
		frappe.msgprint("Material transfer entry successfully inserted")

