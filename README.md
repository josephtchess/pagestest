# pagestest
Program keeps lists of all defenders, enemies, projectiles, and resources currently displayed the lists are all objects of their respective class, and can be iterated through at anypoint with a for loop for example - if one wants to edit a property of a defender after something happens to a resource, just loop through list of defenders and apply changes

Projectile is fired from defender if it can shoot, and an enemy is on the same horizontal line Projectile is removed if it hits or goes out of bounds Defender/Enemy is removed if its health drops to/below zero Game ends when enemy goes too far Resources do different things - yellow increases currency Green restores health of all defenders currently on the field Red increases damage of all defenders for a certain amount of frames Blue slows all enemies for a certain amount of frames

Player gets points based on health of enemies that are defeated, along with some resourcers per "kill" Game is won after player reaches certain score Pace of enemies spawn increases per level the player selected Number of units available is increased by one each time the player beats a level for the first time
