addLinkTask = (function() {
	
	var rootURL = "http://verilinks.aksw.org/";
	// local test
	// var rootURL ="http://localhost:8080/verilinks-server";
	
	window.onload = function(){
		
		if (document.getElementById("template").val == null)
			getTemplate();
	}

	function addProperty(id) {
		var name = 'propElement';
		if (id != 'subjectProperty')
			name = 'propElement2';
		var div = document.createElement("div");
		var input = document.createElement("input");
		input.setAttribute("type", 'text');
		input.setAttribute("name", name);
		div.appendChild(input);
		var del = document.createElement("input");
		del.setAttribute("type", 'button');

		del.setAttribute("onclick", 'addLinkTask.removeProperty(this)');
		del.setAttribute("value", '-');

		div.appendChild(del);
		document.getElementById(id).appendChild(div);

		// innerHtml +="<div><input name='prop0Element' type='text'/><a href='#' title='remove this property' onclick='removeProperty(this)'>[-]</a><div>";
	}

	function removeProperty(node) {
		node.parentNode.parentNode.removeChild(node.parentNode);
	}

	function getTemplate() {
		var url = rootURL + "/server?service=getTemplate";
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				if (xmlHttp.responseText == "Not found") {
					document.getElementById("TextBoxCustomerName").value = "Not found";
					document.getElementById("TextBoxCustomerAddress").value = "";
				} else {
					document.getElementById("template").value = xmlHttp.responseText;
					// template = ;
				}
			}
		};
		xmlHttp.open("GET", url, true);
		xmlHttp.send(null);
	}

	function validate() {
		var elems = document.getElementsByTagName('input');
		var len = elems.length;
		for (var i = 0; i < len; i++) {
			if (elems[i].value.length == 0) {
				if (elems[i].className != 'noDisable' && document.getElementById('existsElement').checked) {
					continue;
				}
				window.alert("Please fill in field: " + elems[i].name);
				return false;
			}
		}
		form.submit();
	}

	function cbChanged() {
		if (document.getElementById('existsElement').checked) {
			// disable
			var elems = document.getElementsByTagName('input');
			var len = elems.length;
			for (var i = 0; i < len; i++) {
				if (elems[i].className != 'noDisable')
					elems[i].disabled = true;
			}
			var elemsSelect = document.getElementsByTagName('select');
			for (var i = 0; i < elemsSelect.length; i++) {

				if (elemsSelect[i].className != 'noDisable')
					elemsSelect[i].disabled = true;
			}
		} else {
			// enable
			var elems = document.getElementsByTagName('input');
			var len = elems.length;
			for (var i = 0; i < len; i++) {
				if (elems[i].className != 'noDisable')
					elems[i].disabled = false;
			}
			var elemsSelect = document.getElementsByTagName('select');
			for (var i = 0; i < elemsSelect.length; i++) {
				if (elemsSelect[i].className != 'noDisable')
					elemsSelect[i].disabled = false;
			}
		}
	}
	
	return {
		addProperty : function(prop){
			addProperty(prop);
		},
		removeProperty : function(prop){
			removeProperty(prop);
		},
		validate : function(){
			return validate();
		},
		cbChanged : function(){
			return cbChanged();
		}
	}

})();
