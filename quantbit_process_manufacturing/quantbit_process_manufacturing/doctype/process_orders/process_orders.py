import frappe
from frappe.model.document import Document

class ProcessOrders(Document):
	@frappe.whitelist()
	def get_data(self):
		if self.process_definitions:
			doc_name = frappe.get_value('Process Definitions', {'name': self.process_definitions}, "name")
			if doc_name:
				doc = frappe.get_doc('Process Definitions', doc_name)
				self.process_name = doc.process_name

				for d in doc.get("materials"):
					self.append('materials', {
						"item": d.item,
						"yeild": d.yeild,
						"rate": d.rate,
						"uom": d.uom,
						"quantity": d.quantity,
						"amount": d.amount,
						"item_name": d.item_name,
						"source_warehouse": d.source_warehouse,
					})
				self.materials_qty = doc.total_quantity
				self.materials_amount = doc.materials_amount

				for d in doc.get("operation_cost"):
					self.append('operation_cost', {
						"operations": d.operations,
						"description": d.description,
						"cost": d.cost
					})

				self.total_operation_cost = doc.total_operation_cost
				self.set_target_warehouse = doc.set_target_warehouse

				for d in doc.get("finished_products"):
					self.append('finished_products', {
						"item": d.item,
						"yeild": d.yeild,
						"rate": d.rate,
						"uom": d.uom,
						"quantity": d.quantity,
						"recovery": d.recovery,
						"amount": d.amount,
						"item_name": d.item_name,
						"target_warehouse": d.target_warehouse
					})
					self.finished_products_qty = doc.finished_products_qty
					self.finished_products_amount = doc.finished_products_amount
					self.set_target = doc.set_target

				for d in doc.get("scrap"):
					self.append('scrap', {
						"item": d.item,
						"yeild": d.yeild,
						"rate": d.rate,
						"uom": d.uom,
						"quantity": d.quantity,
						"amount": d.amount,
						"item_name": d.item_name,
						"target_warehouse": d.target_warehouse
					})
					self.scrap_qty = doc.scrap_qty
					self.scrap_amount = doc.scrap_amount
					self.diff_qty = doc.diff_qty
					self.all_finish_qty = doc.all_finish_qty
					self.total_all_amount = doc.total_all_amount
					self.diff_amt = doc.diff_amt
					self.set_source_warehouse = doc.set_source_warehouse
					self.wip_warehouse = doc.wip_warehouse
			else:
				frappe.msgprint("Process definitions not found")
				
		# Add Material Stock Entry
	@frappe.whitelist()
	def add_materials_stock_entry(self):
		doc = frappe.new_doc("Stock Entry")
		doc.stock_entry_type = "Material Transfer"
		for d in self.get("materials"):
			doc.append('items',{
				"item_code":d.item,
				"qty":d.quantity,
				"uom":d.uom,
				# "transfer_qty":0,
				# "conversion_factor":0,
				"s_warehouse":d.source_warehouse,
				"t_warehouse":self.wip_warehouse
			})   
		doc.custom_process_orders = self.name    
		doc.insert()
		doc.save()
		doc.submit()
		frappe.msgprint("Material transfer entry successfully inserted")
		frappe.db.set_value("Process Orders",self.name,"start_button_flag",0)

		
		# add Manufacture Stock Entry
	@frappe.whitelist()
	def add_manufacture_stock_entry(self):
		if self.start_button_flag == 0:
			for d in self.get("finished_products"):
				doc = frappe.new_doc("Stock Entry")
				doc.stock_entry_type = "Manufacture"
				
				for j in self.get("materials"):
					doc.append(
						"items",
						{
							"item_code": j.item,
							"qty": float(((self.materials_qty*d.quantity)/self.finished_products_qty)),
							"uom": j.uom,
							# "transfer_qty":0,
							# "conversion_factor":0,
							"s_warehouse": self.wip_warehouse,
							# "is_finished_item":True
						},
					)
				doc.append(
					"items",
					{
						"item_code": d.item,
						"qty": d.quantity,
						"uom": d.uom,
						# "transfer_qty":0,
						# "conversion_factor":0,
						"t_warehouse": d.target_warehouse,
						"is_finished_item": True,
					},
				)	
					# doc.insert()
					# doc.save()
					# doc.submit()
				for k in self.get("operation_cost"):
					doc.append("additional_costs",{
							"expense_account": k.operations,
							"description": k.description,
							"amount": (k.cost * d.quantity)/self.finished_products_qty,
						},
					)

				doc.custom_process_orders = self.name
				doc.insert()
				doc.save()
				doc.submit()
				frappe.msgprint("Manufacture entry successfully inserted")
				frappe.db.set_value("Process Orders", self.name, "finish_button_flag", 0)
		else:
			frappe.msgprint("Material Transfer stock entry should be done before manufacture stock entry")

	@frappe.whitelist()
	def get_total_qty(self):
		doc = frappe.get_doc('Process Definitions',self.process_definitions)
		pd_finished_products = doc.get('finished_products')
		pd_quantity = [d.quantity for d in pd_finished_products]
		idx=0
		for d in self.get("finished_products"):
			d.quantity = (self.materials_qty*pd_quantity[idx]/doc.total_quantity)
			idx=idx+1
		
		for d in self.get('scrap'):
			d.quantity = (self.scrap_qty*doc.quantity/doc.total_quantity)
			
