var me={token:null};
var game_status={};
var last_update=new Date().getTime();
var timer=null;
var opp_cards=6;
var deckColor='';

window.addEventListener('beforeunload', function (e) {
	reset_board();
  });

$(function () {
	$('#waitDiv').hide();
	$('#reset').hide();
	$('#loginButton').click(login_to_game);
	$('#reset').click(reset_board);
	game_status_update();
});

function reset_board() {
	$.ajax({url: "dry.php/board/",
			headers: {"X-Token": me.token},
			method: 'POST',
			success: fill_board_by_data });
	location.reload();
}

function fill_board() {
	$.ajax({url: "dry.php/board/",
			headers: {"X-Token": me.token},
			success: fill_board_by_data });
	
}

function fill_board_by_data(data) {
	$('#waitDiv').hide();
	$('#reset').show();
	var img='<div class="cards">';
	var img2='<div class="cards">';
	var img3='<div class="cards">';
	var vCounter=0, sCounter=0, topId=0;
	if(opp_cards==0) {
		opp_cards=6;
	}
	if(data.length>0) {
		if(opp_cards==0) {
			$('#opponent').html('');
		}
		for(var i=0; i<opp_cards; i++) {
			img3 += '<img class="card'+i+'" src="img/'+deckColor+'.png">';
			$('#opponent').html(img3);
		}
	}
	for(var i=0; i<data.length; i++) {
		var o = data[i];
		var viewer_hand = 'hand'+me.p_id;
		if(o.c_position==viewer_hand) {
			img += '<img class="card'+vCounter+'" id="c'+o.card_id+'" src="img/'+o.card_id+'.svg">';
			$('#viewer').html(img);
			vCounter++;
		}
		else if(o.c_position=='stack' || o.c_position=='top') {
			if(o.c_position=='top') {
				topId=o.card_id;
			}
			else {
				if(sCounter/2==1) {
					img2 += '<img style="transform: rotate('+sCounter*(-10)+'deg)" src="img/'+o.card_id+'.svg">';
				}
				else {
					img2 += '<img style="transform: rotate('+sCounter*10+'deg)" src="img/'+o.card_id+'.svg">';
				}
			}
			sCounter++;
		}
	}
	if(topId>0) {
		img2 += '<img style="transform: rotate('+topId*10+'deg)" src="img/'+topId+'.svg">';
		$('#stack').html(img2);
	}
	if(vCounter==0) {
		$('#viewer').html('');
	}
	if(sCounter==0) {
		$('#stack').html('<div class="cards"></div>');
	}
	img+='</div>';
	img2+='</div>';
	img3+='</div>';

	$('#viewer img').click(click_on_card);
}

function login_to_game() {
	deckColor = $("input[name='deckColor']:checked").val();
	var username = $('#username').val();
	if(username=='') {
		alert('You have to set a username');
		return;
	}
	$.ajax({url: "dry.php/players/"+username,
			method: 'PUT',
			dataType: "json",
			headers: {"X-Token": me.token},
			contentType: 'application/json',
			success: login_result,
			error: login_error});
}

function login_result(data) {
	me = data[0];
	if(me.p_id==1) {
		$('#waitDiv').show();
	}
	if(me.p_id==2) {
		fill_board();
	}
	$('#loginForm').hide();
	update_info();
	game_status_update();
}

function login_error(data) {
	var resp = data.responseJSON;
	alert(resp.errormesg);
}

function update_info(){
	$('#game_info').html("I am Player: "+me.p_id+
							", my name is "+me.username +
							'<br>Token='+me.token+'<br>Game state: '+
							game_status.status+', '+ game_status.p_turn+
							' must play now.');
	
}

function game_status_update() {
	clearTimeout(timer);
	$.ajax({url: "dry.php/status/",
			headers: {"X-Token": me.token},
			success: update_status });
}

function update_status(data) {
	last_update = new Date().getTime();
	var game_stat_old = game_status;
	game_status=data[0];
	winnerId = game_status.result;
	update_info();
	clearTimeout(timer);
	if(game_status.status=='ended') {
		$.ajax({url: "dry.php/players/"+winnerId,
			headers: {"X-Token": me.token},
			success: alert_winner });
		return;
	}
	if(game_status.p_turn==me.p_id) {
		if(game_stat_old.p_turn != game_status.p_turn) {
			if(game_stat_old.status != 'initialized') {
				opp_cards--;
			}
			fill_board();
		}
		timer = setTimeout(function() {game_status_update();}, 2000);
	} else {
		timer = setTimeout(function() { game_status_update();}, 2000);
	}
}

function alert_winner(data) {
	winner = data[0].username;
	alert('Player ' + winner + ' wins!');
}

function click_on_card(e) {
	var target = e.target;
	var card_id = target.id.slice(1);
	$.ajax({url: "dry.php/board/card/"+card_id, 
			method: 'PUT',
			dataType: "json",
			contentType: 'application/json',
			headers: {"X-Token": me.token},
			success: move_result,
			error: login_error});
}

function move_result(data){
	fill_board_by_data(data);
}