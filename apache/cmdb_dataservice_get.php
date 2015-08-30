<?php
require_once 'config.php';
require_once 'jwt.php';

$tokenObj = JWT::decode($_GET['token'], $key = '123', $verify = true);
if(isset($tokenObj->expiration) && isset($tokenObj->user)){
	if($tokenObj->expiration>time()){
		$token = array();
		$token['user'] = $tokenObj->user;
		$token['expiration'] = (time()+$session_time);
		$str_token = JWT::encode($token, $key = '123');
		$jwt_token = array('token' => $str_token);
		echo $_GET['callback'] . '('.json_encode($jwt_token).')';
	}else{
		throw new Exception('Session timed out');
		die;
	}
}else{
	throw new Exception('No token');
	die;
}
