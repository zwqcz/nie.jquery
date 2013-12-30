<?php
$callback=$_GET["callback"];
$file=$_GET["file"];
$json="";
switch($file){
	case "IdCreator":
		$json="{id:2}";
		break;
	case "Verifier":
		$json="{verCapResult:0}";
		break;
	case "checkUserName":
		$json="{status:104}";
		break;
	case "submit":
		$json='{num:202,is163Mail:false,mailUrl:"http://mail.qq.com",msg:"fuck.",reDirectUrl:"http://nie.163.com"}';
		break;
	case "sendActiveMail":
		$json='{status:1,info:"done"}';		
		break;
	case "sendMobileCaptcha":
		$json='{success:false,msg:"该手机号已被注册。"}';
		break;
	case "regMobile":
		$mUA=$_GET["m_username"];
		$json='{success:false,status:421,msg:"fuck",reDirectUrl:"http://www.163.com/?eef=2",UA:"m'.$mUA.'@163.com",mUA:"'.$mUA.'"}';
		break;
}
echo "$callback($json)";
?>