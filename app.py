from flask import * 
import os.path
import sqlite3
import db
import requests
import random
app = Flask(__name__)
app.secret_key = "UMBC447"



def getplayers():
    conn = sqlite3.connect("gamedata.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM 'players'")
    results = cursor.fetchall()
    conn.close()
    res = []
    for i in range(len(results)):
        if results[i][2] == 3:
            res.append(results[i])
    res.sort(key= lambda x:x[4], reverse=True)
    return res

@app.route("/levels")
def levelSelect():
    print("inside level selection with username",session['user'])
    return render_template("level.html",username=session['user'])


@app.route("/",methods=["POST","GET"])
def homePage():
    print("home")
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
                        cur.execute("INSERT into players (name, currency, level, time, score) values (?,?,?,?,?)",(username,300,1,0,0))
                        session['user'] = username
                        con.commit()
                    ##print(username + " was not added")
                    session['user'] = username
            except:
                con.rollback()
            con.close()


    return render_template("start.html")


@app.route("/game", methods=["POST","GET"])
def showGame():
    if request.method == "POST":
        username = request.get_json()
        if type(username) is dict:
            updateScore(username)
    else:
        print("Your mom")
        # else:
        #     try:
        #         with sqlite3.connect("gamedata.db") as con:  
        #             cur = con.cursor()
        #             cur.execute("SELECT name FROM players WHERE name=\"" + username +"\";")
        #             res = cur.fetchall()
        #             if not(len(res) > 0):
        #                 cur.execute("INSERT into players (name, currency, level, time, score) values (?,?,?,?,?)",(username,420,1,0,0))  
        #                 con.commit()
        #             print(username + " was not added")
                    
        #     except:
        #         con.rollback()
        #     con.close()
    return render_template("index.html",username=session['user'],currLevel=session["level"])


def updateScore(player):
    print(player,"updating score and level")
    try:
        with sqlite3.connect("gamedata.db") as con:  
            cur = con.cursor()
            cur.execute("SELECT * FROM players WHERE name=\"" + player["name"] +"\";")
            res = cur.fetchall()
            if "score" in player and player["score"] > res[0][4]:
                cmm = "UPDATE players SET score = " + str(player["score"]) + " WHERE name =\"" + player["name"] +"\";"
                cur.execute(cmm)
                con.commit()
            cmm = "UPDATE players SET level = " + str(player["level"]) + " WHERE name =\"" + player["name"] +"\";"
            cur.execute(cmm)
            con.commit()

    except:
        con.rollback()



@app.route("/leaderboard")
def showboard():
    res = getplayers()
    print(res)
    return render_template("board.html",res=res)


@app.route("/getMoney/<user>")
def getMoney(user):
    print(user)
    con = sqlite3.connect("gamedata.db")
    cur = con.cursor()
    cur.execute("SELECT * FROM players WHERE name=\"" + user +"\";")
    res = cur.fetchall()
    print(res)
    print(res[0][1])
    message = {'greeting':'Hello from Flask!' + user}
    return jsonify(res[0][1])  # serialize and use JSON header

@app.route("/getLevel/<user>")
def getLevel(user):
    print(user)
    con = sqlite3.connect("gamedata.db")
    cur = con.cursor()
    cur.execute("SELECT * FROM players WHERE name=\"" + user +"\";")
    res = cur.fetchall()
    print(res)
    print(res[0][1])
    message = {'greeting':'Hello from Flask!' + user}
    return jsonify(res[0][2])  # serialize and use JSON header


@app.route("/getTop",methods=["POST","GET"])
def getTop():

    res =getplayers()
    if(len(res) >= 5):
        res = res[0:5]
        testing = {"data" :
            [ 
                {	
                    "Group": "K",
                    "Title": "Top 5 Scores",
                    res[0][0]: res[0][4],
                    res[1][0]: res[1][4],
                    res[2][0]: res[2][4],
                    res[3][0]: res[3][4],
                    res[4][0]: res[4][4]
                }
            ]
        }
        if request.method == "GET":
            return jsonify(testing)  # serialize and use JSON header

@app.route("/level/<num>")
def setLevel(num):
    print("level",num,"was chosen")
    session["level"] = num
    return redirect(url_for("showGame"))

if __name__ == "__main__":
    if not os.path.isfile("./gamedata.db"):
        db.createDB()
    app.run()

