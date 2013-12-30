<?
header("content-type:text/plain");
function allfile($dir){  
  $files=array();  
  if(is_file($dir))  
   {  
	   return $dir;  
  }  
   $handle = opendir($dir);  
   if($handle) {  
	   while(false !== ($file = readdir($handle))) {  
		  if ($file != '.' && $file != '..') {  
			   $filename = $dir . "/"  . $file;  
			   if(is_file($filename)) {  
				   $files[] = $filename;  
			  }else {  
					 
				  $files = array_merge($files, allfile($filename));  
			   }  
		   }  
	   }   //  end while  
	   closedir($handle);  
   }  
  return $files;     
}  
function getPath($str){
    return str_replace(".","/",$str);
}
function findVal($val){
	global $module;
	foreach($module as $a){
    	if($a==$val){
	        return false;
        }
    }
    return true;
}
function insertModule($str){	
	global $module;
  $dependFile = getPath($str).".depend";
  if(file_exists($dependFile)){	  
	  $dependFileStr = file_get_contents($dependFile);
	  $dependNameSpace = split("[\r]",$dependFileStr);
	  foreach($dependNameSpace as $d){
		  $d=trim($d);
		  if(findVal($d)){
			  array_push($module,$d);
			  insertModule($d,$module);
		  }
	  }
  }
}
function getNewContent($p){
	global $module;
	$module=array();
	$str=split("[,|\|]",$p);	
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
		$_file =getPath($m).".js";
		if(file_exists($_file)){
			$script.=file_get_contents($_file);
		}
	}
	return $script;
}
function getOldContent($md5Val){	
	$_file="cache/".$md5Val.".js";
	$script="";
	if(file_exists($_file)){
		$script.=file_get_contents($_file);
    }
	//echo "_file:".$_file."\n";
	//echo "script:".$script."\n";
	return $script;
}
function getCacheName($md5Val){
	return "http://res.nie.netease.com/comm/js/cache/".$md5Val.".js";//?&charset=gb2312&.js";
}
$name = $_GET["name"];
$module=array();
$logFiles = allfile("log");
$matchLogFiles = array();
$matchParts = array();
$matchmd5Vals=array();
$newFilesContent=array();
$cacheFile=array();
$total1 = 0;
$total2 = 0;
foreach($logFiles as $logFile){
	$txt= trim(file_get_contents($logFile));
	$parts = split("[,|\|]",$txt);
	foreach($parts as $part){
		$part = trim($part);			
		if($name==$part){
			$total1++;
			preg_match("/^log\/([^\.]+)\.txt/", $logFile, $matches);
			$md5Val = $matches[1];
			$newContent = getNewContent($txt);
			$oldContent = getOldContent($md5Val);			
			if($newContent!=$oldContent){
				$total2++;				
				array_push($matchmd5Vals,$md5Val);
				array_push($cacheFile,getCacheName($md5Val));
				array_push($matchLogFiles,$logFile);
				array_push($matchParts,$txt);										
				array_push($newFilesContent,$newContent);
				file_put_contents("cache/".$md5Val.".js",$newContent);
			}
			break;
		}
	}
}
echo "共有文件数： $total1 \n";
echo "已更新数：$total2 \n";
for($i=0;$i<count($newFilesContent);$i++){
	echo $cacheFile[$i]."\n";
	/*echo "文件地址:".$matchLogFiles[$i]."\n";
	echo "组件:".$matchParts[$i]."\n";
	echo "组件md5:".$matchmd5Vals[$i]."\n";	
	echo "cache文件:".$cacheFile[$i]."\n";
	echo "文件内容:\n";
	echo $newFilesContent[$i]."\n\n";*/
}
?>