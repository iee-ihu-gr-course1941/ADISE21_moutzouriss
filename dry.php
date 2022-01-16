<?php
 
require_once "lib/dbconnect.php";
require_once "lib/board.php";
require_once "lib/game.php";
require_once "lib/users.php";

$method = $_SERVER['REQUEST_METHOD']; #gets the request method
$request = explode('/', trim($_SERVER['PATH_INFO'],'/')); #returns an array of the input between the '/' of the url path
$input = json_decode(file_get_contents('php://input'),true); #returns an array of json objects
if(isset($_SERVER['HTTP_X_TOKEN'])) {
	$input['token']=$_SERVER['HTTP_X_TOKEN'];
}

//executes the appropriate function depending on the values of the $request array
switch ($r=array_shift($request)) {
        case 'board' : 
                switch ($b=array_shift($request)) {
                        case '':
                        case null:
                                handle_board($method, $input);
                                break;
                        case 'card':
                                handle_card($method, $request[0], $input);
                                break;
                        default:
                                header("HTTP/1.1 404 Not Found");
                                break;
                }
                break;
        case 'status': 
                if(sizeof($request)==0)
                        show_status();
                else
                        header("HTTP/1.1 404 Not Found");
		break;
        case 'players':
                switch ($b=array_shift($request)) {
                        case '':
                        case null:
                                handle_players($method);
                                break;
                        default:
                                handle_user($method, $b);
                                break;
                }
                break;
        default:
                header("HTTP/1.1 404 Not Found");
        exit;
}


//function implementation

function handle_board($method, $input) {
        if($method=='GET')
                show_board($input);
        else if($method=='POST')
                reset_board();
        else {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Method $method not allowed."]);
        }		
}

function handle_players($method) {
        if($method=='GET')
                show_players();
        else {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Method $method not allowed."]);
        }
}

function handle_user($method, $b) {
        if($method=='GET')
                show_user($b);
        else if($method=='PUT')
                set_user($b);
        else {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Method $method not allowed."]);
        }
}

function handle_card($method, $x, $input) {
        if($method=='PUT')
                play_card($x, $input['token']);
        else {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Method $method not allowed."]);
        }
}

?>
