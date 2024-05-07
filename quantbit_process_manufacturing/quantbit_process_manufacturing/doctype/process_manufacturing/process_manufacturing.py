# Copyright (c) 2024, abhishek shinde and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class ProcessManufacturing(Document):
	@frappe.whitelist()
	def check_yield(self, child_table_name, field_name):
		total = 0
		for row in self.get(child_table_name):
			field_value = row.get(field_name)
			if field_value is not None and isinstance(field_value, (int, float)):
				total += field_value
		if total > 100:
			frappe.throw("Yield value cannot be greater than 100%")
	
	
	@frappe.whitelist()
	def update_yield_per(self, child_table_name, field_name_1, field_name_2):		
		total = 0
		for row in self.get(child_table_name):
			field_value = row.get(field_name_1)
			if field_value is not None and isinstance(field_value, (int, float)):
				total += field_value
		
		if total != 0:
			for row in self.get(child_table_name):
				field_value_1 = row.get(field_name_1)
				if field_value_1 is not None and isinstance(field_value_1, (int, float)):
					row.set(field_name_2, (field_value_1 / total) * 100)
	
		else:
			frappe.throw("Total is zero. Cannot calculate yield percentage.")
		self.check_yeild_for_all_table("scrap","finished_products",field_name_2)
		
		

	@frappe.whitelist()
	def get_total_of_any_field(self, child_table_name, child_field_name, parent_field_name):
		total = 0
		for row in self.get(child_table_name):
			field_value = row.get(child_field_name)
			if field_value is not None and isinstance(field_value, (int, float)):
				total += field_value
		if total > 0:
			self.set(parent_field_name, total)
		self.get_out_qty_and_amt()
		self.get_difference_qty_and_amt()
   
	@frappe.whitelist()
	def get_yield_per_according_item(self, curr_child_table_name, curr_field_name_1, curr_field_name_2,parent_field_name):
		qrty_totral=self.get(parent_field_name)
		if qrty_totral != 0:
			for row in self.get(curr_child_table_name):
				field_value_1 = row.get(curr_field_name_1)
				if field_value_1 is not None and isinstance(field_value_1, (int, float)):
					row.set(curr_field_name_2, (field_value_1 / qrty_totral) * 100)
		else:
			frappe.throw("Total is zero. Cannot calculate yield percentage.")
		self.check_yeild_for_all_table("scrap","finished_products",curr_field_name_2)
  
	def check_yeild_for_all_table(self, child_table_name_1,child_table_name_2, field_name):
		total = 0
		for i in [child_table_name_1,child_table_name_2]:
			for row in self.get(i):
				field_value = row.get(field_name)
				if field_value is not None and isinstance(field_value, (int, float)):
					total += field_value
		if total > 100:
			frappe.throw("Yield value cannot be greater than 100%")

	def get_out_qty_and_amt(self):
		self.all_finish_qty=self.scrap_qty+self.finished_products_qty
		self.total_all_amount=self.scrap_amount+self.finished_products_amount
  
	def get_difference_qty_and_amt(self):
		if(self.all_finish_qty and self.materials_qty):
			self.diff_qty=self.all_finish_qty-self.materials_qty
		self.diff_amt=float(self.materials_amount+self.total_operation_cost)-float(self.total_all_amount)
  

	@frappe.whitelist()
	def set_warehouses(self):
		warehouses = frappe.get_all("Quantbit Process Manufacturing Setting",
									filters={"name": self.company},
									fields=["source_warehouse", "target_warehouse", "scrap_warehouse", "wip_warehouse"])

		if warehouses:
			warehouse_info = warehouses[0] 
			self.set_source_warehouse = warehouse_info.get("source_warehouse")
			self.set_target_warehouse = warehouse_info.get("target_warehouse")
			self.set_target = warehouse_info.get("scrap_warehouse")
			self.wip_warehouse = warehouse_info.get("wip_warehouse")


	@frappe.whitelist()
	def calculate_recovery(self):
		# frappe.throw("hiii")
		total_qty = self.materials_qty
		for j in self.get("finished_products"):
			j.recovery = (j.quantity/total_qty)


	def on_submit(self):
		self.manufacturing_stock_entry()
  
	def manufacturing_stock_entry(self):
		for k in ["finished_products"]:
			for i in self.get(k):
				doc = frappe.new_doc("Stock Entry")
				doc.stock_entry_type = "Manufacture"
				doc.company = self.company
				doc.set_posting_time = True
				doc.posting_date =self.date
				if(i.quantity>0):
					for j in self.get("materials"):
						doc.append("items", {
						"s_warehouse":j.source_warehouse,
						"item_code": j.item,
						"qty":(j.quantity *i.quantity)/100 
						})
					doc.append("items", {
						"t_warehouse":i.target_warehouse,
						"item_code": i.item,
						"qty":i.quantity,
						"is_finished_item":True
					})
					for o in self.get("operation_cost"):
						if self.operation_cost:
							doc.append("additional_costs", {
							"expense_account": o.operations,
							"description":o.description,
							"amount": (i.yeild* o.cost)/100,
					
				})
				doc.custom_process_manufacturing = self.name
				doc.insert()
				doc.save()
				doc.submit()