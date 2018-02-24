// Mixing jQuery and Node.js code in the same file? Yes please!

const remote = require('electron').remote;
var dialog = remote.dialog;

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

function process_midi(){
	start_overlay("PROCESSING...");
	filepath = $("#filename").html();
	
	var PythonShell = require('python-shell');

	var options = {
		mode: 'text',
		args: [filepath, $("#DROP_MODE").val(), $("#LOOPING").val(), $("#DUPLICATE").val()]
	};

	PythonShell.run('miduino.py', options, function (err, results) {
		if (err) throw err;
		// results is an array consisting of messages collected during execution
		$("#start_page").fadeOut("fast",function(){
			end_overlay();
			$("#result_page").fadeIn("fast");
			$("#temp_data").show();
		});
		$("#logo").animate({ 'marginTop': '50px'}, 500);
		$("#score").html('#include "Miduino.h"<br>'+
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
		$("#score").html($("#score").html()+"<br><br>void setup(){<br>&nbsp;&nbsp;mid.play_song(SCORE,PWM_TYPE,VIBRATO_HZ,VIBRATO_INTENSITY,VIBRATO_RAMP_MS,VIBRATO_HOLD_MS,SPEED_MULTIPLIER);<br>}<br><br>void loop(){<br>}");
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
	},1000);
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
		if (fileNames === undefined) return;
		var fileName = fileNames[0];
		$("#filename").html(fileName);
		$("#filepick").show();
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