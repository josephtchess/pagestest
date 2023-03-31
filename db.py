import sqlite3

conn = sqlite3.connect("gamedata.db")
print("Opened Database successfully")


## Name

# Three characters afters
conn.execute("CREATE TABLE players (name TEXT, currency INTEGER, level INTEGER, time INTEGER, score INTEGER)")
print("Table created successfully")
conn.close()