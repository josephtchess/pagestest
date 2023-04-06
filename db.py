
import sqlite3
def createDB():
    conn = sqlite3.connect("gamedata.db")
    conn.execute("CREATE TABLE players (name TEXT, currency INTEGER, level INTEGER, time INTEGER, score INTEGER)")
    conn.close()