<?
header("content-type:application/x-javascript");
function getPath($str){
    return str_replace(".","/",$str);
}
function findVal($val){
	foreach($GLOBALS["module"] as $a){
    	if($a==$val){
	        return false;
        }
    }
    return true;
}
function insertModule($str){	
  $dependFile = getPath($str).".depend";
  if(file_exists($dependFile)){	  
	  $dependFileStr = file_get_contents($dependFile);
	  $dependNameSpace = split("[\r]",$dependFileStr);
	  foreach($dependNameSpace as $d){
		  $d=trim($d);
		  if(findVal($d)){
			  array_push($GLOBALS["module"],$d);
			  insertModule($d,$module);
		  }
	  }
  }
}
$GLOBALS["module"]=array();
$p=$_GET['p'];
$cachePath = "cache/"; 
$logPath = "log/";
$logFile = $logPath.md5($p).".txt";
$str=split("[,]",$p);

foreach($str as $s){
	$s=trim($s);
	if(findVal($s)){
    	array_push($GLOBALS["module"],$s);		
        insertModule($s);
    }
}
$script="";
foreach($module as $m){	
	$fileName.=$m."|";
	$_file =getPath($m).".source.js";
	if(file_exists($_file)){
		$script.=file_get_contents($_file);
    }
}
$cacheFile = $cachePath.md5($p).".js";
/*
if(file_exists($cacheFile) && $script == file_get_contents($cacheFile)){
	file_get_contents($cacheFile);
}
else{
	file_put_contents($cacheFile,$script);
}
file_put_contents($logFile,$p);
*/
echo $script;
?>
