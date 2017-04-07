function FuzzyMatching(txt, btn, list, url, type) { //type：请求方式 url：请求路径
	this.oTxt = document.getElementById(txt); //文本框
	this.oBtn = document.getElementById(btn); //搜索按钮
	this.list = document.getElementById(list); //显示视图的ul views
	this.init(url,type);
	
	
}
FuzzyMatching.prototype.init=function(url,type){
	var _this=this;
	if(!(this.oTxt && this.oBtn && this.list)) { //判断参数是否正确
		alert("参数错误");
		return false;
	}
	this.oBtn.addEventListener('click', function() {
		var reg = /(^\s+)|(\s+$)/,
			val = _this.oTxt.value.replace(reg, function(v) {
				return "";//去左右两边空格
			}),
			listData;
		if(!val) {
			_this.list.innerHTML = "输入框不能为空";
			return false;
		}
		//第一次点击请求ajax数据，缓存到sessionStorage里，之后从缓存中读取数据
		if(window.sessionStorage.getItem("list")) {
			var local = window.sessionStorage.getItem("list");
			_this.getList(JSON.parse(local), val);

		} else {
			_this.ajax({
				type:type,
				url: url,
				success: function(data) {
					window.sessionStorage.setItem("list", JSON.stringify(data));
					_this.getList(data, val)

				},
				error: function(err) {
					console.log(err)
				}
			})
		}
	});
}
/*封装ajax请求数据*/
FuzzyMatching.prototype.ajax=function(option) {
	var xhr,
		reg = /get/gi,
		type = option.type || "get",
		async = (typeof option.async) === "boolean" ? option.async : true;
	if(window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		xhr = new ActiveXObject("microsoft.XMLHTTP");
	}
	console.log(xhr)
	if(reg.test(type)) {
		xhr.open(type, option.url, async);
	} else {
		xhr.open(type, option.url, async);
		xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
	}
	xhr.send(null);
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4) {
			if(xhr.status == 200) {
				var obj = JSON.parse(xhr.responseText);
				option.success(obj)
			} else {
				option.error("error")
			}
		}
	}

}
/*遍历请求数据得到与输入框的值匹配的所有数据*/
FuzzyMatching.prototype.getList=function (obj, txt) {
	var temp = [],
		reg = new RegExp(txt);
	obj.forEach(function(val, i) {
		for(var t in val) {
			if(reg.test(val[t])) { //可以匹配结束这次循环
				temp.push(val);
				break;
			}
		}
	})
	/*判断是否有匹配到内容*/
	if(temp.length) {
		/*匹配到数据调用render对views进行数据渲染*/
		this.render(temp, txt);
		return;
	}
	/*没有匹配到显示没有搜索到内容*/
	this.list.innerHTML = "<li><h2>没有搜索到内容，请从新输入</h2></li>";
}
/*根据匹配到的数据渲染views*/
FuzzyMatching.prototype.render=function(listData, txt) {
	var str = "",
		_this=this;
	listData.forEach(function(val, i) {
		str += "<li><h4>" + _this.regReplace(val.title, txt) + "</h4><p>" + _this.regReplace(val.content, txt) + "<p/></li>";
	})
	this.list.innerHTML = str;
}
/*对匹配内容进行高亮显示*/
FuzzyMatching.prototype.regReplace=function(str, txt) {
	var reg = new RegExp(txt, "g");
	return str.replace(reg, function(t) {
		return "<b class='font'>" + t + "</b>";
	})
}