var game = {
	//0=empty,>0=numbers,-1=mine
	size : null,
	sBoard : null,
	flags : null,
	pflags: null,
	mines : null,
	pmines: null,
	revealed: null,
	timer : null,
	win : null,
	first : false,
	hScale : [9,16,16],
	wScale : [9,16,30],
	mScale : [10,40,99],
	newGame : function(diff) {
		//0-easy,1-int,2-exp
		let pBoard = document.getElementById("board");
		pBoard.innerHTML = "";
		//create statusBoard
		this.first = true;
		this.sBoard = createStatusBoard(this.hScale[diff],this.wScale[diff],this.mScale[diff]);
		this.mines = this.mScale[diff];
		this.pmines = new Set();
		this.revealed = new Set();
		this.flags = this.mines;
		this.pflages = new Set();
		this.win = false;
		this.size = this.sBoard.length*this.sBoard[0].length;
		//create elements
		for(var i=0;i<this.sBoard.length;i++) {
			let tr = document.createElement("tr");
			tr.setAttribute("id","ln"+i);
			for(var j=0;j<this.sBoard[i].length;j++) {
				let td = document.createElement("td");
				td.setAttribute("id","ln"+i+"cl"+j);
				let pile = document.createElement("div");
				//assign attributes
				pile.setAttribute("class","pile");
				pile.setAttribute("id",i+"_"+j);
				//add onclick event
				pile.onclick = function() {
					let result = game.pileOnClick(pile);
					pile.onclick = null;
					pile.ondbclick = function() {
						game.dbClick(i,j);
					}
				}
				td.append(pile);
				tr.append(td);
			}
			pBoard.append(tr);
		}
		console.log(pBoard);
	},
	
	pileOnClick : function(pile) {
		let id = pile.getAttribute("id");
		let h = Number(id.substring(0,id.indexOf("_")));
		let w = Number(id.substring(id.indexOf("_")+1,id.length));
		return this.lClick(h,w);
	},
	
	lClick : function(h,w) {
		if(this.first) {
			this.assignMines(h,w);
			this.first = false;
			this.cheating();
		}
		if(!this.isValidPosition(h,w)||this.revealed.has([h,w]))
			return -2;
		let stat = this.sBoard[h][w];
		if(stat == -1) {
			//mine, expload and lose
			this.revealMines();
			console.log("Boom!");
			alert("Sorry, you just lost the game...");
			this.disableAll();
		} else if(stat>=0) {
			//reveal the block
			this.reveal(h,w);
			if(stat==0) {
				//recursively reveal blocks nearby
				for(var i=-1;i<2;i++) {
						for(var j=-1;j<2;j++) {
							if(i==0&&j==0)
								continue;
							this.lClick(h+i,w+j);
						}
				}
			}
		}
		//check if winning
		if(this.revealed.size == this.size-this.mines) {
			this.win = true;
			alert("You found all the mines! You are a hero now!!!");
			this.disableAll();
		}
		return stat;		
	},
	
	assignMines : function(h,w) {
		let totMines = this.mines;
		while(totMines>0) {
			let mh = Math.floor(Math.random() * this.sBoard.length);
			let mw = Math.floor(Math.random() * this.sBoard[0].length);
			if(!this.pmines.has([mh,mw])&&mh!=h&&mw!=w) {
				this.sBoard[mh][mw] = -1;
				this.assignNumbers(mh,mw);
				this.pmines.add([mh,mw]);
				totMines--;
			}
		}
	},
	
	assignNumbers : function(h,w) {
		for(var i=-1;i<2;i++) {
			for(var j=-1;j<2;j++){
				if(i==0&&j==0)
					continue;
				if(this.isValidPosition(h+i,w+j)&&this.sBoard[h+i][w+j]>-1) {
					this.sBoard[h+i][w+j]+=1;
				}
			}
		}
	},
	
	pileOnDBClick : function(pile) {
		let id = pile.getAttribute("id");
		let h = Number(id.substring(0,id.indexOf("_")));
		let w = Number(id.substring(id.indexOf("_")+1,id.length));
		this.dbclick(h,w);
	},
	
	dbClick : function(h,w) {
		let fCount = 0;
		for(var i=-1;i<2;i++)
			for(var j=-1;j<2;j++)
				if(this.pflags.has([h+i,w+j]))
					fCount++;
		if(fCount==this.sBoard[h][w])
			for(var i=-1;i<2;i++)
				for(var j=-1;j<2;j++)
					lClick(h+i,w+j);
	},

	isValidPosition : function(h,w) {
		return (h>=0&&h<this.sBoard.length&&w>=0&&w<this.sBoard[h].length);
	},
	
	reveal : function(h,w) {
		let p = [h,w];
		if(this.revealed.has(p))
			return false;
		let pile = document.getElementById(h+"_"+w);
		if(pile==null)
			return false;
		pile.setAttribute("class","open_"+this.sBoard[h][w]);
		let stat = this.sBoard[h][w];
		pile.innerHTML = stat==0?"":stat==-1?"X":stat;
		this.revealed.add(p);
		return true;
	},
	
	revealMines : function() {
		this.pmines.forEach(function(m) {
			game.reveal(m[0],m[1]);
		});
	}, 
	
	disableAll: function() {
		for(var i=0;i<this.sBoard.length;i++)
			for(var j=0;j<this.sBoard[i].length;j++)
				document.getElementById(i+"_"+j).onclick = null;
	},
	
	cheating : function() {
		if(document.getElementById("cheat")!=null) {
			removeElement("cheat");
			removeElement("forCheater");
		}
		let cheat = document.createElement("a");
		cheat.innerText = "Cheat?";
		cheat.setAttribute("href","#");
		cheat.setAttribute("id","cheat");
		cheat.setAttribute("onclick","cheat()");
		let table = document.createElement("table");
		table.setAttribute("style","display:none");
		table.setAttribute("id","forCheater");
		for(var i=0;i<this.sBoard.length;i++) {
			let tr = document.createElement("tr");
			tr.setAttribute("id","ln"+i);
			for(var j=0;j<this.sBoard[i].length;j++) {
				let td = document.createElement("td");
				td.setAttribute("id","ln"+i+"cl"+j);
				let pile = document.createElement("div");
				//assign attributes
				pile.setAttribute("class","open_"+this.sBoard[i][j]);
				pile.setAttribute("id","p"+i+"_"+j);
				pile.innerText = this.sBoard[i][j];
				td.append(pile);
				tr.append(td);
			}
			table.append(tr);
		}
		document.body.insertBefore(cheat,document.body.lastChild);
		document.body.insertBefore(table,document.body.lastChild);
	}
};

