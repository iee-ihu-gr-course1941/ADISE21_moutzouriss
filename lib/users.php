<?php

//returns player's id and username of all players in json format
function show_players() {
    global $mysqli;
    $sql = 'select p_id, username from players';
    $st = $mysqli->prepare($sql);
    $st->execute();
    $res = $st->get_result();
    header('Content-type: application/json');
	print json_encode($res->fetch_all(MYSQLI_ASSOC), JSON_PRETTY_PRINT);
}

//returns player's id and username of the passed id in json format
function show_user($user_id) {
    global $mysqli;
	$sql = 'select p_id, username from players where p_id=?';
	$st = $mysqli->prepare($sql);
	$st->bind_param('i',$user_id);
	$st->execute();
	$res = $st->get_result();
	header('Content-type: application/json');
	print json_encode($res->fetch_all(MYSQLI_ASSOC), JSON_PRETTY_PRINT);
}

//checks if there are any null usernames in players' table
//and sets the first null username that finds to username passed
function set_user($username) {
	global $mysqli;
	$sql = 'select count(*) as c from players where username is null';
	$st = $mysqli->prepare($sql);
	$st->execute();
	$res = $st->get_result();
	$r = $res->fetch_all(MYSQLI_ASSOC);
	if($r[0]['c']==0) {
		header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Room is full. Try again later."]);
		exit;
	}

	$sql = 'update players set username=?, token=md5(CONCAT( ?, NOW())) where p_id in (
			select p_id from (select p_id from players where username is null limit 1) as x)';
	$st2 = $mysqli->prepare($sql);
	$st2->bind_param('ss',$username,$username);
	$st2->execute();

	update_game_status();
	$sql = 'select * from players where username=?';
	$st = $mysqli->prepare($sql);
	$st->bind_param('s',$username);
	$st->execute();
	$res = $st->get_result();
	$r = $res->fetch_all(MYSQLI_ASSOC);
	if($r[0]['p_id']==2) {
		deal_cards();
	}
	header('Content-type: application/json');
	print json_encode($r, JSON_PRETTY_PRINT);
}

//returns player's id associated with the token passed
function current_player($token) {
	global $mysqli;

	if($token==null) {return(null);}
	$sql = 'select * from players where token=?';
	$st = $mysqli->prepare($sql);
	$st->bind_param('s',$token);
	$st->execute();
	$res = $st->get_result();
	if($row=$res->fetch_assoc()) {
		return($row['p_id']);
	}
	return(null);
}

?>