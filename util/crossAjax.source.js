var crossAjax={	
	create:function(){
		var o={
			xdr:{},
			allow:false,
			init:function(){
				var objName = ["XMLHttpRequest","XDomainRequest"];
				while(objName.length>0){
					try{
						o.xdr=new window[objName.shift()];
						if(typeof o.xdr.withCredentials!="undefined"){
							o.allow=true;
							break;
						}
					}
					catch(e){
					}
				}
			}
		}
		o.init();
		return o;
	}
}
var cj = crossAjax.create();
var xdr=cj.xdr;
alert(cj.allow+"\nwithCredentials:"+xdr.withCredentials);
xdr.onreadystatechange = handler;  
xdr.withCredentials = "true";  
xdr.send();