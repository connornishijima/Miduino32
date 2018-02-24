// Mixing jQuery and Node.js code in the same file? Yes please!

const remote = require('electron').remote;
var dialog = remote.dialog;

var debug_info = [];

function kill_app(){
	var window = remote.getCurrentWindow();
    window.close();
}

function parse_result(result){
	result_type = result.split("%|%")[0];
	result_line = result.split("%|%")[1];
	if(result_type == "SCORE"){
		current_score = $("#score").html();
		$("#score").html(current_score+result_line);
	}
}

function get_debug(result){
	result_type = result.split("%|%")[0];
	result_line = result.split("%|%")[1].replace(/(\r\n|\n|\r)/gm,"");;
	if(result_type == "DEBUG"){
		debug_info.push(result_line);
	}
}

function process_midi(){
	debug_info = [];
	var start_time = Math.round((new Date()).getTime());
	var elapsed = -1;
	start_overlay("PROCESSING...");
	filepath = $("#filename").html();
	
	var PythonShell = require('python-shell');

	var options = {
		mode: 'text',
		args: [filepath, $("#DROP_MODE").val(), $("#LOOPING").val(), $("#DUPLICATE").val()]
	};

	PythonShell.run('miduino.py', options, function (err, results) {
		var end_time = Math.round((new Date()).getTime());
		elapsed = (end_time-start_time)/1000.0;
		
		for(x in results){
			get_debug(results[x]);
		}
		
		removed_duplicates = -1;
		dropped_notes = -1;
		used_voices = "";
		for(x in debug_info){
			debug_line = debug_info[x].split(':');
			if(debug_line[0] == "dropped_notes"){
				dropped_notes = debug_line[1];
			}
			else if(debug_line[0] == "removed_duplicates"){
				removed_duplicates = debug_line[1];
			}
			else if(debug_line[0] == "voices_used"){
				used_voices = debug_line[1];
			}
		}
			
		if (err) throw err;
		// results is an array consisting of messages collected during execution
		$("#start_page").fadeOut("fast",function(){
			end_overlay();
			$("#result_page").fadeIn("fast");
			$("#temp_data").show();
			
			show_alert("Dropped "+dropped_notes+" notes, removed "+removed_duplicates+" duplicates. Voices: "+used_voices);
		});
		$("#logo").animate({ 'marginTop': '50px'}, 500);
		$("#score").html('#include "Miduino.h"              // Conversion took '+elapsed+' seconds! Dropped '+dropped_notes+' notes, removed '+removed_duplicates+' duplicates. Voices: '+used_voices+'<br>'+
						 'Miduino mid(4,5,12,13,14,15);     // Output pins<br>'+
						 '<br>'+
						 'uint8_t PWM_TYPE          = '+$("#PWM_TYPE").val()+';<br>'+
						 'uint8_t VIBRATO_HZ        = '+$("#vibrato_hz").val()+';<br>'+
						 'uint8_t VIBRATO_INTENSITY = '+$("#vibrato_intensity").val()+';<br>'+
						 'uint16_t VIBRATO_RAMP_MS  = 200;  // Time to ease in vibrato<br>'+
						 'uint16_t VIBRATO_HOLD_MS  = 1500; // Time to hold note before easing in vibrato<br>'+
						 'float SPEED_MULTIPLIER    = 1.0;  // Lower is faster<br><br>'
		);
		for(x in results){
			parse_result(results[x]);
		}
		output = $("#score").html() +"<br>";
		
		output+="<span style='color:#ff5c93;'>void setup</span>(){<br>";
		output+="&nbsp;&nbsp;mid.play_song(SCORE,PWM_TYPE,VIBRATO_HZ,VIBRATO_INTENSITY,VIBRATO_RAMP_MS,VIBRATO_HOLD_MS,SPEED_MULTIPLIER);<br>";
		output+="&nbsp;&nbsp;while (mid.song_playing == true) {<br>";
		output+="&nbsp;&nbsp;&nbsp;&nbsp;mid.run_score(SCORE, PWM_TYPE, SPEED_MULTIPLIER);<br>";
		output+="&nbsp;&nbsp;&nbsp;&nbsp;yield(); // Add your own code (to run during playback) above this line,<br>";
		output+="&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// but keep it brief to let the music run!<br>";
		output+="&nbsp;&nbsp;}<br>";
		output+="}<br>";
		output+="<br>";
		output+="<span style='color:#ff5c93;'>void loop</span>(){<br>";
		output+="}";
		$("#score").html(output);
	});
}

function track_overlay(){
	$("#score_overlay").width($("#score").width());
	$("#score_overlay").height($("#score").height());
	$("#score_overlay").css("position","relative");
	$("#score_overlay").css("top",($("#score").height()*-1)-20);
}

function show_alert(message){
	$("#alert").html(message);
	$("#alert").show();
	setTimeout(function(){
		$("#alert").fadeOut("slow");
	},5000);
}

function SelectText(el, win) {
    win = win || window;
    var doc = win.document, sel, range;
    if (win.getSelection && doc.createRange) {
        sel = win.getSelection();
        range = doc.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}

function copy_sketch(){
	$("#temp_data").html($("#score").html());
	SelectText(temp_data);
	document.execCommand("copy");
	show_alert("Sketch copied to clipboard!");
}

function copy_header(){
	data = $("#score").html().split('<br>');
	output = ""
	for (i = 0; i < 9; i++) { 
		output += data[i];
		output += "<br>";
	}
	$("#temp_data").html(output);
	SelectText(temp_data);
	document.execCommand("copy");
	show_alert("Header copied to clipboard!");
}

function copy_score(){
	data = $("#score").html().split('<br>');
	$("#temp_data").html(data[10]);
	SelectText(temp_data);
	document.execCommand("copy");
	show_alert("Score copied to clipboard!");
}

function start_overlay(message){
	$("#load_title").html(message);
	$("#loading").show();
	$("#content").animate({ 'opacity': 0.1}, 500);
}

function end_overlay(){
	$("#loading").hide();
	$("#content").animate({ 'opacity': 1.0}, 500);
}

function begin(){
	$("#temp_data").hide();
	$("#logo").animate({ 'marginTop': '100px'}, 500);
	$("#result_page").fadeOut("fast",function(){
		$("#start_page").fadeIn("fast");
	});
	pick_file();
}

function pick_file(){
	start_overlay("CHOOSE A MIDI FILE...");
	dialog.showOpenDialog({ filters: [
		{ name: 'MIDI Files', extensions: ['mid','midi'] }
	]},
	function (fileNames) {
		if (fileNames === undefined){
			pick_file();
		}
		var fileName = fileNames[0];
		$("#filename").html(fileName);
		end_overlay();
	});
}

$(function(){
	$("#vibrato_hz_meter").html($("#vibrato_hz").val());
	$("#vibrato_hz").on("input", function() {
		$("#vibrato_hz_meter").html($("#vibrato_hz").val());
	});
	
	$("#vibrato_intensity_meter").html($("#vibrato_intensity").val());
	$("#vibrato_intensity").on("input", function() {
		$("#vibrato_intensity_meter").html($("#vibrato_intensity").val());
	});
	
	setInterval(track_overlay,50);
	
	begin();
});