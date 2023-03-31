from flask import *
import json
import sqlite3
app = Flask(__name__)




@app.route("/", methods=["POST","GET"])
def showGame():
    if request.method == "POST":
        username = request.get_json()
        try:
            with sqlite3.connect("gamedata.db") as con:  
                cur = con.cursor()
                cur.execute("SELECT name FROM players WHERE name=\"" + username +"\";")
                res = cur.fetchall()
                if not(len(res) > 0):
                    cur.execute("INSERT into players (name, currency, level) values (?,?,?)",(username,0,1))  
                    con.commit()
                print(username + " was not added")
                
        except:
            con.rollback()
        con.close()
    return render_template("index.html")



@app.route("/leaderboard")
def showboard():
    return render_template("board.html")



if __name__ == "__main__":
    app.run()