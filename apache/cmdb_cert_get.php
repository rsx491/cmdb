<?php
require_once 'config.php';
require_once 'jwt.php';

function get_user_data(){
        $temp_cert = tempnam('/tmp', uniqid('tmp'));

        if(($f = fopen($temp_cert, 'wb'))) {
                fwrite($f, $_SERVER['SSL_CLIENT_CERT']);
                fclose($f);
        }else{
                trigger_error( __FUNCTION__. " : error writing temporary file '$temp'", E_USER_WARNING);
        }

        $asn1_parsed = `openssl asn1parse -i -dump < $temp_cert`;
        preg_match('/\d+/', explode('Subject Alternative Name', $asn1_parsed)[1], $line_match);
        $octet_dump = `openssl asn1parse -i -dump -strparse $line_match[0] < $temp_cert`;

        preg_match('/[\w\.]+@[\w\.]+/', $octet_dump, $email_match);
        $email = $email_match[0];

        preg_match('/^[\w\.]+/', $email, $username_match);
        $username = $username_match[0];

        unlink($temp_cert);

        if(count($email_match > 0 && count($username) > 0))
                return array('username' => $username, 'email' => $email);
        else
                return false;
}
function check_allowed_users($user_data, $allowed_user_list){
        $allowed = false;
        $var = serialize($allowed_user_list);
        $username = $user_data['username'];
        if(preg_match("/$username/", $var)) {
                $allowed = true;
        }
        return $allowed;
}

if(!$_SERVER['SSL_CLIENT_CERT']){
        throw new Exception('No SSL Client Cert.');
        die;
}else{
        $user_data = get_user_data();
        $allowed = check_allowed_users($user_data, $allowed_user_list);

        if($allowed){
                if(is_array($user_data)){
                        $token = array();
                        $key = '123';
                        $token['user'] = $user_data['username'];
                        $token['expiration'] = (time()+$session_time);
			$str_token = JWT::encode($token, $key);
			$jwt_token = array('token' => $str_token);
			echo $_GET['callback'] . '('.json_encode($jwt_token).')';
                }
        }
        else{
                throw new Exception("Access not allowed for user {$user_data['username']}.");
                die;
        }
}
//echo $_GET['callback'] . '('.json_encode($user_data).')';
