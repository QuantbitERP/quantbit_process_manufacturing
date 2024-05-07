# Copyright (c) 2024, abhishek shinde and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class QuantbitProcessLoss(Document):
	
	@frappe.whitelist()
	def set_diffaccount(self):
		account = frappe.get_value("Quantbit Process Manufacturing Setting",
									{"name": self.company},
									"set_default_account")

		if account:
			self.account = account



	def on_submit(self):
		self.proces_loss()

	

	# After Submitting  Quantbit Process Loss Stock Entry of Scrap Information will be created 
	@frappe.whitelist()
	def proces_loss(self):
		doc = frappe.new_doc("Stock Entry")
		doc.stock_entry_type = "Process Loss"
		doc.company = self.company
		doc.set_posting_time = True
		doc.posting_date =self.posting_date
		for i in self.get("process_loss_details"):
			doc.append("items", {
				"s_warehouse": i.source_warehouse,
				"item_code": i.item_code,
				"item_name": i.item_name,
				"qty": i.qty,
				"expense_account":i.account,
				
			})
		if doc.items:
			doc.custom_quantbit_process_loss = self.name
			doc.insert()
			doc.save()
			doc.submit()
