import sqlite3

def run_query_and_return_all(query):
	con = sqlite3.connect('relations.db')
	con.row_factory = sqlite3.Row
	cur = con.cursor()
	cur.execute(query)
	rows = [dict(row) for row in cur.fetchall()]
	con.close()
	return rows

def get_manga_per_author(query, author):
	con = sqlite3.connect('relations.db')
	con.row_factory = sqlite3.Row
	cur = con.cursor()
	cur.execute(query, (author,))
	rows = [dict(row) for row in cur.fetchall()]
	con.close()
	return rows

author_list = run_query_and_return_all("SELECT * FROM Author")
relations_list = run_query_and_return_all("SELECT * FROM Relations")

def get_cells(author_list):
	cells = ""
	for entry in author_list:
		names_of_manga_to_str = ""
		names_of_manga = []
		manga_list = get_manga_per_author("SELECT * FROM Manga WHERE author_id=?", entry["id"])
		for manga in manga_list:
			names_of_manga.append(manga["english_name"])
		names_of_manga_to_str = ", ".join(str(x) for x in names_of_manga)
		cells += f"""<mxCell id="manga_{entry["id"]}" customId="manga_{entry["id"]}" value="{entry["japanese_name"]}<br>{entry["english_name"]}<br>Debut Year: {entry["debut_year"]}<br>Manga: {names_of_manga_to_str}" vertex="1" parent="1">
	<mxGeometry x="0" y="0" width="200" height="100" as="geometry"/>
	</mxCell>
"""
	return cells

def get_edges(relations_list):
	cells = ""
	for entry in relations_list:
		cells += f"""<mxCell id="edge_{entry["id"]}" customId="edge_{entry["id"]}" value="" edge="1" parent="1" source="manga_{entry["inspired_by_author_id"]}" target="manga_{entry["author_id"]}">
<mxGeometry relative="1" as="geometry"/>
</mxCell>
"""
	return cells


def get_cells_txt(author_list):
	cells = ""
	names_of_manga = []
	for entry in author_list:
		names_of_manga_to_str = ""
		names_of_manga = []
		manga_list = get_manga_per_author("SELECT * FROM Manga WHERE author_id=?", entry["id"])
		for manga in manga_list:
			names_of_manga.append(manga["english_name"])
		names_of_manga_to_str = ", ".join(str(x) for x in names_of_manga)
		print("------------\n\n\n",names_of_manga_to_str,"------------\n\n\n")
		cells += f"""{entry["id"]}| {entry["japanese_name"]}<br>{entry["english_name"]}<br>Debut Year: {entry["debut_year"]}<br>Manga: {names_of_manga_to_str}\n"""
	return cells

def get_edges_txt(relations_list):
	cells = ""
	sources = ""
	for entry in relations_list:
		sources = ""
		for source in entry["sources"].split(","): 
			sources += f"""<a href="{source}">[link]</a> """
		reason = entry["reasons"].replace("\"", "'")
		cells += f"""{entry['inspired_by_author_id']},{entry['author_id']}| <h1 onclick="displayInfo('{reason}')">test</h1>\n"""
	return cells

xmlbase = f"""
<mxGraphModel>
	<root>
		<mxCell id="0"/>
		<mxCell id="1" parent="0"/>
			{get_cells(author_list)}
			{get_edges(relations_list)}
	</root>
</mxGraphModel>
"""

txtbase = f"""# Custom file format for fileio.html (comments start with #, all vertices first)

# Vertices (id: label)
{get_cells_txt(author_list)}

# Edges (source-id,target-id: label)
{get_edges_txt(relations_list)}"""

print(txtbase)
print("\n\n\n\n")
print(xmlbase)