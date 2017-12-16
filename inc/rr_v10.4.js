/*--------------------------------------------------------

* Filename: Setup JS
* Description: General scripts file for Roborally

* Author: R. Brian Redd

--------------------------------------------------------*/

/*FUNCTIONS*/

$(document).ready(function () {

	/*Global Variables*/
	
	var rallyx, rallyy; //number of boards x & y
	var tx = 64; //tile width (pixels)
	var ty = 64; //tile height (pixels)
	var gridx = 12; //grid width
	var gridy = 12; //grid height
	var nuflags, numbots, playerbot;//, roboMove; //number of flags, number of 'bots, playerbot model number
	var maxlife = 4; //maximum number of lives (up to four)
	var horzoffset = 8; //display offset, to improve display of boards (removing extra spaces from dock)
	var vertoffset = 0; //vertical display offset, primarily for troubleshooting
	var compiled = false; //programs compiled or not
	var gameturns = 0; //set number of turns (advances with each deal)
	var curReg = 0;
	var robomove = false;
	var pushermove = false;
	var gearmove = false;
	var crushermove = false;
	var winner = false;
	var autonext = false;
	var DelRM, DelCV, DelPS, DelGR, DelCR, DelLS; //delays
	
	var board = []; //board array
	var bdorient = []; //board orientation array
	var tile = []; //tile array
	var Robot = []; //'Bot's
	var RoboMod = []; //'Bot models
	var Flag = [];//Flags object
	var Face = [];//Facing object
	var roboOrder = []; //robot order (based on card priority)
	
	var screenwidth = $(window).width();
	if (screenwidth > 1464) {
		screenwidth = 1464;
	}
	
	var activeOnReg = []; //active on register - used for tiles that are register activated
	for (var i = 1; i < 6; i++) { //set five registers as individual arrays (so activated tiles can be assigned to it)
		activeOnReg[i] = [];
	};
	
	var hand = []; //set hand array, used for each robot (up to nine source cards)
	var program = []; //programs array, used for each robot (five register actions per 'bot)
	
	/*jQuery Variables*/
	
	var GS$ = $("#gamespace"); //Game Space (tiles, boards, robots, etc)
	var acc$ = $("#accordion"); //Register phase display
	var PC$ = $("#playerconsole"); //Console "screen"
	var hand$ = $("#programhand"); //sortable cards dealt to player
	var proghand$ = $("#programcompiled"); //compiled "compiled" into program
	var gameForm$ = $("#gameForm"); //Game Form (start "screen")
	var NRB$ = $("#NextReg"); //Next Register button
	var ANB$ = $("#AutoNext"); //Auto Next Register button
	var NRBguard$ = $(".buttonguard");
	var RMV$ = $("#robomove"); //RoboMove column (far right)
	var trn$ = $("#trn"); //game turns
	var RL$ = $("#rallylog"); //Log screen
	var LOG$ = $("#logbody"); //Log body
	var Instructions$ = $("#Instructions");
	var MyOptBrd$ = $("#myoptionsboard");
	var OpOptBrd$ = $("#opoptionsboard");
	var RBT$ = []; //robot piece

	/*Generic Functions*/
	
	function Rand(rnd) { //randomizer
		return Math.floor(Math.random() * rnd);
	};
	
	/*Form Functions*/
	
	for (var i = 0; i < RoboStock.length; i++) { //populate robot options
		gameForm$.find("#playerbot").append('<option value="' + i + '">' + RoboStock[i] + '</option>');
	};
	for (var i = 1; i < rallyname.length; i++) { //populate rally options
		gameForm$.find("#whatcourse").append('<option value="' + i + '" class="diff_' + rallydiff[i] + ' len_' + rallylength[i] + '">' + rallyname[i] + ' (' + rallydiff[i] + '/' + rallylength[i] + ')</option>');
	};
	for (var i = 2; i < gridname.length; i++) { //for random boards
		gameForm$.find("#whatboard").append('<option value="' + i + '">' + gridname[i] + '</option>');
	};
	
	function updateForm() {
		gameForm$.find("#robopic").attr('src','images/robots/'+document.gameForm.playerbot.value+'_Front.png');
		if (document.gameForm.randrally.checked) {
			gameForm$.find(".presetrally").css('display' , 'none');
			gameForm$.find(".randomrally").css('display' , 'block');
		} else {
			gameForm$.find(".presetrally").css('display' , 'block');
			gameForm$.find(".randomrally").css('display' , 'none');
		};
		if (document.gameForm.l_short.checked) {
			gameForm$.find(".len_Short").removeClass('hidopt');
		};
		if (document.gameForm.l_med.checked) {
			gameForm$.find(".len_Medium").removeClass('hidopt');
		};
		if (document.gameForm.l_long.checked) {
			gameForm$.find(".len_Long").removeClass('hidopt');
		};
		if (document.gameForm.d_easy.checked) {
			gameForm$.find(".diff_Easy").removeClass('hidopt');
		};
		if (document.gameForm.d_med.checked) {
			gameForm$.find(".diff_Medium").removeClass('hidopt');
		};
		if (document.gameForm.d_hard.checked) {
			gameForm$.find(".diff_Hard").removeClass('hidopt');
		};
		if (!document.gameForm.d_easy.checked) {
			gameForm$.find(".diff_Easy").addClass('hidopt');
		};
		if (!document.gameForm.d_med.checked) {
			gameForm$.find(".diff_Medium").addClass('hidopt');
		};
		if (!document.gameForm.d_hard.checked) {
			gameForm$.find(".diff_Hard").addClass('hidopt');
		};
		if (!document.gameForm.l_short.checked) {
			gameForm$.find(".len_Short").addClass('hidopt');
		};
		if (!document.gameForm.l_med.checked) {
			gameForm$.find(".len_Medium").addClass('hidopt');
		};
		if (!document.gameForm.l_long.checked) {
			gameForm$.find(".len_Long").addClass('hidopt');
		};
	};
	
	gameForm$.change(function() { //update form when changed
		updateForm();
	});
	
	updateForm();
		
	gameForm$.find("#submit").click(function () { //set "submit button
		readyGo();
	}).hover(
		function() {
			$(this).find('img').addClass('greenlight').removeClass('flashinglight');
		},
		function() {
			$(this).find('img').addClass('flashinglight').removeClass('greenlight');
		}
	);
		
	gameForm$.find("#help1").click(function () { //set "submit button
		Instructions$.fadeToggle();
	}).hover(
		function() {
			$(this).find('img').addClass('redlight').removeClass('yellowlight');
		},
		function() {
			$(this).find('img').addClass('yellowlight').removeClass('redlight');
		}
	);
		
	function readyGo() { //Form selections done, time to start game
		if (document.gameForm.playerbot.value == "random") { //randomize bot if "random" bot chosen
			playerbot = Rand(RoboStock.length); 
		} else { //assign 'bot
			playerbot = parseInt(document.gameForm.playerbot.value);
		};
		numbots = parseInt(document.gameForm.numopp.value); //set number of robots
		
		for (var i = 0; i < RoboStock.length; i++) { //set initial RoboMod array
			RoboMod[i] = i;
		};
		
		for (var i = 0; i < RoboStock.length; i++) {
			if (i == 0) { //'bot chosen by player becomes RoboMod[0]
				RoboMod[playerbot] = RoboMod[0];
				RoboMod[0] = playerbot;
			} else { //rest of 'bots are randomized
				var r = Rand(RoboStock.length - 1) + 1;
				var temp = RoboMod[r];
				RoboMod[r] = RoboMod[i];
				RoboMod[i] = temp;
			}
		};
		
		if (document.gameForm.whatcourse.value == "randall") {
			rallychoice = Rand(rallyname.length - 1) + 1; //select random course
		} else if (document.gameForm.whatcourse.value == "rand") {
			var temp = Rand(gameForm$.find("#whatcourse option:not('.hidopt')").length - 2) + 1;
			rallychoice = parseInt(gameForm$.find("#whatcourse option:not('.hidopt')").get(temp + 1).value);
		} else {
			rallychoice = document.gameForm.whatcourse.value;
		};

		var rallyx = parseInt(rally[rallychoice].substr(0, 1)); //set number of horizontal boards
		var rallyy = parseInt(rally[rallychoice].substr(1, 1)); //set number of vertical boards
		
		for (var aa = 0; aa < rallyy; aa++) { //define rally by putting boards together
			board[aa] = new Array;
			bdorient[aa] = new Array;
			for (var bb = 0; bb < rallyx; bb++) {
				board[aa][bb] = rally[rallychoice].substr((2 + (3 * bb) + (3 * rallyx * aa)),2);
				bdorient[aa][bb] = rally[rallychoice].substr((4 + (3 * bb) + (3 * rallyx * aa)),1);
				board[aa][bb] = parseInt(board[aa][bb]);
				bdorient[aa][bb] = parseInt(bdorient[aa][bb]);
				getData(board[aa][bb], bdorient[aa][bb], aa, bb);
			};
		};
		
		pitborder(); //generate pits around game grid
		populateGrid(rallychoice); //build grid
		
		for (var i = 0; i < numbots; i++) { //defines program & hand arrays
			program[i] = [];
			hand[i] = []; 
		};
		
		dealProgs(); //deal initial set of programs.
		
		$("#startDialog").fadeOut(); //fadeOut the start dialog
		$("#ral").text(rallyname[rallychoice] + " (" + rallydiff[rallychoice] + "/" + rallylength[rallychoice] + ")");
		//write to log
		LOG$.append("Rally: [" + rallyname[rallychoice] + "]");
		LOG$.append("<br/>Number of Flags on Board: [" + nuflags + "]");
		LOG$.append("<br/>Number of Robots [" + numbots + "]:");
		var temp = "<ol>";
		for (var i = 0; i < numbots; i++) {
			temp += "<li>" + Robot[i].name;
			if (i == 0) {
				temp += " (player)";
			}
			temp += "</li>"
		};
		temp += "</ol>"
		LOG$.append(temp);
		
		$(".openconsole span").text(Robot[0].name);
		PC$.find("h2").text(Robot[0].name + " CONSOLE");
		MyOptBrd$.find("h2").text(Robot[0].name + "'S OPTIONS");
		
		openConsole();
		
		Troubleshoot(); //define //console.log datadumps for board tiles

	};

	/*Gamespace Setup */
	
	GS$.css({ //game space width is adjusted according to screen width
		"width": (screenwidth - 440) + "px",
		"height": (12 * ty) + "px"
	});
	$("#screen").css({ //"screen" width is adjusted according to screen width
		"width": (GS$.width() + 400)  + "px"
	});
	
	//player console
	PC$.draggable({ //player console set as draggable and semi-transparent unless hovered upon
		handle: "h2",
		containment: 'window'
	}).hover(
		function() {
			$(this).animate({
				opacity: 1.0
			}, 200)
		},
		function() {
			$(this).animate({
				opacity: 0.5
			}, 200)
		}
	).find(".closer").click(function() { //player console "closer" closes console
		openConsole();
	});
	hand$.sortable({ //player hand is sortable
		items: "li:not(.ui-state-disabled)",
		cancel: ".ui-state-disabled"
	});
	$("#roboportrait").click(function() { //robo portrait (options)
		showOptions();
	});
	$(".openconsole").click(function() { //open console upper button
		openConsole();
	});	
	
	MyOptBrd$.draggable({
		handle: "h2",
		containment: 'window'
	}).hover(
		function() {
			PC$.animate({
				opacity: 1.0
			}, 200)
		},
		function() {
			PC$.animate({
				opacity: 0.5
			}, 200)
		}
	).find(".closer").click(function() { //player console "closer" closes console
		showOptions();
	});
	
	OpOptBrd$.draggable({
		handle: "h2",
		containment: 'window'
	}).find(".closer").click(function() { //player console "closer" closes console
		OpOptBrd$.slideToggle();
	});
	
	RL$.draggable({ //rally log is draggable
		handle: "h2",
		containment: 'window'
	}).find(".closer").click(function() { //rally log "closer"
		RL$.slideToggle();
	});
	$(".openlog").click(function() { //open log upper button
		RL$.slideToggle();
	});
	
	Instructions$.draggable({ //instructions/help is draggable
		handle: "h2",
		containment: 'window'
	});
	$("#help2").click(function() { //help button
		Instructions$.fadeToggle();
	});
	Instructions$.find(".closer").click(function() { //instructions "closer"
		Instructions$.fadeToggle();
	});
	
	ANB$.click(function() { //auto next button
		AutoNext();
	});
	
	
	/*Configure Directions/Facings*/
	
	function faceObj(dx, dy, dir, fw, bw) {
		this.dx = dx;
		this.dy = dy;
		this.compass = dir;
		this.frontwall = fw;
		this.backwall = bw;
	};
	
	Face[0] = new faceObj(0, -1, "North", "wll_u", "wll_d");
	Face[1] = new faceObj(1, 0, "East", "wll_r", "wll_l");
	Face[2] = new faceObj(0, 1, "South", "wll_d", "wll_u");
	Face[3] = new faceObj(-1, 0, "West", "wll_l", "wll_r");
	
	/*Populate Grid*/
		
	function tileObj(raw, orient) {
		//orientation-less features
		this.flr = raw.substr(0, 1); //floor
		this.cvr = raw.substr(5, 3); //conveyor type
		if (this.cvr == "") { this.cvr = "0"}; 
		this.gr = raw.substr(9, 1); //gear type
		if (this.gr == "") { this.gr = "0"}; 
		this.psh = raw.substr(10, 1); //pusher
		if (this.psh == "") { this.psh = "0"}; 
		this.psh_reg = raw.substr(12, 5).toString(); //pusher registers
		if (this.psh_reg == "") { this.psh_reg = "00000"}; 
		this.chr = raw.substr(17, 1); //crusher
		if (this.chr == "") { this.chr = "0"}; 
		this.chr_reg = raw.substr(18, 5).toString(); //crusher registers
		if (this.chr_reg == "") { this.chr_reg = "00000"}; 
		this.lsr = raw.substr(23, 1); //# of lasers
		if (this.lsr == "") { this.lsr = "0"}; 
		this.lbm = raw.substr(25, 1); //# of laser beams
		if (this.lbm == "") { this.lbm = "0"}; 
		this.flg = 0;
		//orientation-based features
		switch(orient) { //walls
			case 0:
				this.wll_u = raw.substr(1, 1); //wall up
				this.wll_r = raw.substr(2, 1); //wall right
				this.wll_d = raw.substr(3, 1); //wall down
				this.wll_l = raw.substr(4, 1); //wall left
				break;
			case 1:
				this.wll_r = raw.substr(1, 1); //wall right
				this.wll_d = raw.substr(2, 1); //wall down
				this.wll_l = raw.substr(3, 1); //wall left
				this.wll_u = raw.substr(4, 1); //wall up
				break;
			case 2:
				this.wll_d = raw.substr(1, 1); //wall down
				this.wll_l = raw.substr(2, 1); //wall left
				this.wll_u = raw.substr(3, 1); //wall up
				this.wll_r = raw.substr(4, 1); //wall right
				break;
			case 3:
				this.wll_l = raw.substr(1, 1); //wall left
				this.wll_u = raw.substr(2, 1); //wall up
				this.wll_r = raw.substr(3, 1); //wall right
				this.wll_d = raw.substr(4, 1); //wall down
				break;
		};
		if (this.wll_u == "") { this.wll_u = "0"}; 
		if (this.wll_r == "") { this.wll_r = "0"}; 
		if (this.wll_d == "") { this.wll_d = "0"}; 
		if (this.wll_l == "") { this.wll_l = "0"}; 
		
		this.cvr_dir = raw.substr(8, 1); //conveyor direction
		if (this.cvr_dir == "") { this.cvr_dir = "0"}; 
		this.cvr_dir = parseInt(this.cvr_dir) + orient;
		if (this.cvr_dir > 3) { this.cvr_dir -= 4 };
		
		this.psh_dir = raw.substr(11, 1); //pusher direction
		if (this.psh_dir == "") { this.psh_dir = "0"}; 
		this.psh_dir = parseInt(this.psh_dir) + orient;
		if (this.psh_dir > 3) { this.psh_dir -= 4 };
		
		this.lsr_dir = raw.substr(24, 1); //laser direction
		if (this.lsr_dir == "") { this.lsr_dir = "0"}; 
		this.lsr_dir = parseInt(this.lsr_dir) + orient;
		if (this.lsr_dir > 3) { this.lsr_dir -= 4 };
		
		this.lbm_dir = raw.substr(26, 1); //beam direction
		if (this.lbm_dir == "") { this.lbm_dir = "0"}; 
		this.lbm_dir = parseInt(this.lbm_dir) + orient;
		if (this.lbm_dir > 3) { this.lbm_dir -= 4 };
		
		if (gridx > 12) {
			GS$.css({
				"height": ((12 * ty) + 18) + "px"
			});
		};
	};
		
	function regObj(x, y) {
		this.x = x;
		this.y = y;
	};
		
	function getData(b, o, bdy, bdx) {
		gridx = 12 * (bdx + 1);
		gridy = 12 * (bdy + 1);
		switch(o) {
			case 0:
				for (var aa = 0; aa < 12; aa++) {
					if (tile.length <= aa + (bdy *12)) {
						tile[aa + (bdy * 12)] = [];
					};
					for (var bb = 0; bb < 12; bb++) {
						tile[aa + (bdy * 12)][bb + (bdx * 12)] = new tileObj(griddata[b][aa][bb], o);
					}
				};
				break;
			case 1:
				for (var aa = 0; aa < 12; aa++) {
					if (tile.length <= aa + (bdy *12)) {
						tile[aa + (bdy * 12)] = [];
					};
					for (var bb = 0; bb < 12; bb++) {
						tile[aa + (bdy * 12)][bb + (bdx * 12)] = new tileObj(griddata[b][11 - bb][aa],o);
					}
				};
				break;			
			case 2:
				for (var aa = 0; aa < 12; aa++) {
					if (tile.length <= aa + (bdy *12)) {
						tile[aa + (bdy * 12)] = [];
					};
					for (var bb = 0; bb < 12; bb++) {
						tile[aa + (bdy * 12)][bb + (bdx * 12)] = new tileObj(griddata[b][11 - aa][11 - bb],o);
					}
				};
				break;
			case 3:
				for (var aa = 0; aa < 12; aa++) {
					if (tile.length <= aa + (bdy *12)) {
						tile[aa + (bdy * 12)] = [];
					};
					for (var bb = 0; bb < 12; bb++) {
						tile[aa + (bdy * 12)][bb + (bdx * 12)] = new tileObj(griddata[b][bb][11 - aa],o);
					}
				};
				break;
		};
	};
	
	function pitborder() {
		tile[-1] = new Array;
		tile[gridy] = new Array;
		for (var i = -1; i <= gridy; i++) {
			tile[i][-1] = new tileObj("00200", 0);
			tile[i][gridx] = new tileObj("00002", 0);
		};
		for (var i = 0; i < gridx; i++) {
			tile[-1][i] = new tileObj("00020", 0);
			tile[gridy][i] = new tileObj("02000", 0);
		};
	};
	
	function populateGrid(n) { 
		
		//empty laser beams
		$(".lbm1").remove();
		$(".lbm2").remove();
		$(".lbm3").remove();
		
		//populate grid
		for (var y = vertoffset; y < gridy; y++) {
			for (var x = horzoffset; x < gridx; x++) {
				var flooronly = tile[y][x].flr;
			
				var flr_lyr = ""; //floor
				var cvr_lyr = ""; //conveyor
				var gr_lyr = ""; //gear
				var lsr_lyr = ""; //laser
				var psh_lyr = ""; //pusher
				var wll_u_lyr = ""; //up wall
				var wll_r_lyr = ""; //right wall
				var wll_d_lyr = ""; //down wall
				var wll_l_lyr = ""; //left wall
				var flg_lyr = ""; //flag
				var lbm_lyr = ""; //laserbeam
				var rlbm_lyr = ""; //robot's laserbeam
				var chr_lyr = ""; //crusher
				var reg_lyr = ""; //registers
				
				var reg_triggers = "";
				var tileid = "tile_" + y + "_" + x;
				//clear current tile
				$("#" + tileid).remove();
				//build current tile based on data
				flr_lyr = "<div class='flr_lyr tf tile floor" + tile[y][x].flr + "'></div>";
				if (tile[y][x].cvr.substring(0, 1) > "0") {
					cvr_lyr = "<div class='cvr_lyr tf'><img class='tf orient" + tile[y][x].cvr_dir + "' src='images/factory/conveyor" + tile[y][x].cvr + ".png' /></div>"
					flooronly = 0;
				};
				if (tile[y][x].gr > "0") {
					gearmove = true;
					gr_lyr = "<div class='gr_lyr tf'><img class='tf gear" + tile[y][x].gr + "' src='images/factory/gear" + tile[y][x].gr + ".png' /></div>";
					flooronly = 0;
				};
				if (tile[y][x].psh > "0") {
					pushermove = true;
					psh_lyr = "<div class='psh_lyr tf'><div class='pusher" + tile[y][x].psh_dir + "'></div></div>";
					reg_lyr = "<div class='reg_lyr tf'><div class='psh_reg" + tile[y][x].psh_dir + "'></div></div>";
					reg_triggers = tile[y][x].psh_reg;
					flooronly = 0;
				};
				if (tile[y][x].wll_u > "0") {
					wll_u_lyr = "<div class='wll_lyr tf'><div class='wall" + tile[y][x].wll_u + "0'></div></div>";
				};
				if (tile[y][x].wll_r > "0") {
					wll_r_lyr = "<div class='wll_lyr tf'><div class='wall" + tile[y][x].wll_r + "1'></div></div>";
				};
				if (tile[y][x].wll_d > "0") {
					wll_d_lyr = "<div class='wll_lyr tf'><div class='wall" + tile[y][x].wll_d + "2'></div></div>";
				};
				if (tile[y][x].wll_l > "0") {
					wll_l_lyr = "<div class='wll_lyr tf'><div class='wall" + tile[y][x].wll_l + "3'></div></div>";
				};
				if (tile[y][x].lsr > "0") {
					lsr_lyr = "<div class='lsr_lyr tf'><div class='laser" + tile[y][x].lsr + "-" + tile[y][x].lsr_dir + "'></div></div>";
				};
				if (tile[y][x].lbm > "0") {
					lbm_lyr = "<div class='lbm_lyr tf lbm" + tile[y][x].lbm + " orient" + tile[y][x].lbm_dir + "'></div>";
					flooronly = 0;
				};
				if (tile[y][x].chr > "0") {
					crushermove = true;
					chr_lyr = "<div class='chr_lyr tf'><img class='tf crusher' src='images/factory/crusher.png' /></div>";
					reg_lyr = "<div class='reg_lyr tf'><div class='chr_reg'></div></div>";
					reg_triggers = tile[y][x].chr_reg;
					flooronly = 0;
				};
				 
				GS$.append("<div id='" + tileid + "' class='tile'></div>");
				GS$.find("#" + tileid).append(flr_lyr);
				GS$.find("#" + tileid + " .flr_lyr").append(cvr_lyr);
				GS$.find("#" + tileid).append(gr_lyr);
				GS$.find("#" + tileid).append(lsr_lyr);
				GS$.find("#" + tileid).append(psh_lyr);
				GS$.find("#" + tileid).append(wll_u_lyr);
				GS$.find("#" + tileid).append(wll_r_lyr);
				GS$.find("#" + tileid).append(wll_d_lyr);
				GS$.find("#" + tileid).append(wll_l_lyr);
				GS$.find("#" + tileid).append(lbm_lyr);
				GS$.find("#" + tileid).append(rlbm_lyr); //robot laserbeam layer
				GS$.find("#" + tileid).append(chr_lyr);
				GS$.find("#" + tileid).append(reg_lyr);
							
				$("#tile_" + y + "_" + x).css({
					"left": ((x - horzoffset) * 64) + "px",
					"top": ((y - vertoffset) * 64) + "px"
				});
				
				if (reg_triggers) {
					if ($("#tile_" + y + "_" + x).find(".reg_lyr").find("div").hasClass('psh_reg1') || $("#tile_" + y + "_" + x).find(".reg_lyr").find("div").hasClass('psh_reg3')) {
						var spacer="<br/>"
					} else {
						var spacer="&nbsp;"
					};
					var trigger_txt = " ";
					for (var i = 0; i < 5; i++) {
						if (reg_triggers.substr(i, 1) == "0") {
							trigger_txt = trigger_txt + " " + spacer;
						} else {
							trigger_txt = trigger_txt + (i + 1) + spacer;
							activeOnReg[i + 1][activeOnReg[i + 1].length] = new regObj(x, y);
						};
					};
					$("#tile_" + y + "_" + x).find(".reg_lyr div").html(trigger_txt);
				}
			}
		};
		$(".lbm1").append("<div class='beam1'></div>");
		$(".lbm2").append("<div class='beam21'></div>");
		$(".lbm2").append("<div class='beam22'></div>");
		$(".lbm3").append("<div class='beam31'></div>");
		$(".lbm3").append("<div class='beam32'></div>");
		$(".lbm3").append("<div class='beam33'></div>");
		$(".lbm4").append("<div class='beam41'></div>");
		$(".lbm4").append("<div class='beam42'></div>");
		
		placePDFlags(n);
		placeRobots(numbots, n);
		
	};
	
	/*Flag placement*/
	
	function flagObj(yy, xx) {
		this.x = xx;
		this.y = yy;
	}
	
	function placePDFlags(n) { //predefined flags, 'n' is rally course
		var flags = rallyflags[n].split(' ');
		for (var i = 0; i < flags.length; i++) {
			var flagpos = flags[i].split('-');
			tile[flagpos[0]][flagpos[1]].flg = i + 1;
			Flag[i] = new flagObj(flagpos[0], flagpos[1]);
			var flg_lyr = "<div class='flg_lyr'><div class='flg_txt'>" + tile[flagpos[0]][flagpos[1]].flg + "</div></div>";
			GS$.find("#tile_" + flagpos[0] + "_" + flagpos[1]).append(flg_lyr);
		}
		nuflags = flags.length;
	};
	
	/*Define Robots*/
			
	function robObj(rbt, mdl, yy, xx, face) {
		this.model = mdl;
		this.image = "images/robots/" + mdl + ".png";
		this.thumb = "images/robots/" + mdl + "_Front.png";
		this.name = RoboStock[mdl];
		this.x = xx; //robot x position
		this.y = yy; //robot y position
		this.archx = xx; //robot archive x position
		this.archy = yy; //robot archive y position
		this.facing = face; //robot facing
		this.health = 9; //health (number of cards); death occurs at -1
		//this.cards = 9; //same as health, only can't drop below 5 (under 5, special card rules apply; locked registers)
		this.curdmg = 0; //damage "this" round
		if (rbt == 0) {
			this.lives = maxlife - 1;
		} else {
			this.lives = maxlife;
		};
		this.alive = true; //false if robot is dead 
		this.pwrdwn = 0; //true if powered down
		this.flag = 0; //current flag
		this.weapon = 1; //standard laser beam
		this.curmv = 0; //current tiles moved
		this.option = []; //robot's options array
		this.option[0] = 0; //robot's initial Option is "no option"
	};
	
	/*Robots placements*/

	function placeRobots(num, rally) { //number of bots, rally number
		var temp = rallystart[rally].split(':');
		var startorient = temp[0];
		var startspot = temp[1].split(' ');		
		
		for (var i = 0; i < num; i++) {
			var startpos = startspot[i].split('-');
			if (startorient == "r") {
				var temp2 = Rand(4);
			} else {
				var temp2 = parseInt(startorient);
			}
			Robot[i] = new robObj(i, RoboMod[i], startpos[0], startpos[1], temp2);
		}
				
		if (numbots > 1) {
			var temp = Rand(numbots);
			var tempx = Robot[temp].x;
			var tempy = Robot[temp].y;
			Robot[temp].x = Robot[0].x;
			Robot[temp].y = Robot[0].y;
			Robot[temp].archx = Robot[0].archx;
			Robot[temp].archy = Robot[0].archy;
			Robot[0].x = tempx;
			Robot[0].y = tempy;
			Robot[0].archx = tempx;
			Robot[0].archy = tempy;
		};
		
		for (var i = 0; i < num; i++) {
			GS$.append("<img id='robot" + i + "' class='rbt_lyr tf' src='" + Robot[i].image + "' alt='" + Robot[i].name + "'/>")
			GS$.find("#robot" + i).css({
				"top": ((Robot[i].y - vertoffset) * ty/* + 4*/) + "px", 
				"left": ((Robot[i].x - horzoffset) * tx/* + 4*/) + "px"
			}).animate({
				rotate: '+=' + (90 * Robot[i].facing) + 'deg'
			}, 1);
			RBT$[i] = GS$.find("#robot" + i);
			if (i == 0) {
				RMV$.find("#stat0 img").attr('src', Robot[0].thumb);
				RMV$.find("#stat0 .rdesig").text(Robot[0].name);
				RMV$.find("#stat0").click(function() {
					openConsole();
				}).hover(
					function() {
						RBT$[0].addClass("rbt_lyr_hover")
					},
					function() {
						RBT$[0].removeClass("rbt_lyr_hover")
					}
				);
			} else {
				var temps = "#stat" + i;
				RMV$.find("#regs" + (i - 1)).after('<div class="robostats enemybot" id="stat' + i + '"></div>');
				RMV$.find(temps).append('<img src="' + Robot[i].thumb + '"/><div class="stats"></div>');
				RMV$.find(temps + " .stats").append('<span class="rdesig"></span><br/>Health: <div class="dmg"> </div><br/>Lives: <div class="lvs"></div><br/>Flags: <div class="flg"></div>');
				RMV$.find(temps + " .rdesig").text(Robot[i].name);
				RMV$.find(temps).after('<div class="robomoves" id="regs' + i + '"></div>');
			}
		};
		RBT$[0].draggable({ //player 'bot draggable to see beneath and around it; reverts to starting position automatically
			revert: true
		});
		
		$(".enemybot").click(function() {
			showEnemyOptions($(this).attr('id').substr(4)); //showEnemyOptions
			if (OpOptBrd$.css('display') == 'none') {
				OpOptBrd$.slideToggle();
			}
		}).hover(
			function() {
				RBT$[$(this).attr('id').substr(4)].addClass("rbt_lyr_hover")
			},
			function() {
				RBT$[$(this).attr('id').substr(4)].removeClass("rbt_lyr_hover")
			}
		);
		
		refreshStats();	
	};	
	
	function refreshStats() {
		for (var i = 0; i < numbots; i++) {
			var tmplife = 9 - Robot[i].health;
			if (tmplife > 10) { 
				tmplife = 10;
			};
			RMV$.find("#stat" + i + " .dmg").css('background-position', (tmplife * -9) + 'px');
			RMV$.find("#stat" + i + " .lvs").css({
				width : (maxlife * 16) + "px",
				backgroundPosition : ((4 - Robot[i].lives) * -16) + 'px',
				marginRight: (24 + ((4 - maxlife) * 16)) + "px"
				});
			RMV$.find("#stat" + i + " .flg").css({
				width : (nuflags * 13) + "px",
				backgroundPosition : ((4 - Robot[i].flag) * -13) + "px",
				marginRight: (35 + ((4 - nuflags) * 13)) + "px",
				marginTop: "-15px"
			});
		};
	};
		
	/*Generate Deck*/
	
	function cardObj(pri, img, nm) {
		this.priority = pri;
		this.program = img;
		this.image = "images/cards/" + img + ".png";
		this.name = nm;
	}
	
	//Create cards
	var progCard = [];
	
	progCard[0] = new cardObj(0, "pwrdwn", "PWRDWN");
	
	for (var i = 1; i <= 6; i++) { // u-turn cards
		progCard[i] = new cardObj(i * 10, "turn_2", "U-TURN");
	}
	for (var i = 1; i <= 18; i++) { //turn cards
		progCard[(i * 2) + 5] = new cardObj(((i * 2) + 6) * 10, "turn_-1", "LEFT");
		progCard[(i * 2) + 6] = new cardObj(((i * 2) + 7) * 10, "turn_1", "RIGHT");
	}
	for (var i = 43; i <= 48; i++) { // back up cards
		progCard[i] = new cardObj(i * 10, "move_-1", "BACK-UP");
	}
	for (var i = 49; i <= 66; i++) { // move 1 cards
		progCard[i] = new cardObj(i * 10, "move_1", "MOVE 1");
	}
	for (var i = 67; i <= 78; i++) { // move 2 cards
		progCard[i] = new cardObj(i * 10, "move_2", "MOVE 2");
	}
	for (var i = 79; i <= 84; i++) { // move 3 cards
		progCard[i] = new cardObj(i * 10, "move_3", "MOVE 3");
	}
	
	var crackimg = "images/cards/cracked.png";
	
	//Create Deck
	
	var Deck = [];
	var Discard = [];
	
	for (var d = 0; d < 85; d++) {
		Deck[d] = d;
	};
	
	//Shuffle Deck
	for (var i = 0; i < 5; i++) {
		shuffle();
	};
	
	function shuffle() {
		if (Discard.length > 0) {
			for (var d = Discard.length; d > 0; d--) {
				rand = Rand(Deck.length - 1) + 1;
				var temp = Deck[rand];
				Deck[rand] = Discard[(d - 1)];
				Deck[Deck.length] = temp;
				Discard.length--;
			}
		};
		
		for (var d = 1; d < Deck.length; d++) {
			var rand = Rand(Deck.length - 1 ) + 1;
			var temp = Deck[d];
			Deck[d] = Deck[rand];
			Deck[rand] = temp;
		};
		
		for (var op = 1; op < OptionDeck.length; op++) {
			var rand = Rand(OptionDeck.length - 1) + 1;
			var temp = OptionDeck[op];
			OptionDeck[op] = OptionDeck[rand];
			OptionDeck[op] = temp;
		};
		
		checkDecks();
	};
	
	function checkDecks() {
		$("#discard_deck p").text(Discard.length);
		$("#prog_deck p").text(Deck.length - 1);
		//refreshStats();
	};
	
/* GAME PLAY
--------------------------------------------------------*/ 	
	
	/*Deal Cards*/
	
	function dealProgs() {
		compiled = false;
		gameturns++;
		trn$.text(gameturns);
		shuffle();
		
		/*Temp: troubleshooter*/
		$("#prog_deck").unbind('click');//*/
		
		hand$.css('display', 'block'); //show hand...
		proghand$.css('display', 'none'); //...not programs
		
		PC$.find("#Engage").click(function() { //click "Engage" - closes console and Runs program
			openConsole();
			RUN();
		}).find("img").removeClass("redlight").addClass("greenlight");
		PC$.find("#PDpanel").click(function() {
			powerDown(0);
			PC$.find("#PDpanel").unbind('click').find("img").removeClass("greenlight yellowlight").addClass("flashinglight");
		}).find("img").removeClass("redlight greenlight").addClass("yellowlight");
		if (Robot[0].health < 6) {
			PC$.find("#PDpanel img").removeClass("yellowlight").addClass("greenlight");
		};
		
		//disable Next Phase buttons
		NRB$.unbind('click').find('img').removeClass("greenlight").addClass("redlight");
		NRBguard$.css('display', 'block');
			
		for (var i = 1; i <= 9; i++) { //reset card in hand ids
			hand$.find("li:nth-child(" + i + ")").attr('id', 'hand' + i);
		};
		
		for (var i = 1; i < Robot[0].health; i++ ) {
			if (hand$.find("#hand" + i).hasClass("ui-state-disabled")) {
				hand$.find("#hand" + i).removeClass("ui-state-disabled").addClass("ui-state-default")
			};
		} 
		
		for (var i = 0; i < numbots; i++) { //deal to each robot
			if (Robot[i].pwrdwn == 1) { //if robot has started powering down...
				Robot[i].pwrdwn = 2; // full power down mode
				RBT$[i].animate({
						opacity: 0.8
					},{
						duration: 250
					})
				Robot[i].health = 9;
				LOG$.append("<br/><em>" + Robot[i].name + "</em> powers down!");
				for (var ii = 1; ii <= Robot[i].health; ii++) {
					hand[i][ii] = 0;
				};
			} else {
				for (var ii = 1; ii <= Robot[i].health; ii++) {
					hand[i][ii] = Deck[Deck.length - 1];
					Deck.length--;
				};
				if (Robot[i].health < 6) {
					for (var ii = Robot[i].health; ii < 6; ii++) {
						if (program[i][ii] == 0) { //remnants of a power down (incase 'bot revises with less than 5 health
							hand[i][ii] = Deck[Deck.length - 1];
							Deck.length--;
							//console.log("Deal random card to replace locked power down register.");
						} else {
							hand[i][ii] = program[i][ii]; 
						};
					};
				};
			};
		};
		checkDecks();
	};
	
	/*Get Option*/
	
	function getOption(r) {
	
	};
	
	/*Player Console*/
	
	function openConsole() { //toggles console, plus refreshes content within
		PC$.slideToggle();
		PC$.find(".programcard").empty();
		PC$.find(".nxtflg").text((Robot[0].flag + 1) + ": " + Flag[Robot[0].flag].x + " x " + Flag[Robot[0].flag].y);
		PC$.find(".curpos").text(Robot[0].x + " x " + Robot[0].y);
		PC$.find(".orient").text(Face[Robot[0].facing].compass);
		PC$.find(".arcpos").text(Robot[0].archx + " x " + Robot[0].archy);
		PC$.find(".ltactive").removeClass('ltactive');
		for (var i = 0; i < Robot[0].lives; i++) {
			PC$.find("#lftk" + i).addClass('ltactive');
		};
		PC$.find("#roboportrait img").attr('src', Robot[0].thumb);
		PC$.find(".undamaged").removeClass('undamaged');
		for (var i = 0; i <= Robot[0].health; i++) {
			PC$.find("#dt" + i).addClass('undamaged');
		};
		hand$.find(".programcard").removeClass('programcard').removeClass('ui-state-default');
		if (compiled) {
			for (var i = 1; i <= 5; i++) {
				proghand$.find("#cpro" + i).empty();
				if (i > Robot[0].health) {
					proghand$.find("#cpro" + i).addClass('programcard compiled ui-state-disabled');
					proghand$.find("#cpro" + i).append('<div class="priority">*' + progCard[program[0][i]].priority + '*</div>');
					proghand$.find("#cpro" + i).append('<img class="arrowimg" src="' + crackimg + '"/>');
				} else {
					proghand$.find("#cpro" + i).addClass('programcard compiled ui-state-default');
					proghand$.find("#cpro" + i).append('<div class="priority">' + progCard[program[0][i]].priority + '</div>');
					proghand$.find("#cpro" + i).append('<img class="arrowimg" src="' + progCard[program[0][i]].image + '"/>');
				};
				proghand$.find("#cpro" + i).append('<div class="movevalue">' + progCard[program[0][i]].name + '</div>');
			};
		} else {
			for (var i = 1; i < hand[0].length; i++) {
				hand$.find("#hand" + i).empty();
				if (i > Robot[0].health) {
					hand$.find("#hand" + i).addClass('programcard').addClass('ui-state-disabled');
					hand$.find("#hand" + i).append('<div class="priority">*' + progCard[hand[0][i]].priority + '*</div>');
					hand$.find("#hand" + i).append('<img class="arrowimg" src="' + crackimg + '"/>');
				} else {
					hand$.find("#hand" + i).addClass('programcard').addClass('ui-state-default');
					hand$.find("#hand" + i).append('<div class="priority">' + progCard[hand[0][i]].priority + '</div>');
					hand$.find("#hand" + i).append('<img class="arrowimg" src="' + progCard[hand[0][i]].image + '"/>');
				};
				hand$.find("#hand" + i).append('<div class="movevalue">' + progCard[hand[0][i]].name + '</div>');
			};
		};
		refreshStats();
	};
	
	function showOptions() {
		MyOptBrd$.find("ul").empty();
		MyOptBrd$.css({
			height: 45 + (Robot[0].option.length * 45) + "px" 
		}).slideToggle();
		if (Robot[0].option.length == 1) {
			var temp = 0;
		} else {
			var temp = 1;
		}
		for (var i = temp; i < Robot[0].option.length; i++) {
			MyOptBrd$.find("ul").append("<li>" + OptionDeck[Robot[0].option[i]] + "</li>");
		};
	};
	
	function showEnemyOptions(r) {
		OpOptBrd$.find("h2").text(Robot[r].name + "'S OPTIONS");
		OpOptBrd$.find("ul").empty();
		OpOptBrd$.css({
			height: 45 + (Robot[r].option.length * 45) + "px" 
		});
		if (Robot[r].option.length == 1) {
			var temp = 0;
		} else {
			var temp = 1;
		}
		for (var i = temp; i < Robot[r].option.length; i++) {
			OpOptBrd$.find("ul").append("<li>" + OptionDeck[Robot[r].option[i]] + "</li>");
		};
	};
	
	/*Set Turn*/
	
	function RUN() { //Sets programs
		compiled = true;
		$(".usedreg").removeClass("usedreg");
		PC$.find("#Engage").unbind('click').find("img").removeClass("greenlight").addClass("redlight");//disables "Run" button
		PC$.find("#PDpanel").unbind('click').find("img").removeClass("greenlight yellowlight").addClass("redlight");//disables "PD" button
		NRB$.click(function() {
			MasterMove();
		}).find("img").removeClass("redlight yellowlight").addClass("greenlight");//enables "Next Phase" button
		NRBguard$.css('display', 'none');
		
		$(".robomoves").empty();
		for (var i = 0; i < numbots; i++) { //set programs
			if (i != 0) { 
				if (Robot[i].health < 5) { //damaged robots declare power down
					powerDown(i);
				};
				if (Robot[i].pwrdwn < 2) {
					RobotAutoPlan(i); //set hand order for opponent robots
				};
			};
			var temp = "";
			for (var ii = 1; ii <= 5; ii++ ) {
				if (i == 0) { //if playerbot, set program based on arranged programs
					program[i][ii] = hand[i][parseInt(hand$.find("li:nth-child(" + ii + ")").attr('id').substr(4))];
					proghand$.find("#cpro" + ii).append('<div class="priority">' + progCard[program[i][ii]].priority + '</div>');
					proghand$.find("#cpro" + ii).append('<img class="arrowimg" src="' + progCard[program[i][ii]].image + '"/>');
					proghand$.find("#cpro" + ii).append('<div class="movevalue">' + progCard[program[i][ii]].name + '</div>');
					temp = temp + "<img class='smallreg sreg" + ii + "' src='" + progCard[program[i][ii]].image + "'/>";
				} else { //else set opponent move
					program[i][ii] = hand[i][ii];
					////console.log(Robot[i].name + "'s program[" + i + "][" + ii + "] = " + progCard[program[i][ii]].program);
					temp = temp + "<img class='smallreg sreg" + ii + "' src='images/cards/unknown.png'/>";
				};
			};
			$("#regs" + i).append(temp);
		};
		
		proghand$.css('display', 'block'); //display proghand$
		hand$.css('display', 'none'); //hide hand$
		
		for (var i = 0; i < numbots; i++) { //discard extra cards
			for (var ii = Robot[i].health; ii > 0; ii--) {
				if (hand[i][ii] > 0) { //do not discard PWRDWNs
					Discard[Discard.length] = hand[i][ii];
				}
				hand[i].length--;
			};
		};
		checkDecks();
	
	};
	
	function RobotAutoPlan(r) {
		//set initial "virtual values"
		
		//console.log(Robot[r].name + "'s CARDS:")
		for (var i = 1; i <= Robot[r].health; i++) {
			//console.log(i + ": " + progCard[hand[r][i]].program);
		}
		
		var vx = parseInt(Robot[r].x); //initial "virtual values"
		var vy = parseInt(Robot[r].y);
		var vf = parseInt(Robot[r].facing); //initial "virtual" facing

		for (var t = 1; t < 6; t++) { //five registers
			var bcv = 0; //best card value
			//console.log(" ");
			//console.log("Initial Position for register " + t + ": " + vy + " x " + vx + " [" + vf + "])");
			for (var tt = t; tt <= Robot[r].health; tt++) { //cycle each "remaining" card
				var df = 0; //
				var cv = 0;
				//calculate distance, optimal & secondary facing
				var dx = parseInt(vx) - parseInt(Flag[Robot[r].flag].x); //x distance
				var dy = parseInt(vy) - parseInt(Flag[Robot[r].flag].y); //y distance
				var dxa = Math.abs(dx); // absolute dx
				var dya = Math.abs(dy); // absolute dy
				if (dxa >= dya) {//east west
					if (dx <= 0) { //east
						var df0 = 1;
						var df3 = 3;
					} else { //west
						var df0 = 3;
						var df3 = 0;
					};
					if (dy <= 0) { //south
						var df1 = 2;
						var df2 = 0;
					} else { //north
						var df1 = 0;
						var df2 = 2;
					};
					if (dya == 0) {
						var tvr = dxa;
					} else {
						var tvr = dxa / dya;
					};
				} else { //north south
					if (dy <= 0) { //south
						df0 = 2;
						df3 = 0;
					} else { //north
						df0 = 0;
						df3 = 2;
					};
					if (dx <= 0) { //east
						df1 = 1;
						df2 = 3;
					} else { //west
						df1 = 3;
						df2 = 1;
					};
					if (dxa == 0) {
						var tvr = dya;
					} else {
						var tvr = dya / dxa;
					};
				};
				var cx = parseInt(vx); //set card "x"
				var cy = parseInt(vy); //set card "y"
				var dwalls = 0; //hitting any walls on the way?
				if (progCard[hand[r][tt]].program.substr(0, 4) == "move") { //"move" card
					var df = parseInt(vf);
					var mv = parseInt(progCard[hand[r][tt]].program.substr(5)); //number of movements
					//console.log("  mv (original) = " + mv);
					if (mv < 0) { //backwards?
						mv = 1;
						var domv = df + 2; //direction of movement backward
						if (domv > 3) {
							domv -= 4;
						};
					} else {
						var domv = df; //direction of movement forward
					};
					//console.log("  mv (new) = " + mv + "; df = " + df );
					for (var i = 0; i < mv; i++) { //loop through movements
						//console.log("  i out of mv = " + i + " : " + mv);
						var tmpcy = cy + parseInt(Face[domv].dy);
						var tmpcx = cx + parseInt(Face[domv].dx);
						if (tmpcx < 0) {
							tmpcx = -1;
						} else if (tmpcx > gridx) {
							tmpcx = gridx;
						};
						if (tmpcy < 0) {
							tmpcy = -1;
						} else if (tmpcy > gridy) {
							tmpcy = gridy;
						};
						cx = tmpcx;
						cy = tmpcy;
						//console.log("  tmpcy = " + tmpcy + "; tmpcx = " + tmpcx );
						//console.log("  pit and wall check: wall = " + parseInt(tile[cy][cx][Face[domv].frontwall]) + "; pit = " + parseInt(tile[cy][cx].flr));
						if (parseInt(tile[cy][cx][Face[domv].frontwall]) != 1) { //no wall
							if (parseInt(tile[cy][cx].flr) == 0) { //landed in a pit
								cv = -20;
								//console.log(" *** INTO A PIT (" + cy + " x " + cx + " [" + df + "]); CV = " + cv + "***");
							};
						} else {
							dwalls += 1;
						};
					};
				} else if (progCard[hand[r][tt]].program.substr(0, 4) == "turn") { //"turn" card
					var df = parseInt(vf) + parseInt(progCard[hand[r][tt]].program.substr(5));
				};
				//console.log("Card " + tt + " is " + progCard[hand[r][tt]].program + " and would move " + Robot[r].name + " to :" + cy + " x " + cx + " [" + df + "]");
				if (dwalls > 0) {
					cv -= dwalls;
					//console.log(" - hitting walls " + dwalls  + " times on the way, ending at :" + cy + " x " + cx + " [" + df + "]); CV = " + cv);	
				};
				//board elements
				if (parseInt(tile[cy][cx].cvr.substr(0,1)) > 0) { //conveyor
					var temp = tile[cy][cx].cvr;
					temp = temp.substr(0,1);
					temp = parseInt(temp);
					////console.log("   'temp' = " + temp + " (+1: " + (temp + 1) + ")")
					for (var i = 0; i < temp; i++) { //loop express or standard conveyor
						var tmpcvrdir = parseInt(tile[cy][cx].cvr_dir);
						////console.log("   'tmpcvrdir' = " + tmpcvrdir + " (+1: " + (tmpcvrdir + 1) + "); cy = " + cy + ", cx = " + cx);
						var tempx = parseInt(cx) + Face[tmpcvrdir].dx; //temp x
						var tempy = parseInt(cy) + Face[tmpcvrdir].dy; //temp y
						if (tmpcvrdir != parseInt(tile[tempy][tempx].cvr_dir) && parseInt(tile[tempy][tempx].cvr.substr(0, 1)) > 0) {
							//if conveyor moves onto another conveyor of different direction...
							var tempd = parseInt(tile[tempy][tempx].cvr_dir) - parseInt(tile[cy][cx].cvr_dir); //determine new direction
							if (tempd < -1 ) { 
								tempd = 1;
							};
							if (tempd > 2 ) { 
								tempd = -1;
							};
							////console.log("   'tempd' = " + parseInt(tile[tempy][tempx].cvr_dir) + " - " + parseInt(tile[cy][cx].cvr_dir) + " = " + tempd);
							cx = tempx;
							if (cx < -1) {
								cx = -1;
							} else if (cx > gridx) {
								cx = gridx;
							};
							cy = tempx;
							if (cy < -1) {
								cy = -1;
							} else if (cy > gridy) {
								cy = gridy;
							};
							df += tempd;
						};
					};
					//console.log(" + then conveyor moves " + Robot[r].name + " to : " + cy + " x " + cx + " [" + df + "]; CV = " + cv);
					//adjust cumulative rotations
					if (df < 0) {
						df += 4;
					};
					if (df > 3) {
						df -= 4;
					};
					//if 'bot ends on a conveyor, check direction and change CV accordingly
					if (parseInt(tile[cy][cx].cvr) > 0) { //landing on conveyor
						if (parseInt(tile[cy][cx].cvr_dir) == df0) { //conveyor going optional direction
							var tmpcv = tvr / 2;
							//console.log(" - conveyor going toward optimal facing ( +" + (tvr / 2) + ")");
						} else if (parseInt(tile[cy][cx].cvr_dir) == df1) { //secondary facing
							var tmpcv = (1 / tvr) / 2;
							//console.log(" - conveyor going toward secondary facing ( +" + ((1 / tvr) / 2) + ")");
						} else if (parseInt(tile[cy][cx].cvr_dir) == df2) { //tertiary facing
							var tmpcv = -(1 / tvr) / 2;
							//console.log(" - conveyor going toward tertiary facing ( -" + ((1 / tvr) / 2) + ")");
						} else if (parseInt(tile[cy][cx].cvr_dir) == df3){ //worse facing
							var tmpcv = -tvr / 2;
							//console.log(" - conveyor going opposite of optimal facing ( -" + (tvr / 2) + ")");
						};
						if (tile[cy][cx].cvr.substr(0,1) == "2") {
							tmpcv = tmpcv * 2;
							//console.log(" - expresss conveyor doubles it!");
						};
						cv += tmpcv;
						//console.log(" + ending on conveyor moving " + Face[tile[cy][cx].cvr_dir].compass + " modifies card value; CV = " + cv);
					};
				};
				if (tile[cy][cx].psh == "1" && tile[cy][cx].psh_reg.substr((t - 1), 1) == "1") { //active pusher
					var tempx = parseInt(cx) + Face[parseInt(tile[cy][cx].psh_dir)].dx; //temp x
					var tempy = parseInt(cy) + Face[parseInt(tile[cy][cx].psh_dir)].dy; //temp y
					cx = tempx;
					if (cx < -1) {
						cx = -1;
					} else if (cx > gridx) {
						cx = gridx;
					};
					cy = tempx;
					if (cy < -1) {
						cy = -1;
					} else if (cy > gridy) {
						cy = gridy;
					};
					//console.log(" -- then pusher moves " + Robot[r].name + " to : " + cy + " x " + cx + " [" + df + "]); CV = " + cv);
				};
				if (tile[cy][cx].gr == "1") { //right gear
					df += 1;
					cv -= 1; //not good to end on a gear
					//console.log(" -- then gear moves " + Robot[r].name + " to : " + cy + " x " + cx + " [" + df + "]); CV (-1) = " + cv);
				};
				if (tile[cy][cx].gr == "2") { //left gear
					df -= 1;
					cv -= 1; //not good to end on a gear
					//console.log(" -- then gear moves " + Robot[r].name + " to : " + cy + " x " + cx + " [" + df + "]); CV (-1) = " + cv);
				};
				if (tile[cy][cx].chr == "1" && tile[cy][cx].chr_reg.substr((t - 1), 1) == "1") { //active crusher
					cv = -20; //robots don't like dying
					//console.log(" -- then crusher squashes " + Robot[r].name + " (" + cy + " x " + cx + " [" + df + "]); CV (-20) = " + cv);
				};				
				//adjust cumulative rotations
				if (df < 0) {
					df += 4;
				};
				if (df > 3) {
					df -= 4;
				};
				//determine card value
				if (df == df0) { //optimal facing
					cv += tvr;
					//console.log(" + leaving " + Robot[r].name + " at OPTIMAL FACING at: " + cy + " x " + cx + " [" + df + "]; CV = " + cv);
				} else if (parseInt(tile[cy][cx].flg) == parseInt(Robot[r].flag) + 1) {
					cv += 20;
					//console.log(" + leaving " + Robot[r].name + " ON THE FLAG at: " + cy + " x " + cx + " [" + df + "]; CV (+20) = " + cv);
				} else if (df == df1) { //secondary facing
					cv += (1 / tvr);
					//console.log(" + leaving " + Robot[r].name + " at: " + cy + " x " + cx + " [" + df + "]; CV = " + cv);
				} else if (df == df2) { //tertiary facing
					cv -= (1 / tvr);
					//console.log(" + leaving " + Robot[r].name + " at: " + cy + " x " + cx + " [" + df + "]; CV = " + cv);
				} else if (df == df3){ //worse facing
					cv -= tvr;
					//console.log(" + leaving " + Robot[r].name + " at: " + cy + " x " + cx + " [" + df + "]; CV = " + cv);
				};
				if (parseInt(tile[cy][cx][Face[df].frontwall]) > 0) { //facing a wall
					cv -= (tvr / 2); 
					//console.log(" + leaving " + Robot[r].name + " facing a wall at: " + cy + " x " + cx + " [" + df + "]; CV = " + cv);
				}
				if ((parseInt(tile[cy][cx].flr) > 1 && parseInt(tile[cy][cx].flr) < 4) || parseInt(tile[cy][cx].flg) > 0) { //repair
					cv += (9 - Robot[r].health) * (parseInt(tile[cy][cx].flr) - 1);
					//console.log(" + leaving " + Robot[r].name + " on a REPAIR tile at: " + cy + " x " + cx + " [" + df + "]; CV (+" + ((9 - Robot[r].health) * (parseInt(tile[cy][cx].flr) - 1)) + ") = " + cv);
				};
				if (parseInt(tile[cy][cx].flr) < 1) { //pit
					cv = -20;
					//console.log(" *** INTO A PIT (" + cy + " x " + cx + " [" + df + "]); CV = " + cv + "***");
				};
				////console.log("  -- laser check: " + parseInt(tile[cy][cx].lbm));
				if (parseInt(tile[cy][cx].lbm) > 0) { //less laser beams
					cv -= (parseInt(tile[cy][cx].lbm) + 9 - Robot[r].health); //laserbeams larger deterent if robot is damaged
					//console.log(" + and in " + tile[cy][cx].lbm + " laserbeams (" + cy + " x " + cx + " [" + df + "]); CV (-" + (parseInt(tile[cy][cx].lbm) + 9 - Robot[r].health) + ") = " + cv);
				}
				cv += parseInt(dxa) - Math.abs(parseInt(cx) - parseInt(Flag[Robot[r].flag].x));
				cv += parseInt(dya) - Math.abs(parseInt(cy) - parseInt(Flag[Robot[r].flag].y)); 
				//value comparison
				//console.log("Card " + tt + " (" + progCard[hand[r][tt]].program + ") has FINAL VALUE of __" + cv + "__");
				if (tt == t) { //baseline card?
					bcv = cv;
					//set new virtual bot location
					var bcx = cx; //best card x
					var bcy = cy; //best card y
					var bcf = df; //best card facing
					//console.log("Card " + tt + " (" + progCard[hand[r][tt]].program + ") is first card of the bunch");
				} else if (cv > bcv) { //better than baseline?
					//console.log("Card " + tt + " (" + progCard[hand[r][tt]].program + ")'s value of " + cv + " is better than " + bcv + "; ***SWAPPING***");
					bcv = cv;
					//swap
					var temp = hand[r][t];
					hand[r][t] = hand[r][tt];
					hand[r][tt] = temp;
					var bcx = cx; //best card x
					var bcy = cy; //best card y
					var bcf = df; //best card facing
				};
			};
			vx = bcx;
			vy = bcy;
			vf = bcf;
		};
	};
	
	/*Turn Start*/
	
	function AutoNext() {
		if (autonext == false) {
			autonext = true;
			ANB$.find("img").removeClass("redlight").addClass("greenlight");
		} else {
			autonext = false;
			ANB$.find("img").removeClass("greenlight").addClass("redlight");
		}
	};
	
	function MasterMove() { //Master Move Function
		NRB$.find('img').removeClass("greenlight").addClass("yellowlight"); //disable NRB to prevent queuing
		NRBguard$.css('display', 'block');
	
		advanceRegister();
		
		if (curReg == 1 && autonext == true) {
			ANB$.find("img").removeClass("greenlight").addClass("flashinglight");
		}
		
		if (curReg < 6) {
		
			determineMoveOrder(); //board element order will also be determined by program priority
			
			DelRM = 0;
			DelCV = 0;
			DelPS = 0;
			DelGR = 0;
			DelCR = 0;
			DelLS = 0;			
			
			//Robots Move
			for (var i = 0; i < numbots; i++) {
				moveBots(i);
			};
			animateBots();
						
			//Board Elements
			// - Express Conveyors
			BE_Exp_Conv();
			// - All Conveyors
			BE_Conv();
			
			animateConveyors(DelRM);
			
			// - Pushers
			if (pushermove) {
				BE_Pusher(DelRM + DelCV);
				if (DelPS) {
					animatePushers(DelRM + DelCV);
				};
			};

			// - Gears
			if (gearmove) {
				BE_Gear(DelRM + DelCV + DelPS);
				if (DelGR) {
					animateGears(DelRM + DelCV + DelPS);
				};
			};
			
			// - Crushers
			if (crushermove) {
				BE_Crusher(DelRM + DelCV + DelPS + DelGR);
				if (DelCR) {
					animateCrushers(DelRM + DelCV + DelPS + DelGR);
				}
			}
			
			//Lasers
			// - Board Lasers	
			BE_Laser(DelRM + DelCV + DelPS + DelGR + DelCR);
			animateLasers(DelRM + DelCV + DelPS + DelGR + DelCR);
			
			//Checkpoints
			/* moved to end of animateLasers() BE_Checkpoint();*/
					
		} else {
			curReg = 0;
			for (var i = 0; i < numbots; i++) { //revive dead 'bots
				if (Robot[i].pwrdwn == 2) {
					Robot[i].pwrdwn = 0;
					LOG$.append("<br/><em>" + Robot[i].name + "</em> powers up!");
					RBT$[i].animate({
						opacity: 1
					},{
						duration: 250
					});
					PC$.find("#PDpanel").click(function() {
						powerDown(0);
						PC$.find("#PDpanel").unbind('click').find("img").removeClass("greenlight yellowlight").addClass("flashinglight");
					}).find("img").removeClass("redlight greenlight flashinglight").addClass("yellowlight");
				}
				if (Robot[i].alive == false) {
					roboReSpawn(i);
				}
				if (Robot[i].flag == nuflags) {
					GameOver(i);
					winner = true;
				}
			};	
			if (autonext == true) {
				ANB$.find("img").removeClass("flashinglight").addClass("greenlight");
			}
			if (!winner) {
				NRB$.unbind('click').find('img').removeClass("greenlight").addClass("redlight");
				NRBguard$.css('display', 'block');
				dealProgs();
				openConsole();
			}
		};
		
	};
	
	function roboReSpawn(r) {
		Robot[r].lives--;
		if (Robot[r].lives > 0) {
			Robot[r].x = Robot[r].archx;
			Robot[r].y = Robot[r].archy;
			Robot[r].alive = true;
			Robot[r].health = 7;
			Robot[r].pwrdwn = 0;
			PC$.find("#PDpanel").click(function() {
				powerDown(0);
				PC$.find("#PDpanel").unbind('click').find("img").removeClass("greenlight yellowlight").addClass("flashinglight");
			}).find("img").removeClass("redlight greenlight flashinglight").addClass("yellowlight");
			checkDoubleArch(r, 0); //check for double archive, Robot and number of tries
			
			//calculate optimal facing
			var dx = parseInt(Robot[r].x) - parseInt(Flag[Robot[r].flag].x);
			var dy = parseInt(Robot[r].y) - parseInt(Flag[Robot[r].flag].y); 
			if (Math.abs(dx) >= Math.abs(dy)) {
				if (dx <= 0) {
					Robot[r].facing = 1;
				} else {
					Robot[r].facing = 3;
				}
			} else {
				if (dy <= 0) {
					Robot[r].facing = 2;
				} else {
					Robot[r].facing = 0;
				}
			};
			
			RBT$[r].css({
				top : ((Robot[r].y - vertoffset) * ty/* + 4*/) + "px", 
				left : ((Robot[r].x - horzoffset) * tx/* + 4*/) + "px",
				display : "block",
				height : "60px",
				width : "60px"
			}).animate({
				opacity: 1
			}, 500).animate({
				rotate: (90 * Robot[r].facing) + 'deg'
			}, 500);
		};
		LOG$.append("<br/><em>" + Robot[r].name + "</em> uses an Archive Version and respawns at " + Robot[r].x + "x" + Robot[r].y + "!");
	};
	
	function checkDoubleArch(rbt, tries) {
		for (var i = 0; i < numbots; i++) {
			if (i != rbt) {
				if (Robot[rbt].x == Robot[i].x && Robot[rbt].y == Robot[i].y) {
					if (tries > 4) {
						var rx = Rand(5) - 2;
						var ry = Rand(5) - 2;
					} else {
						var rx = Rand(3) - 1;
						var ry = Rand(3) - 1;
					};
					var tempx = parseInt(Robot[rbt].x) + rx;
					var tempy = parseInt(Robot[rbt].y) + ry;
					if (tile[tempy][tempx].flr != "0") {
						Robot[rbt].x = tempx;
						Robot[rbt].y = tempy;
					}
					checkDoubleArch(rbt, tries + 1);
				};
			};
		};
	};
	
	function advanceRegister() {
		//roboMove = 0; //clear movements this register; if any robot moves, advance
		curReg++;
		if (curReg < 6) {
			LOG$.append("<br/><br/>TURN: " + gameturns + ", REGISTER: " + curReg);
		} else {
			LOG$.append("<br/><br/>END OF TURN: " + gameturns + "<br/>");
		}
		$(".nowreg").removeClass('nowreg').addClass('usedreg')
		$(".sreg" + curReg).addClass('nowreg');
		$(".activereg").removeClass('activereg');
		$("#reg" + curReg).addClass('activereg');
	};
	
	/*Robots Move*/

	function determineMoveOrder() {
	//order bot movement based on card priority
	
		for (var i = 0; i < numbots; i++) {
			roboOrder[i] = i;
		};
		for (var i = 0; i < numbots - 1; i++) {
			for (var ii = i; ii < numbots; ii++) {
				if (progCard[program[roboOrder[i]][curReg]].priority < progCard[program[roboOrder[ii]][curReg]].priority) {
					var temp = roboOrder[i];
					roboOrder[i] = roboOrder[ii];
					roboOrder[ii] = temp;
				};
			};
			$("#regs" + (i + 1) + " .sreg" + curReg).attr('src', progCard[program[(i + 1)][curReg]].image);
		};
	}
	
	function moveBots(r) {
		
		//move bots

		if (Robot[roboOrder[r]].alive) { //if 'bot is alive...
			var prog = progCard[program[roboOrder[r]][curReg]].program;
			LOG$.append("<br/><em>" + Robot[roboOrder[r]].name + "</em> [" + Robot[r].x + "x" + Robot[r].y + "/" + Face[Robot[r].facing].compass + "] plays " + progCard[program[roboOrder[r]][curReg]].name + " (priority: " + progCard[program[roboOrder[r]][curReg]].priority + ")");
			if (prog.substr(0, 4) == "move") {
				moveBotPre(roboOrder[r], prog.substr(5));
			} else if (prog.substr(0, 4) == "turn") {
				rotateBotPre(roboOrder[r], prog.substr(5), 0);
			};
		};
		
	};
	
	function moveBotPre(rmv, mv) {
		var temp = mv;
		var face = Robot[rmv].facing;
		Robot[rmv].curmv = 0;
		if (mv < 0) {
			face += 2;
			if (face > 3) {
				face -= 4;
			};
			temp = -temp;
		};
		var spd = Math.round(1500 / temp); //speed
		for (var i = 0; i < temp; i++) {
			if (Robot[rmv].alive) {
				moveBot(rmv, face, spd);	
			};
		};
		var logtemp = "<br/><em>" + Robot[rmv].name + "</em> moves " + Robot[rmv].curmv + " space";
		if (temp > 1) {
			logtemp += "s"
		};
		logtemp += " " + Face[face].compass + "."
		LOG$.append(logtemp);
		
	};
	
	/*TURN BOT*/
	function rotateBotPre(rtn, tn) {
		//turn robot r -90, 90, or 180 degrees depending on tn (-1, 1, 2) value
		tn = parseInt(tn);
		Robot[rtn].facing = parseInt(Robot[rtn].facing);
		////console.log(Robot[rtn].name + " starts facing: " + Face[Robot[rtn].facing].compass + ".");
		rotateBot(rtn, tn, 0);
		/*if (roboMove < 1) { //if no robots have moved, set "robomove" to 1.
			roboMove = 1;
		}*/
		LOG$.append("<br/><em>" + Robot[rtn].name + "</em> turns " + turning[tn] + " (now facing " + Face[Robot[rtn].facing].compass + ").");
	};
	
	/*MOVE BOT*/
	function moveBot(rmv, mbf, spd) {
		if (DelRM == 0) {
			DelRM = 1500;
		};
	
		var tempx = parseInt(Robot[rmv].x);
		var tempy = parseInt(Robot[rmv].y);
		var face = parseInt(mbf);
		
		var obstacle = 0; //any obstacles?
		//check for walls
		if (tile[tempy][tempx][Face[face].frontwall] > 0 ) {/**/
			////console.log(Robot[rmv].name + " is blocked by a wall to the " + Face[face].compass + "!");
			obstacle = 1;
			RBT$[rmv].animate({
				"top" : "+=" + (Face[face].dy * 3) + "px", 
				"left" : "+=" + (Face[face].dx * 3) + "px"
			}, {
				duration: (spd / 2),
				complete: function () {
					RBT$[rmv].animate({
						"top" : "-=" + (Face[face].dy * 3) + "px", 
						"left" : "-=" + (Face[face].dx * 3) + "px"
					}, (spd / 2));
				}
			});
		};
		
		if (obstacle == 0) { //only check for 'bots if no walls in the way
			for (var i = 0; i < numbots; i++) { //check other bots if they are obstacles
				if (Robot[i].x == (tempx + Face[face].dx) && Robot[i].y == (tempy + Face[face].dy)) { //push a bot!
					LOG$.append("<br/><em>" + Robot[rmv].name + "</em> <span>collides</span> into <em>" + Robot[i].name + "</em>!")
					moveBot(i, mbf, spd); //moves target bot
					if (Robot[i].x == (tempx + Face[face].dx) && (Robot[i].y == tempy + Face[face].dy)) { //if target bot doesn't move (wall, etc) ...
						obstacle = 1; //..then there's an obstacle
						LOG$.append("<br/><em>" + Robot[i].name + "</em> doesn't move.");
					} else {
						obstacle = 0; //..otherwise, bot moves
						LOG$.append("<br/><em>" + Robot[i].name + "</em> is pushed.");
						DelRM += spd;
					}
				}
			};
		};

		if (obstacle != 1) { //no obstacles? Move.
			Robot[rmv].curmv += 1;
			tempx += Face[face].dx;
			tempy += Face[face].dy;
			if (tempx < 0) {
				tempx = -1;
			};
			if (tempx > gridx) {
				tempx = gridx;
			};
			if (tempy < 0) {
				tempy = -1;
			};
			if (tempy > gridy) {
				tempy = gridy;
			};
			Robot[rmv].x = tempx;
			Robot[rmv].y = tempy;
			//LOG$.append("<br/><em>" + Robot[rmv].name + "</em> moves to square " + Robot[rmv].x + "x" + Robot[rmv].y + " (facing: " + Face[Robot[rmv].facing].compass + ")");
			RBT$[rmv].animate({
				"top" : ((Robot[rmv].y - vertoffset) * ty/* + 4*/) + "px", 
				"left" : ((Robot[rmv].x - horzoffset) * tx/* + 4*/) + "px"
			}, {
				duration: spd,
				easing: "linear"
			});
		};
		checkPit(rmv);
	};
	
	function rotateBot(rrt, tn, del) {
		if (DelRM == 0) {
			DelRM = 1500;
		};
		tn = parseInt(tn);
		var temp = tn * 90;
		RBT$[rrt].delay(del).animate({
			rotate: '+=' + temp + 'deg'
		}, {
			duration: 1500
		});	
		Robot[rrt].facing += tn;
		if (Robot[rrt].facing < 0) {
			Robot[rrt].facing = 3;
		};
		if (Robot[rrt].facing > 3) {
			Robot[rrt].facing -= 4;
		};
		//LOG$.append("<br/><em>" + Robot[rrt].name + "</em> turns " + temp + " degrees and is now facing: " + Face[Robot[rrt].facing].compass + ".");
	};
	
	/*Board Elements*/	
	
	function BE_Exp_Conv() {
		for (var i = 0; i < numbots; i++) {
			var temp = tile[Robot[i].y][Robot[i].x];
			if (temp.cvr.substr(0, 1) == "2") {
				if (DelCV == 0) {
					DelCV = 750;
				};
				moveBot(i, temp.cvr_dir, 750);
				LOG$.append("<br/>Express Conveyor moves <em>" + Robot[i].name + "</em> " + Face[temp.cvr_dir].compass + ".");
				if (parseInt(tile[Robot[i].y][Robot[i].x].cvr_dir) != parseInt(temp.cvr_dir) && parseInt(tile[Robot[i].y][Robot[i].x].cvr.substr(0, 1)) > 0) {
					var rdir = parseInt(tile[Robot[i].y][Robot[i].x].cvr_dir) - parseInt(temp.cvr_dir);
					if (rdir < -1 ) { 
						rdir = 1;
					};
					if (rdir > 2 ) { 
						rdir = -1;
					};
					rotateBot(i, rdir, 0);
					if (DelCV == 750) {
						DelCV = 2250;
					};
					LOG$.append("<br/>Express Conveyor turns <em>" + Robot[i].name + "</em> " + turning[rdir] + " (now facing " + Face[Robot[i].facing].compass + ").");
				};
			};
		};
	};
		
	function BE_Conv() {
		//All Conveyors
		for (var i = 0; i < numbots; i++) {
			var temp = tile[Robot[i].y][Robot[i].x];
			if (parseInt(temp.cvr.substr(0, 1)) > 0) {
				if (DelCV == 750) {
					DelCV = 1500;
				};
				if (DelCV == 0) {
					DelCV = 750;
				};
				moveBot(i, temp.cvr_dir, 750);
				LOG$.append("<br/>Conveyor moves <em>" + Robot[i].name + "</em> " + Face[temp.cvr_dir].compass + ".");
				if (parseInt(tile[Robot[i].y][Robot[i].x].cvr_dir) != parseInt(temp.cvr_dir) && parseInt(tile[Robot[i].y][Robot[i].x].cvr.substr(0, 1)) > 0) {
					var rdir = parseInt(tile[Robot[i].y][Robot[i].x].cvr_dir) - parseInt(temp.cvr_dir);
					if (rdir < -1 ) { 
						rdir = 1;
					};
					if (rdir > 2 ) { 
						rdir = -1;
					};
					rotateBot(i, rdir, 0);
					if (DelCV == 1500) {
						DelCV = 3000;
					};
					if (DelCV == 2250) {
						DelCV = 3000;
					};
					if (DelCV == 750) {
						DelCV = 2250;
					};
					LOG$.append("<br/>Conveyor turns <em>" + Robot[i].name + "</em> " + turning[rdir] + " (now facing " + Face[Robot[i].facing].compass + ").");
				};
			};
		};
	};
	
	function BE_Pusher(del) {
		//Pushers
		for (var i = 0; i < activeOnReg[curReg].length; i++) {
			Push0($("#tile_" + activeOnReg[curReg][i].y + "_" + activeOnReg[curReg][i].x).find('.pusher0'), del);
			Push1($("#tile_" + activeOnReg[curReg][i].y + "_" + activeOnReg[curReg][i].x).find('.pusher1'), del);
			Push2($("#tile_" + activeOnReg[curReg][i].y + "_" + activeOnReg[curReg][i].x).find('.pusher2'), del);
			Push3($("#tile_" + activeOnReg[curReg][i].y + "_" + activeOnReg[curReg][i].x).find('.pusher3'), del);
		};
		for (var i = 0; i < numbots; i++) {
			var temp = tile[Robot[i].y][Robot[i].x];
			if (parseInt(temp.psh) > 0 && temp.psh_reg.substr((curReg - 1), 1) == "1") {
				if (DelPS == 0) {
					DelPS = 1000;
				}
				////console.log(Robot[i].name + " just got PUSHED towards orientation " + temp.psh_dir);
				var td = parseInt(temp.psh_dir) + 2;
				if (td > 3) {
					td -= 4;
				};
				moveBot(i, td, 500);
				LOG$.append("<br/>Pusher moves <em>" + Robot[i].name + "</em> " + Face[td].compass + ".");
			};
		};
		
	};
		
	function BE_Gear(del) {
		//Gears
		MoveGears($(".gear1"), $(".gear2"), del);
		for (var i = 0; i < numbots; i++) {		
			var temp = tile[Robot[i].y][Robot[i].x];
			if (parseInt(temp.gr) > 0) {
				if (DelGR == 0) {
					DelGR = 1000;
				}
				var rdir = parseInt(temp.gr);
				if (rdir == 2) {
					rdir = -1;
				};
				rotateBot(i, rdir, del - 1500);
				LOG$.append("<br/>Gear turns <em>" + Robot[i].name + "</em> " + turning[rdir] + " (now facing " + Face[Robot[i].facing].compass + ").");
			};
		};
	};
	
	function BE_Crusher(del) {
		//Crushers
		for (var i = 0; i < activeOnReg[curReg].length; i++) {
			Crush($("#tile_" + activeOnReg[curReg][i].y + "_" + activeOnReg[curReg][i].x).find('.crusher'), del);
		};
		for (var i = 0; i < numbots; i++) {		
			var temp = tile[Robot[i].y][Robot[i].x];
			if (parseInt(temp.chr) > 0 && temp.chr_reg.substr((curReg - 1), 1) == "1") {
				if (DelCR == 0) {
					DelCR = 1000;
				}
				Robot[i].curdmg = Robot[i].health + 1; //take all robot's health
				LOG$.append("<br/><em>" + Robot[i].name + "</em> is CRUSHED for <span>" + (Robot[i].health + 1) + "</span> points of damage!");
				//checkDmg(i);
			};
		};
	};
	
	function BE_Laser(del) {
	
		//Draw Robot Lasers
		for (var i = 0; i < numbots; i++) { //'bots fire!
			Robot[i].x = parseInt(Robot[i].x);
			Robot[i].y = parseInt(Robot[i].y);
			if (Robot[i].alive && Robot[i].pwrdwn < 2 && Robot[i].curdmg <= Robot[i].health) { //no laser fire if robot is dead, powered down, or extremely damaged
				GS$.find("#tile_" + Robot[i].y + "_" + Robot[i].x).append("<div class='rlbm_lyr tf'><div class='rbtfire'></div></div>");
				//LOG$.append("<br/><em>" + Robot[i].name + "</em> fires " + Face[Robot[i].facing].compass + ".");
				switch(Robot[i].facing) { 
					case 0: //facing north
						////console.log("RL (" + Robot[i].name + ") Loop: " + (Robot[i].y + Face[Robot[i].facing].dy) + " to " + 0 );
						for (var rbm = Robot[i].y + Face[Robot[i].facing].dy; rbm >= 0; rbm--) {
							////console.log("RL (" + Robot[i].name + ") Loop " + rbm + "; check " + "#tile_" + rbm + "_" + Robot[i].x);
							if (tile[rbm][Robot[i].x][Face[Robot[i].facing].backwall] == 1) {
								////console.log(" - Beam hits " + Face[Robot[i].facing].backwall + " at " + rbm + "x" + Robot[i].x );
								rbm = -1;
							} else {
								tile[rbm][Robot[i].x].rlbm = Robot[i].weapon; //Add OPTIONAL weaponry later
								rlbm_lyr = "<div class='rlbm_lyr tf rlbm" + tile[rbm][Robot[i].x].rlbm + " orient" + Robot[i].facing + " shooter" + i + "'></div>";
								GS$.find("#tile_" + rbm + "_" + Robot[i].x).append(rlbm_lyr); //robot laserbeam layer
							}
						}
						break;
					case 1: //facing east
						////console.log("RL (" + Robot[i].name + ") Loop: " + (Robot[i].x + Face[Robot[i].facing].dx) + " to " + gridx );
						for (var rbm = Robot[i].x + Face[Robot[i].facing].dx; rbm <= gridx; rbm++) {
							////console.log("RL (" + Robot[i].name + ") Loop " + rbm + "; check " + "#tile_" + Robot[i].y + "_" + rbm);
							if (tile[Robot[i].y][rbm][Face[Robot[i].facing].backwall] == 1) {
								////console.log(" - Beam hits " + Face[Robot[i].facing].backwall + " at " + Robot[i].y + "x" + rbm );
								rbm = gridx + 1;
							} else {
								tile[Robot[i].y][rbm].rlbm = Robot[i].weapon; //Add OPTIONAL weaponry later
								rlbm_lyr = "<div class='rlbm_lyr tf rlbm" + tile[Robot[i].y][rbm].rlbm + " orient" + Robot[i].facing + " shooter" + i + "'></div>";
								GS$.find("#tile_" + Robot[i].y + "_" + rbm).append(rlbm_lyr); //robot laserbeam layer
							}
						}
						break;
					case 2: //facing south
						////console.log("RL (" + Robot[i].name + ") Loop: " + (Robot[i].y + Face[Robot[i].facing].dy) + " to " + gridy );
						for (var rbm = Robot[i].y + Face[Robot[i].facing].dy; rbm <= gridy; rbm++) {
							////console.log("RL (" + Robot[i].name + ") Loop " + rbm + "; check " + "#tile_" + rbm + "_" + Robot[i].x);
							if (tile[rbm][Robot[i].x][Face[Robot[i].facing].backwall] == 1) {
								////console.log(" - Beam hits " + Face[Robot[i].facing].backwall + " at " + rbm + "x" + Robot[i].x );
								rbm = gridy + 1;
							} else {
								tile[rbm][Robot[i].x].rlbm = Robot[i].weapon; //Add OPTIONAL weaponry later
								rlbm_lyr = "<div class='rlbm_lyr tf rlbm" + tile[rbm][Robot[i].x].rlbm + " orient" + Robot[i].facing + " shooter" + i + "'></div>";
								GS$.find("#tile_" + rbm + "_" + Robot[i].x).append(rlbm_lyr); //robot laserbeam layer
							}
						}
						break;
					case 3: //facing west
						////console.log("RL (" + Robot[i].name + ") Loop: " + (Robot[i].x + Face[Robot[i].facing].dx) + " to " + 0 );
						for (var rbm = (Robot[i].x + Face[Robot[i].facing].dx); rbm >= 0; rbm--) {
							////console.log("RL (" + Robot[i].name + ") Loop " + rbm + "; check " + "#tile_" + Robot[i].y + "_" + rbm);
							if (tile[Robot[i].y][rbm][Face[Robot[i].facing].backwall] == 1) {
								////console.log(" - Beam hits " + Face[Robot[i].facing].backwall + " at " + Robot[i].y + "x" + rbm );
								rbm = -1;
							} else {
								tile[Robot[i].y][rbm].rlbm = Robot[i].weapon; //Add OPTIONAL weaponry later
								rlbm_lyr = "<div class='rlbm_lyr tf rlbm" + tile[Robot[i].y][rbm].rlbm + " orient" + Robot[i].facing + " shooter" + i + "'></div>";
								GS$.find("#tile_" + Robot[i].y + "_" + rbm).append(rlbm_lyr); //robot laserbeam layer
							}
						}
						break;
				};
			};
		};
				
		$(".rlbm1").append("<div class='beam1'></div>");
		$(".rlbm2").append("<div class='beam21'></div>");
		$(".rlbm2").append("<div class='beam22'></div>");
		$(".rlbm3").append("<div class='beam31'></div>");
		$(".rlbm3").append("<div class='beam32'></div>");
		$(".rlbm3").append("<div class='beam33'></div>");
		$(".rlbm4").append("<div class='beam41'></div>");
		$(".rlbm4").append("<div class='beam42'></div>");
	
		//All Lasers
		
		$(".lbm_lyr").delay(del).animate({
			opacity: 1.0
		},{
			duration: 500
		}).delay(500).animate({
			opacity: 0.3
		},{
			duration: 500
		});
		
		$(".rlbm_lyr").delay(del).animate({
			opacity: 1.0
		},{
			duration: 500
		}).delay(500).animate({
			opacity: 0
		},{
			duration: 500,
			complete: function() {		
				$(".rlbm_lyr").remove();
				for (var i = 0; i < gridy; i++) {
					for (var ii = 0; ii < gridx; ii++) {
						tile[i][ii].rlbm = 0;
					}
				};
			}
		});
		
		for (var i = 0; i < numbots; i++) {	//is 'bot standing in a laserbeam?
			var temp = tile[Robot[i].y][Robot[i].x];
			if (parseInt(temp.lbm) > 0) {
				var factorylbm = parseInt(temp.lbm);
				if (factorylbm == 4) { //crossbeams
					factorylbm = 2;
				};
				Robot[i].curdmg += factorylbm;
				LOG$.append("<br/><em>" + Robot[i].name + "</em> is hit by factory lasers for <span>" + factorylbm + "</span> damage.");
			};
			if (parseInt(temp.rlbm) > 0) { //robot laser in square?
				for (var sh = 0; sh < numbots; sh++) { //determine shooter(s)
					if (sh != i) { //can't shoot self
						if ($("#tile_" + Robot[i].y + "_" + Robot[i].x).find(".rlbm_lyr").hasClass("shooter" + sh)) {
							var robotlbm = Robot[sh].weapon;
							LOG$.append("<br/><em>" + Robot[i].name + "</em> is hit by <em>" + Robot[sh].name + "'s</em> lasers for <span>" + robotlbm + "</span> damage.");
							Robot[i].curdmg += robotlbm;
						};
					};
				};
/*				var robotlbm = parseInt(temp.rlbm);
				Robot[i].curdmg += robotlbm
				LOG$.append("<br/><em>" + Robot[i].name + "</em> is hit by robot lasers for <span>" + robotlbm + "</span> damage.");*/
			};
			//checkDmg(i);
		};
	};
	
	/*ANIMATIONS*/
	
	function animateBots() {
		
		$(".ph0").animate({
			opacity: 0.5
		},{
			duration: 500
		}).delay(500).animate({
			opacity: 0
		},{
			duration: 500
		});	
	
	};
	
	function animateConveyors(del) {
		//Express Conveyors
		$(".ph1").delay(del).animate({
			opacity: 0.5
		},{
			duration: 500
		}).delay(500).animate({
			opacity: 0
		},{
			duration: 500
		});
	};
	
	function animatePushers(del) {
		$(".ph2").delay(del).animate({
			opacity: 0.5
		},{
			duration: 250
		}).delay(500).animate({
			opacity: 0
		},{
			duration: 250
		});
	};
	
	function animateGears(del) {
		$(".ph3").delay(del).animate({
			opacity: 0.5
		},{
			duration: 250
		}).delay(500).animate({
			opacity: 0
		},{
			duration: 250
		});
	};
	
	function animateCrushers(del) {
		$(".ph4").delay(del).animate({
			opacity: 0.5
		},{
			duration: 250
		}).delay(500).animate({
			opacity: 0
		},{
			duration: 250
		});
	};
	
	function animateLasers(del) {
		
		$(".ph5").delay(del).animate({
			opacity: 0.5
		},{
			duration: 500
		}).delay(500).animate({
			opacity: 0
		},{
			duration: 500,
			complete: function() {
				NRB$.find("img").removeClass("yellowlight").addClass("greenlight");//enables "Next Phase" button	
				NRBguard$.css('display', 'none');
				for (var i = 0; i < numbots; i++) { 
					checkDmg(i);
				};
				BE_Checkpoint();
				if (autonext == true) {
					MasterMove();
				}
			}
		});
	};
	
	function MoveGears(gear1$, gear2$, del) {
		gear1$.delay(del).animate({
			rotate: '+=90deg'
		}, 1000);
		gear2$.delay(del).animate({
			rotate: '-=90deg'
		}, 1000);
	};
	
	function Crush(crusher$, del) {
		crusher$.delay(del).animate({
			opacity: 1
		}, {
			duration: 500, 
			complete: function () {
				crusher$.animate({
					opacity : 0.5
				}, {
					duration: 500
				})
			}
		});
	};
		
	function Push0(pusher0$, del) {
		pusher0$.delay(del).animate({
			top: "6px"
		}, {
			duration: 500, 
			complete: function () {
				pusher0$.animate({
					top : "-6px"
				}, 500)
			}
		})
	};
		
	function Push1(pusher1$, del) {
		pusher1$.delay(del).animate({
			left: "14px"
		}, {
			duration: 500, 
			complete: function () {
				pusher1$.animate({
					left : "26px"
				}, 500)
			}
		})
	};
		
	function Push2(pusher2$, del) {
		pusher2$.delay(del).animate({
			top: "33px"
		}, {
			duration: 500, 
			complete: function () {
				pusher2$.animate({
					top : "45px"
				}, 500)
			}
		})
	};
		
	function Push3(pusher3$, del) {
		pusher3$.delay(del).animate({
			left: "-12px"
		}, {
			duration: 500, 
			complete: function () {
				pusher3$.animate({
					left : "-24px"
				}, 500)
			}
		})
	};
	
	/*Check Points*/
	
	function BE_Checkpoint() {
		for (var i = 0; i < numbots; i++) {
		//Checkpoint
			var temp = tile[Robot[i].y][Robot[i].x];
			if (parseInt(temp.flg) > 0 || parseInt(temp.flr) > 1) {
				if (Robot[i].y != Robot[i].archy || Robot[i].x != Robot[i].archx) {//hasn't archived here recently
					LOG$.append("<br/><em>" + Robot[i].name + "</em> archives at " + Robot[i].x + "x" + Robot[i].y);
					AnimateIcon(i, "save", 250, 1250);
				};
				//archive
				Robot[i].archy = Robot[i].y;
				Robot[i].archx = Robot[i].x;
				if (curReg == 5) {
					if (parseInt(temp.flr) == 2 || parseInt(temp.flg) > 0) {
						Robot[i].health++;
						if (Robot[i].health > 9) {
							Robot[i].health = 9;
							LOG$.append("<br/><em>" + Robot[i].name + "</em> is already at max health (" + Robot[i].health + "/9 points)");
						} else {
							LOG$.append("<br/><em>" + Robot[i].name + "</em> is repaired (now at " + Robot[i].health + "/9 points)");
							AnimateIcon(i, "wrench", 0, 1000);
						};
					};
					if (parseInt(temp.flr) == 3) {
						Robot[i].health++;
						if (Robot[i].health > 9) {
							Robot[i].health = 9;
							LOG$.append("<br/><em>" + Robot[i].name + "</em> is already at max health (" + Robot[i].health + "/9 points)");
						} else {
							LOG$.append("<br/><em>" + Robot[i].name + "</em> is repaired (now at " + Robot[i].health + "/9 points)");
							AnimateIcon(i, "wrench", 0, 1000);
						};
						LOG$.append("<br/><em>" + Robot[i].name + "</em> receives an OPTION! (Or, at least, would have, if OPTIONS were in play yet...)");
						AnimateIcon(i, "hammer", 100, 1500);
					};
					if (parseInt(temp.flg) == parseInt(Robot[i].flag) + 1) {
						LOG$.append("<br/><em>" + Robot[i].name + "</em> has grabbed FLAG #" + temp.flg + "!");
						AnimateIcon(i, "flag", 0, 2000);
						Robot[i].flag ++;
						refreshStats();
					};
				};
			};
		};
	};
	
	function AnimateIcon(r, icon, del, spd) { //robot, icon, delay, speed
		var tempy = (Robot[r].y - vertoffset) * ty + 20;
		var tempx = (Robot[r].x - horzoffset) * tx + Rand(40);
		GS$.append("<img class='ani_icon' id='ai_" + r + "_" + tempx + "' src='images/" + icon + "_icon.png'/>");
		$("#ai_" + r + "_" + tempx).css({
			"top": tempy + "px",
			"left": tempx + "px"
		}).delay(del).animate({
			"top": "-=60",
			"opacity": "0"
		},{
			duration: spd,
			complete: function() {
				$(this).remove()
			}
		});
	};
	
	/*Robot Damage*/	
	
	function checkDmg(curbot) {
		if (Robot[curbot].curdmg > 0 && Robot[curbot].alive == true) {
			if (Robot[curbot].curdmg < Robot[curbot].health) {
				for (var i = 0; i < Robot[curbot].curdmg; i++) {
					AnimateIcon(curbot, "damage", 500 * i, 2000 - (500 * i));
				};
			}
			Robot[curbot].health -= Robot[curbot].curdmg;
			LOG$.append("<br/><em>" + Robot[curbot].name + "</em> has taken <span>" + Robot[curbot].curdmg + "</span> total damage (now at " + Robot[curbot].health + " health).");
			if (Robot[curbot].health < 0) {
				Robot[curbot].alive = false;
				RBT$[curbot].effect('explode');
				LOG$.append("<br/><em>" + Robot[curbot].name + "</em> has taken fatal damage and has been <span>DESTROYED</span>!");
			};
			Robot[curbot].curdmg = 0;
			refreshStats();
		};
	};

	function checkPit(rpit) {
		if (parseInt(tile[Robot[rpit].y][Robot[rpit].x].flr) == 0 || Robot[rpit].y < 0 || Robot[rpit].y > gridy || Robot[rpit].x < 0 || Robot[rpit].x > gridx) { //robot falls into a pit or off board
			Robot[rpit].curdmg = Robot[rpit].health + 1;
			LOG$.append("<br/><em>" + Robot[rpit].name + "</em> falls into the abyss (for <span>" + (Robot[rpit].health + 1) + "</span> damage)!");
			RBT$[rpit].animate({
				"top" : "+=30px", 
				"left" : "+=30px", 
				"height" : "0px", 
				"width" : "0px", 
				"opacity" : "0"
			}, {
				duration: 1000,
				complete: function() {
					checkDmg(rpit);				
				}
			});
		};
	};
	
	function powerDown(r) {
		Robot[r].pwrdwn = 1;
		LOG$.append("<br/><em>" + Robot[r].name + "</em> begins to power down!");
	};
	
	function GameOver(r) {
		/*LOG$.append("GAME OVER! " + Robot[r].name + " WINS by capturing all " + nuflags + " flags!");
		alert("GAME OVER! " + Robot[r].name + " WINS by capturing all " + nuflags + " flags!");*/
		var temp = "<h3><em>" + Robot[r].name + "</em> WINS by capturing all " + nuflags + " flags in " + gameturns + " turns!</h3>";
		temp += "<img src='" + Robot[r].thumb + "' />";
		$("#WinnersCircle").append(temp);
		$("#GameOver").fadeIn();
		
		$("#WinnersCircle").find("#newgame").click(function () { //set "submit button
			location.reload();
		}).hover(
			function() {
				$(this).find('img').addClass('greenlight').removeClass('flashinglight');
			},
			function() {
				$(this).find('img').addClass('flashinglight').removeClass('greenlight');
			}
		);
	}
	
	/* TROUBLE SHOOTING */
	function Troubleshoot() {
		for (var i = 0; i < gridy; i++) {
			for (var ii = 0; ii < gridx; ii++) {
				$("#tile_" + i + "_" + ii).click(function() {
					var temp = $(this).attr('id');
					//console.log("TILE DATA DUMP (" + temp + ")");
					var temps = temp.split("_");
					//console.log("this.flr = " + tile[temps[1]][temps[2]].flr + "  (+1 : " + (tile[temps[1]][temps[2]].flr + 1) + ")");
					//console.log("this.chr = " + tile[temps[1]][temps[2]].chr + "  (+1 : " + (tile[temps[1]][temps[2]].chr + 1) + ")");
					//console.log("this.chr_reg = " + tile[temps[1]][temps[2]].chr_reg + "  (+1 : " + (tile[temps[1]][temps[2]].chr_reg + 1) + ")");
					//console.log("this.cvr = " + tile[temps[1]][temps[2]].cvr + "  (+1 : " + (tile[temps[1]][temps[2]].cvr + 1) + ")");
					//console.log("this.cvr_dir = " + tile[temps[1]][temps[2]].cvr_dir + "  (+1 : " + (tile[temps[1]][temps[2]].cvr_dir + 1) + ")");
					//console.log("this.flg = " + tile[temps[1]][temps[2]].flg + "  (+1 : " + (tile[temps[1]][temps[2]].flg + 1) + ")");
					//console.log("this.gr = " + tile[temps[1]][temps[2]].gr + "  (+1 : " + (tile[temps[1]][temps[2]].gr + 1) + ")");
					//console.log("this.lbm = " + tile[temps[1]][temps[2]].lbm + "  (+1 : " + (tile[temps[1]][temps[2]].lbm + 1) + ")");
					//console.log("this.lbm_dir = " + tile[temps[1]][temps[2]].lbm_dir + "  (+1 : " + (tile[temps[1]][temps[2]].lbm_dir + 1) + ")");
					//console.log("this.lsr = " + tile[temps[1]][temps[2]].lsr + "  (+1 : " + (tile[temps[1]][temps[2]].lsr + 1) + ")");
					//console.log("this.lsr_dir = " + tile[temps[1]][temps[2]].lsr_dir + "  (+1 : " + (tile[temps[1]][temps[2]].lsr_dir + 1) + ")");
					//console.log("this.psh = " + tile[temps[1]][temps[2]].psh + "  (+1 : " + (tile[temps[1]][temps[2]].psh + 1) + ")");
					//console.log("this.psh_dir = " + tile[temps[1]][temps[2]].psh_dir + "  (+1 : " + (tile[temps[1]][temps[2]].psh_dir + 1) + ")");
					//console.log("this.psh_reg = " + tile[temps[1]][temps[2]].psh_reg + "  (+1 : " + (tile[temps[1]][temps[2]].psh_reg + 1) + ")");
					//console.log("this.wll_d = " + tile[temps[1]][temps[2]].wll_d + "  (+1 : " + (tile[temps[1]][temps[2]].wll_d + 1) + ")");
					//console.log("this.wll_l = " + tile[temps[1]][temps[2]].wll_l + "  (+1 : " + (tile[temps[1]][temps[2]].wll_l + 1) + ")");
					//console.log("this.wll_r = " + tile[temps[1]][temps[2]].wll_r + "  (+1 : " + (tile[temps[1]][temps[2]].wll_r + 1) + ")");
					//console.log("this.wll_u = " + tile[temps[1]][temps[2]].wll_u + "  (+1 : " + (tile[temps[1]][temps[2]].wll_u + 1) + ")");

				})
			}
		}
	};
	
	/*$("#roboportrait").click(function() {
		GameOver(0);
	})//*/
	
});