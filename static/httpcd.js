/**
    httpcd.js - http codes game driver
	
	Anthony.Destefano@gmail.com - (CoreLogic) 2015
	
	Had the idea to create a simple flash-card tool to help study HTTP states and their associated codes.	
	What follows is the result, turned into a simple game designed to help drive interest in the HTTP standard and help educate developers.
		
	- display HTTP status response headers without the status codes
	- Player will provide the code
	- Check the answer
	- keep track of:
		- number of turns
		- score
		- list of correct answers
		- list of incorrect answers
		
*/

		
		// define audio elements
		var audio = new Array();
		// we must wait for the document to finish loading
		// before trying to access the DOM elements
		document.addEventListener('DOMContentLoaded', function() {
			audio['online'] = document.getElementById('sound_online');
			audio['click'] = document.getElementById('sound_click');
			audio['incoming'] = document.getElementById('sound_incoming');
			audio['cheer'] = document.getElementById('sound_cheer');
			audio['bad'] = document.getElementById('sound_bad');
		    audio['keyboard'] = document.getElementById('sound_keyboard');
			audio['wrong'] = document.getElementById('sound_wrong');
			audio['beeps'] = document.getElementById('sound_beeps');		
			audio['failure'] = document.getElementById('sound_failure');
			audio['tick'] = document.getElementById('sound_ticking');
			audio['bell'] = document.getElementById('sound_bell');
			audio['tick'] = document.getElementById('sound_tick');	
			
		});


		// HTTP HEAD Game driver
		var G = {
			ver : "0.9",
			DEBUG : true, // print to console
			// don't crash IE with dev tools closed!
			log : function (str) {
				if (window.console && window.console.log && this.DEBUG) {
					window.console.log(str);
				}
			},
			score 		: 0,   // bragging rights
			HDRS		: [],  // list of header data objects
			ans_c 		: [],  // correct answer list
			ans_w 		: [],  // incorrect answer list
			pointer 	: 0,   // points to current status description
			turns   	: 0,   // number of player turns 
			timer		: 10,  // answer timeout
			interval	: 0,   // countdown interval
			
			// define an HTTP status response object constructor
			HTTP : function (code, desc, ref, reflink) {
				this.code = code;
				this.desc = desc;
				this.ref = ref; // let's try to be informative
				this.reflink = reflink;
			},			
			// grab version number and show on page
			setVer : function () {
				jQuery('#version').html(this.ver);
			},
			init : function () {
				this.log("HTTP HEAD Game v" + this.ver);
				this.loadData();
				// if we didn't screw up building the data, let's go
				if (this.chkData()) {
					this.setVer();
				} else {
					alert("error loading headers");
				}
				jQuery('#play').focus();
				// Play button click
				jQuery('#play').click(function() {
					audio['click'].play()
					audio['online'].play()
					console.log("Click");
					jQuery('#codes').hide('fast');
					jQuery('.image-container').hide('fast');
					jQuery('#play').hide('fast');
					jQuery('.desc').hide('fast');
					jQuery('#game-screen').fadeIn('slow');
					setTimeout(function() {
						G.incoming(); // start the first question
					}, 2000);
					
				});
			},
			
			// make sure our header data is not FUBAR
			chkData : function () {
				if (this.HDRS.length > 0) {
					this.log("loading header data compete, " + this.HDRS.length + " records loaded");
					return true;
				} else {
					this.log("loadData::error loading http header list");
					return false;
				}
			},
			// enter button handler
			btnEnter : function () {
				audio['click'].play();
				//this.log("btn click");
				clearInterval(this.interval);
				this.chkAnswer();
			},
			btnRestart : function () {
				audio['click'].play();
				this.log("Restart game");
				G.saveGame();	
				location.reload();
			},
			test : function() {
				this.ans_c[0] = G.HDRS[0];
				this.ans_c[1] = G.HDRS[2];
				this.ans_c[2] = G.HDRS[3];
				this.ans_c[3] = G.HDRS[4];
				this.ans_c[4] = G.HDRS[5];

				this.ans_w[0] = G.HDRS[1];
				this.ans_w[1] = G.HDRS[6];
				this.ans_c[2] = G.HDRS[7];
				this.ans_c[3] = G.HDRS[8];

				this.showResults();
			},
			saveGame : function (){
				var out = {
					"agent"   : navigator.userAgent,
					"date"    : new Date(),
					"level"   : this.turns, 
					"correct" : new Array(),
					"wrong"   : new Array(),

				}
				console.log("Correct Answers:");
				var ac = G.ans_c;
				for (var i=0;i<ac.length;i++) {
					console.log(ac[i].code);
					out.correct.push(ac[i].code);
				}
				console.log("Wrong Answers:");
				var aw = G.ans_w;
				for (var i=0;i<aw.length;i++) {
					console.log(aw[i].code);
					out.wrong.push(aw[i].code);
				}
				console.dir(out);
				console.log("Saving Game data...");
				jQuery.ajax({
					type: "POST",
					url: "http://localhost/save-game",
					data: JSON.stringify(out),
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					success: function (data) {
						console.log("POST request was successful.");
						console.log(data);
					},
					error: function (error) {
						console.error("POST request failed.");
						console.error(error);
					}
				});
			},
			// click the pointer forward
			next : function() {
				this.log("loading next response header");
				jQuery('#code').attr('class', '');
				var tmp = this.pointer + 1;
				if (tmp < this.HDRS.length) {
					this.timer = 10;
					this.updateTimer();
					this.pointer = tmp;
					this.turns = this.turns + 1;
					this.turn();
					// 
					jQuery('#response').html("HTTP/1.x  <b style='color:red'>???</b> " + this.HDRS[this.pointer].desc + " ");
					
					this.log("waiting for player answer..");
				}
			},
			// each answer is timed, let's use a full second intervals
			startTimer : function() {
				this.interval = window.setInterval(function() {
					G.countTimer();
				}, 1000);	
				
			},
			// let's decrement a count and simply click the button when over
			countTimer : function() {
				if (this.timer > 0) {
					this.timer = this.timer - 1;
					audio['tick'].play();
					this.updateTimer();
				
				} else {
					audio['bell'].play();
					clearInterval(this.interval);
					this.timer = 0;
					jQuery('#btn_enter').click();
				}	
			},
			// update UI
			updateTimer : function () {
				jQuery('#time-left').text(this.timer);
			},			
			// display turn in UI
			turn : function () {
				jQuery("#turns").html(this.turns);
			},
			// given an item, return if in list
			inList : function (item, list) {
				var seen = 0;
				for (var i=0; i < list.length; i++) {
					if (list[i].code == item.code) {
						seen = 1;
						break;
					}
				}
				return seen;
			},
			setScore : function () {
				jQuery('#score').html(this.score);
				jQuery('#correct').html(this.ans_c.length);
				jQuery('#wrong').html(this.ans_w.length);
				this.showResults(1);
			},
			showResults : function (show_items) {
				this.log("show results...(receipt) ");
				
				var out_c = "";
				for (var i=0; i < this.ans_c.length; i++) {
					out_c += '' + this.ans_c[i].code + ':' + this.ans_c[i].desc + "\n"; 
				}
				if (show_items) {
					jQuery("#correct").html("Correct:"+this.ans_c.length);
					jQuery("#list_c").html(out_c);
				} else {
					jQuery("#list_c").html(out_c);
				}
				
				var out_w = "";
				for (var i=0; i < this.ans_w.length; i++) {
					out_w += '' + this.ans_w[i].code + ':' + this.ans_w[i].desc + "\n"; 
				}
				if (show_items) {
					jQuery("#wrong").html("Wrong:"+this.ans_w.length);
					jQuery("#list_w").html(out_w);
				} else {
					jQuery("#list_w").html(out_w);
				}
			},
			// animate the next response header description
			incoming : function () {
				audio['beeps'].play();
				this.log("\nIncoming...");
				// blink the response "stage"
				jQuery('#response').css('color','red').html("<i>...incoming...</i>").delay(200).fadeOut().fadeIn('slow').delay(200).fadeOut();
				jQuery('#btn_enter').val("Enter").attr('class','').attr('class','btn_enter');
				//jQuery('#response').css('color','black');	
				// set a delay, then fade in the next 
				// response description along with
				// player answer controls
				window.setTimeout(function() {
					G.next();
					jQuery('#response').css('color','black').fadeIn("slow");
					jQuery('#code').val("");
					jQuery("#player_controls").fadeIn("slow");
					jQuery('#code').focus();
				},2200);
				window.setTimeout(function() {
					G.startTimer();
				}, 2400);
			},
			// fade out last answer
			outgoing : function () {
				this.log("Outgoing");
				jQuery('#player_controls').fadeOut("fast");
				jQuery('#result').delay(20).html("");
			},
			// do the real worx!
			chkAnswer : function () {
				this.log("chkAnswer...");
				
				jQuery('#result').attr('class', '');
				// get button text value (text shown on button face)
				var btn_value = jQuery('#btn_enter').val();
								
				// User provided an answer (btn txt reads 'Enter')
				if (btn_value == "Enter") {
					
					//this.log("Click: enter");
					var playerAnswer = jQuery('#code').val();
					var gameAnswer = this.HDRS[this.pointer].code;
					
					this.log("P:" + playerAnswer);
					this.log("G:" + gameAnswer);
					
					//Easter eggs
					if (playerAnswer == "FH") { window.location.href="http://adestefa.com/farmhero/"; }
					if (playerAnswer == "VEL") { window.location.href="http://adestefa.com/"; }
					
					// format the actual answer "code" : "desc"
					var out = '<pre>"' + this.HDRS[this.pointer].code + ':' + this.HDRS[this.pointer].desc + '"</pre><div style="margin-top:-5px;"><a target="_blank" style="font-size:11px;" href="' + this.HDRS[this.pointer].reflink + '">' + this.HDRS[this.pointer].ref + '</a></div><br />'; 
					jQuery('#result').html(""); // clear game answer message
					// correct 
					// -------
					if (playerAnswer == gameAnswer) {
						audio['cheer'].play();
						this.log("correct");
						jQuery("#content").attr("class","").addClass("board").addClass("shadow").addClass("board_c");
						// check if we have already stored this answer in the correct and wrong lists
						if (!this.inList(this.HDRS[this.pointer], this.ans_c)) {
							if (!this.inList(this.HDRS[this.pointer], this.ans_w)) {
								this.ans_c[this.ans_c.length] = this.HDRS[this.pointer];
							}
						}	
						this.score = this.score + 5;
						jQuery('#response').html("HTTP/1.x  <b style='color:green'>" + this.HDRS[this.pointer].code + "</b> " + this.HDRS[this.pointer].desc + " ");
						// since player gave us a good answer
						// let us change it to next to load the next response
						jQuery('#btn_enter').val("Next").attr('class','').attr('class','btn_next_c');
						jQuery('#result').html("CORRECT!"+out).addClass("correct").fadeIn("slow");
					
					// wrong
					// -------
					} else {
						audio['wrong'].play();
						this.log("wrong");
						jQuery("#content").attr("class","").addClass("board").addClass("shadow").addClass("board_w");
						//jQuery('#code').addClass("wrong");
						if (!this.inList(this.HDRS[this.pointer], this.ans_w)) {
							this.ans_w[this.ans_w.length] = this.HDRS[this.pointer];
						}
						jQuery('#response').html("HTTP/1.x  <b style='color:red'>" + this.HDRS[this.pointer].code + "</b> " + this.HDRS[this.pointer].desc + " ");
						jQuery('#result').html("Incorrect!"+out).addClass("wrong").fadeIn("slow");
						if (G.ans_w.length >= 5) {
							setTimeout(function() {
						      G.gameOver();		
							}, 1000);
							
						} else {
							jQuery('#btn_enter').val("Next").attr('class','').attr('class','btn_next_w');
						}
					}
					this.setScore();
					
				
				// Clicked next (btn txt reads 'Next')	
				} else {
					// change the button text back to
					// allow player to enter answer
					//this.log("Click: next");
					jQuery("#content").attr("class","").addClass("board").addClass("shadow")
					this.outgoing();
					jQuery('#code').val("");
					this.incoming();	
					this.turn();
				}
			},
			gameOver : function () {
				jQuery('#header').fadeOut("fast");
				jQuery('#player_controls').fadeOut("fast");
                jQuery('#header_game_over').fadeIn("slow");
				jQuery('#game_over').fadeIn("slow");
				audio['failure'].play();
			},
			loadData : function () {
				this.log("loading data...");
				
				// load our game data, this can be an include file, even JSON...
				G.HDRS[0] = new G.HTTP("404", "Not Found", "RFC7231, Section 6.5.4", "http://www.iana.org/go/rfc7231");
				G.HDRS[1] = new G.HTTP("200", "OK", "RFC7231, Section 6.3.1", "http://www.iana.org/go/rfc7231");
				G.HDRS[2] = new G.HTTP("304", "Not Modified", "RFC7232, Section 4.1", "http://www.iana.org/go/rfc7232");
				G.HDRS[3] = new G.HTTP("301", "Moved Permanently", "RFC7231, Section 6.4.2", "http://www.iana.org/go/rfc7231");
				G.HDRS[4] = new G.HTTP("403", "Forbidden", "RFC7231, Section 6.5.3", "http://www.iana.org/go/rfc7231");
				G.HDRS[5] = new G.HTTP("500", "Internal Server Error", "RFC7231, Section 6.6.1", "http://www.iana.org/go/rfc7231");
				G.HDRS[6] = new G.HTTP("502", "Bad Gateway", "RFC7231, Section 6.6.3", "http://www.iana.org/go/rfc7231");
				G.HDRS[7] = new G.HTTP("503", "Service Unavailable", "RFC7231, Section 6.6.4", "http://www.iana.org/go/rfc7231");
				G.HDRS[8] = new G.HTTP("400", "Bad Request", "RFC7231, Section 6.5.1", "http://www.iana.org/go/rfc7231");
				G.HDRS[9] = new G.HTTP("408", "Request Timeout", "RFC7231, Section 6.5.7", "http://www.iana.org/go/rfc7231");
				G.HDRS[10] = new G.HTTP("505", "HTTP Version Not Supported", "RFC7231, Section 6.6.6", "http://www.iana.org/go/rfc7231");
				G.HDRS[11] = new G.HTTP("302", "Found", "RFC7231, Section 6.4.3", "http://www.iana.org/go/rfc7231");
				G.HDRS[12] = new G.HTTP("308", "Permanent Redirect", "RFC7538", "http://www.iana.org/go/rfc7538");
				G.HDRS[13] = new G.HTTP("401", "Unauthorized", "RFC7235, Section 3.1", "http://www.iana.org/go/rfc7235");
				G.HDRS[14] = new G.HTTP("501", "Not Implemented", "RFC7231, Section 6.6.2", "http://www.iana.org/go/rfc7231");
				G.HDRS[15] = new G.HTTP("504", "Gateway Timeout", "RFC7231, Section 6.6.5", "http://www.iana.org/go/rfc7231");
				G.HDRS[16] = new G.HTTP("307", "Temporary Redirect", "RFC7231, Section 6.4.7", "http://www.iana.org/go/rfc7231");
				G.HDRS[17] = new G.HTTP("511", "Network Authentication Required", "RFC6585", "http://www.iana.org/go/rfc6585");
				G.HDRS[18] = new G.HTTP("506", "Variant Also Negotiates", "RFC2295", "http://www.iana.org/go/rfc2295");
				G.HDRS[19] = new G.HTTP("507", "Insufficient Storage", "RFC4918", "http://www.iana.org/go/rfc4918");
				G.HDRS[20] = new G.HTTP("508", "Loop Detected", "RFC5842", "http://www.iana.org/go/rfc5842");
				G.HDRS[21] = new G.HTTP("510", "Not Extended", "RFC2774", "http://www.iana.org/go/rfc2774");
				
				
				G.HDRS[22] = new G.HTTP("300", "Multiple Choices", "RFC7231, Section 6.4.1", "http://www.iana.org/go/rfc7231");
				G.HDRS[23] = new G.HTTP("303", "See Other", "RFC7231, Section 6.4.4", "http://www.iana.org/go/rfc7231");
				G.HDRS[24] = new G.HTTP("305", "Use Proxy", "RFC7231, Section 6.4.5", "http://www.iana.org/go/rfc7231");
				G.HDRS[25] = new G.HTTP("306", "(Unused)", "RFC7231, Section 6.4.6", "http://www.iana.org/go/rfc7231");
				G.HDRS[26] = new G.HTTP("309", "Unassigned", "", "");

				
				G.HDRS[27] = new G.HTTP("402", "Payment Required", "RFC7231, Section 6.5.2", "http://www.iana.org/go/rfc7231");
				G.HDRS[28] = new G.HTTP("405", "Method Not Allowed", "RFC7231, Section 6.5.5", "http://www.iana.org/go/rfc7231");
				G.HDRS[29] = new G.HTTP("406", "Not Acceptable", "RFC7231, Section 6.5.6", "http://www.iana.org/go/rfc7231");
				G.HDRS[30] = new G.HTTP("407", "Proxy Authentication Required", "RFC7235, Section 3.2", "http://www.iana.org/go/rfc7235");
				
				G.HDRS[31] = new G.HTTP("409", "Conflict", "RFC7231, Section 6.5.8", "http://www.iana.org/go/rfc7231");
				G.HDRS[32] = new G.HTTP("410", "Gone", "RFC7231, Section 6.5.9", "http://www.iana.org/go/rfc7231");
				G.HDRS[33] = new G.HTTP("411", "Length Required", "RFC7231, Section 6.5.10", "http://www.iana.org/go/rfc7231");
				G.HDRS[34] = new G.HTTP("412", "Precondition Failed", "RFC7232, Section 4.2", "http://www.iana.org/go/rfc7232");
				G.HDRS[35] = new G.HTTP("413", "Payload Too Large", "RFC7231, Section 6.5.11", "http://www.iana.org/go/rfc7231");
				
				G.HDRS[36] = new G.HTTP("414", "URI Too Long", "RFC7231, Section 6.5.12", "http://www.iana.org/go/rfc7231");
				G.HDRS[37] = new G.HTTP("415", "Unsupported Media Type", "RFC7231, Section 6.5.13", "http://www.iana.org/go/rfc7231");
				G.HDRS[38] = new G.HTTP("416", "Range Not Satisfiable", "RFC7233, Section 4.4", "http://www.iana.org/go/rfc7233");
				G.HDRS[39] = new G.HTTP("417", "Expectation Failed", "RFC7231, Section 6.5.14", "http://www.iana.org/go/rfc7231");
				G.HDRS[40] = new G.HTTP("418", "Unassigned", "h", "h");
				G.HDRS[41] = new G.HTTP("421", "Misdirected Request", "RFC7540, Section 9.1.2", "http://www.iana.org/go/rfc7540");
				
				G.HDRS[42] = new G.HTTP("422", "Unprocessable Entity", "RFC4918", "http://www.iana.org/go/rfc4918");
				G.HDRS[43] = new G.HTTP("423", "Locked", "RFC4918", "http://www.iana.org/go/rfc4918");
				G.HDRS[44] = new G.HTTP("424", "Failed Dependency", "RFC4918", "http://www.iana.org/go/rfc4918");
				G.HDRS[45] = new G.HTTP("425", "Unassigned", "", "");
				G.HDRS[46] = new G.HTTP("426", "Upgrade Required", "RFC7231, Section 6.5.15", "http://www.iana.org/go/rfc7231");
				G.HDRS[47] = new G.HTTP("427", "Unassigned", "", "");
				G.HDRS[48] = new G.HTTP("428", "Precondition Required", "RFC6585", "http://www.iana.org/go/rfc6585");
				G.HDRS[49] = new G.HTTP("429", "Too Many Requests", "RFC6585", "http://www.iana.org/go/rfc6585");
				G.HDRS[50] = new G.HTTP("431", "Request Header Fields Too Large", "RFC6585", "http://www.iana.org/go/rfc6585");
			
				/**
				 extra obscure headers for boss level
				G.HDRS[0] = new G.HTTP("100", "Continue", "RFC7231, Section 6.2.1", "http://www.iana.org/go/rfc7231");
				G.HDRS[1] = new G.HTTP("101", "Switching Protocols", "RFC7231, Section 6.2.2", "http://www.iana.org/go/rfc7231");
				G.HDRS[2] = new G.HTTP("102", "Processing", "RFC2518", "http://www.iana.org/go/rfc2518");
				G.HDRS[5] = new G.HTTP("201", "Created", "RFC7231, Section 6.3.2", "http://www.iana.org/go/rfc7231");
				G.HDRS[6] = new G.HTTP("202", "Accepted", "RFC7231, Section 6.3.3", "http://www.iana.org/go/rfc7231");
				G.HDRS[7] = new G.HTTP("203", "Non-Authoritative Information", "RFC7231, Section 6.3.4", "http://www.iana.org/go/rfc7231");
				G.HDRS[8] = new G.HTTP("204", "No Content", "RFC7231, Section 6.3.5", "http://www.iana.org/go/rfc7231");
				G.HDRS[9] = new G.HTTP("205", "Reset Content", "RFC7231, Section 6.3.6", "http://www.iana.org/go/rfc7231");
				G.HDRS[10] = new G.HTTP("206", "Partial Content", "RFC7233, Section 4.1", "http://www.iana.org/go/rfc7233");
				G.HDRS[11] = new G.HTTP("207", "Multi-Status", "RFC4918", "http://www.iana.org/go/rfc4918");
				G.HDRS[12] = new G.HTTP("208", "Already Reported", "RFC5842", "http://www.iana.org/go/rfc5842");
				G.HDRS[14] = new G.HTTP("226", "IM Used", "RFC3229", "http://www.iana.org/go/rfc3229");
				G.HDRS[57] = new G.HTTP("432", "Unassigned", "", "");
				G.HDRS[68] = new G.HTTP("512", "Unassigned", "", "");
				G.HDRS[69] = new G.HTTP("599", "Unassigned", "", "");
				G.HDRS[3] = new G.HTTP("103", "Unassigned", "", "");
				G.HDRS[15] = new G.HTTP("227", "Unassigned", "", "");
				G.HDRS[13] = new G.HTTP("209", "Unassigned", "", "");
				G.HDRS[67] = new G.HTTP("509", "Unassigned", "", "");
				G.HDRS[55] = new G.HTTP("430", "Unassigned", "", "");
				*/
				
				
			}
		}
		// let's do this!
		window.onload = G.init();