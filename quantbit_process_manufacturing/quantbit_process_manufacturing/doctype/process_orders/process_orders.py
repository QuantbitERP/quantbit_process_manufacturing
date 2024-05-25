import frappe
from frappe.model.document import Document


class ProcessOrders(Document):
	def on_submit(self):
		if not self.is_material_transfer_required:
			self.add_manufacture_stock_entry()

	@frappe.whitelist()
	def get_data(self):
		if self.process_definitions:
			# doc_name = frappe.get_value('Process Definitions', {'name': self.process_definitions}, "name")
			# if doc_name:
			# frappe.msgprint("hello")
			doc = frappe.get_doc('Process Definitions', self.process_definitions)
			self.process_name = doc.process_name
			self.date = doc.date
			self.company = doc.company
			self.set_source_warehouse = doc.set_source_warehouse
			self.wip_warehouse = doc.wip_warehouse
			self.is_material_transfer_required = doc.is_material_transfer_required
			self.for_multiple_inputs = doc.for_multiple_inputs

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
					"date":self.date
				})
			for k in doc.get("store_materials_consumables"):
				self.append('store_materials_consumables', {
					"item": k.item,
					"yeild": k.yeild,
					"rate": k.rate,
					"uom": k.uom,
					"quantity": k.quantity,
					"amount": k.amount,
					"item_name": k.item_name,
					"source_warehouse": k.source_warehouse,
					"date":self.date
				})
			self.materials_qty = doc.total_quantity
			self.materials_amount = doc.materials_amount

			for e in doc.get("operation_cost"):
				self.append('operation_cost', {
					"operations": e.operations,
					"description": e.description,
					"cost": e.cost,
					"date":self.date
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
					"target_warehouse": d.target_warehouse,
					"date":self.date
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
					"target_warehouse": d.target_warehouse,
					"date":self.date
				})
				self.scrap_qty = doc.scrap_qty
				self.scrap_amount = doc.scrap_amount
				self.diff_qty = doc.diff_qty
				self.all_finish_qty = doc.all_finish_qty
				self.total_all_amount = doc.total_all_amount
				self.diff_amt = doc.diff_amt
				
		else:
			frappe.msgprint("Process definitions not found")
				
		# Add Material Stock Entry
	@frappe.whitelist()
	def add_materials_stock_entry(self):
		doc = frappe.new_doc("Stock Entry")
		doc.stock_entry_type = "Material Transfer"
		doc.set_posting_time = True
		doc.posting_date = self.date
		doc.posting_time = self.time
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
		if self.start_button_flag == 0 or not self.is_material_transfer_required:
			for d in self.get("finished_products"):
				doc = frappe.new_doc("Stock Entry")
				doc.stock_entry_type = "Manufacture"
				doc.set_posting_time = True
				doc.posting_date = self.date
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
				for k in self.get("store_materials_consumables"):
					doc.append("items",
							{
							"item_code": k.item,
							"qty": float(((d.quantity*k.quantity)/self.finished_products_qty)),
							"uom": k.uom,
							"s_warehouse": k.source_warehouse,
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

	# set quantities in finished product according to raw material
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

	# Reverse calculation in from finished products to raw material
	@frappe.whitelist()
	def for_multiple_input(self):
		doc = frappe.get_doc('Process Definitions',self.process_definitions)
		raw_doc = doc.get("materials")
		pd_raw_qty = [d.quantity for d in raw_doc]
		id = 0
		raw_total = 0
		for t in self.get("materials"):
			t.quantity = (self.finished_products_qty*pd_raw_qty[id])/doc.total_quantity
			id = id + 1
			raw_total+=t.quantity
		self.materials_qty = raw_total


	