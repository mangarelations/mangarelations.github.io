import sqlite3

def run_query_and_return_all(query):
	con = sqlite3.connect('relations.db')
	con.row_factory = sqlite3.Row
	cur = con.cursor()
	cur.execute(query)
	rows = [dict(row) for row in cur.fetchall()]
	con.close()
	return rows

manga_list = run_query_and_return_all("SELECT * FROM manga")
relations_list = run_query_and_return_all("SELECT * FROM relations")

def get_cells(manga_list):
	cells = ""
	for entry in manga_list:
		cells += f"""<mxCell id="manga_{entry["id"]}" customId="manga_{entry["id"]}" value="{entry["name"]}" vertex="1" parent="1">
	<mxGeometry x="0" y="0" width="80" height="70" as="geometry"/>
	</mxCell>
"""
	return cells

def get_edges(relations_list):
	cells = ""
	for entry in relations_list:
		cells += f"""<mxCell id="edge_{entry["relation_id"]}" customId="edge_{entry["relation_id"]}" value="" edge="1" parent="1" source="manga_{entry["inspired_by_id"]}" target="manga_{entry["target_manga_id"]}">
<mxGeometry relative="1" as="geometry"/>
</mxCell>
"""
	return cells


def get_cells_txt(manga_list):
	cells = ""
	for entry in manga_list:
		cells += f"{entry['id']}: {entry['name']}\n"
	return cells

def get_edges_txt(relations_list):
	cells = ""
	for entry in relations_list:
		cells += f"{entry['inspired_by_id']},{entry['target_manga_id']}: null\n"
	return cells

xmlbase = f"""
<mxGraphModel>
	<root>
		<mxCell id="0"/>
		<mxCell id="1" parent="0"/>
			{get_cells(manga_list)}
			{get_edges(relations_list)}
	</root>
</mxGraphModel>
"""

txtbase = f"""# Custom file format for fileio.html (comments start with #, all vertices first)

# Vertices (id: label)
{get_cells_txt(manga_list)}

# Edges (source-id,target-id: label)
{get_edges_txt(relations_list)}"""

print(txtbase)
