from flask import *
import os.path
import sqlite3
import db
app = Flask(__name__)



def getplayers():
    conn = sqlite3.connect("gamedata.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM 'players'")
    results = cursor.fetchall()
    conn.close()
    return results


@app.route("/")
def homePage():
    return render_template("start.html")


@app.route("/game", methods=["POST","GET"])
def showGame():
    if request.method == "POST":
        username = request.get_json()
        if type(username) is dict:
            updateScore(username)
        else:
            try:
                with sqlite3.connect("gamedata.db") as con:  
                    cur = con.cursor()
                    cur.execute("SELECT name FROM players WHERE name=\"" + username +"\";")
                    res = cur.fetchall()
                    if not(len(res) > 0):
                        cur.execute("INSERT into players (name, currency, level, time, score) values (?,?,?,?,?)",(username,420,0,0,0))  
                        con.commit()
                    print(username + " was not added")
                    
            except:
                con.rollback()
            con.close()
    return render_template("index.html")


def updateScore(player):
    try:
        with sqlite3.connect("gamedata.db") as con:  
            cur = con.cursor()
            cur.execute("SELECT * FROM players WHERE name=\"" + player["name"] +"\";")
            res = cur.fetchall()
            if player["score"] > res[0][4]:
                cmm = "UPDATE players SET score = " + str(player["score"]) + " WHERE name =\"" + player["name"] +"\";"
                cur.execute(cmm)
                con.commit()
    except:
        con.rollback()



@app.route("/leaderboard")
def showboard():
    res = getplayers()
    return render_template("board.html",res=res)


@app.route("/getMoney/<user>")
def testcall(user):
    print(user)
    con = sqlite3.connect("gamedata.db")
    cur = con.cursor()
    cur.execute("SELECT * FROM players WHERE name=\"" + user +"\";")
    res = cur.fetchall()
    print(res)
    print(res[0][1])
    message = {'greeting':'Hello from Flask!' + user}
    return jsonify(res[0][1])  # serialize and use JSON headers

if __name__ == "__main__":
    if not os.path.isfile("./gamedata.db"):
        db.createDB()
    app.run()