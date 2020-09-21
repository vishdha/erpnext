from __future__ import unicode_literals
from frappe import _

def get_data():
	return {
		'fieldname': 'stock_entry',
        'non_standard_fieldnames': {
			'Qulaity Inspection': 'reference_name'
		},
		'internal_links': {
			'Quality Inspection': ['items', 'quality_inspection']
		},
        'transactions': [
			{
				'label': _('Reference'),
				'items': ['Quality Inspection']
			}
		]

	}
