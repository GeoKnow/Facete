var template;
var xmlHttp = null;
var gotLinkTask = false;
var rootURL = "";
function getLinkTasks() {
	// show
	if (document.getElementById('processLinkTask').style.display == "none")
		document.getElementById('processLinkTask').style.display = "block";
	else
		document.getElementById('processLinkTask').style.display = "none";
	// hide addLinktask
	document.getElementById('addLinkTask').style.display = "none";
	// http req
	if (gotLinkTask)
		return;
	var url = rootURL + "/server?service=getTasks";
	xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = processRequest;
	xmlHttp.open("GET", url, true);
	xmlHttp.send(null);
}

function processRequest() {
	if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
		if (xmlHttp.responseText == "Not found") {
			//err
		} else {
			var task = eval("(" + xmlHttp.responseText + ")");
			parseLinkTask(task);
			gotLinkTask = true;
		}
	}
}

function performLinkTask() {
	document.getElementById("performBtn").disabled = false;
	var url = rootURL + "/server?service=performTasks";
	xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = processAnswer;
	xmlHttp.open("GET", url, true);
	xmlHttp.send(null);
}

function processAnswer() {
	document.getElementById("msg").innerHTML = xmlHttp.responseText;
	if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
		window.alert(xmlHttp.responseText);
	}
}

function parseLinkTask(task) {
	if (task.tasks.length == 0) {
		document.getElementById("msg").innerHTML = "No task to perform!";
	} else
		document.getElementById("performBtn").disabled = false;
	for (var i = 0; i < task.tasks.length; i++) {
		var table = document.getElementById("linkTaskTable");
		var row = table.insertRow(-1);
		var subject = row.insertCell(0);
		var object = row.insertCell(1);
		var predicate = row.insertCell(2);
		var description = row.insertCell(3);
		var difficulty = row.insertCell(4);
		var file = row.insertCell(5);
		subject.innerHTML = task.tasks[i].subject;
		object.innerHTML = task.tasks[i].object;
		predicate.innerHTML = task.tasks[i].predicate;
		description.innerHTML = task.tasks[i].description;
		difficulty.innerHTML = task.tasks[i].difficulty;
		file.innerHTML = task.tasks[i].file;
	}
}

function addLinkTask() {
	if (document.getElementById("template").val == null)
		getTemplate();
	// show/hide
	// addLinkTask
	if (document.getElementById('addLinkTask').style.display == "none")
		document.getElementById('addLinkTask').style.display = "block";
	else
		document.getElementById('addLinkTask').style.display = "none";
	// processLinktask
	document.getElementById('processLinkTask').style.display = "none"
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

	del.setAttribute("onclick", 'removeProperty(this)');
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