function createStatusBoard(h,w,m) {
	let board = [];
	for(var i=0;i<h;i++) {
		board.push([]);
		for(var j=0;j<w;j++) {
			board[i].push(0);
		}
	}
	return board;	
}

function cheat() {
	let tb = document.getElementById("forCheater");
	if(tb.getAttribute("style")=="display:none") {
		tb.setAttribute("style","");
		document.getElementById("cheat").innerText = "No Cheat";
	} else {
		tb.setAttribute("style","display:none");
		document.getElementById("cheat").innerText = "Cheat?";
	}
}

function removeElement(elementId) {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

function Set() {
	this.list = [];
	this.size = 0;
	this.add = function (x) {
		for(var i=0;i<this.list.length;i++){
			if(this.assert(this.list[i],x))
				return false;
		}
		this.list.push(x);
		this.size++;
		return true;
	}
	
	this.has = function (x) {
		for(var i=0;i<this.list.length;i++){
			if(this.assert(this.list[i],x))
				return true;
		}
		return false;
	}
	
	this.assert = function(x,y) {
		for(var k in x) {
			if(y[k]==null)
				return false;
			if(x[k]!=y[k])
				return false;
		}
		return true;
	}
	
	this.forEach = function (callback) {
		for(var i=0;i<this.size;i++){
			callback(this.list[i]);
		}
	}
}
