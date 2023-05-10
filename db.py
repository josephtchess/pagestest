
import sqlite3
def createDB():
    conn = sqlite3.connect("gamedata.db")
    conn.execute("CREATE TABLE players (name TEXT, level INTEGER, time INTEGER)")
    conn.close()