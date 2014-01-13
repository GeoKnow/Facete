performLinkTask = (function() {
	var gotLinkTask = false;
	var rootURL = "http://verilinks.aksw.org/";
	// local test
	// var rootURL ="http://localhost:8080/verilinks-server";
	window.onload = function() {
		getLinkTasks();
	};

	function getLinkTasks() {
		// http req
		if (gotLinkTask)
			return;
		var url = rootURL + "/server?service=getTasks";
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() {
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
		xmlHttp.open("GET", url, true);
		xmlHttp.send(null);
	}

	function parseLinkTask(task) {

		if (task.tasks.length == 0) {
			document.getElementById("msg").innerHTML = "<p style='color:green;margin:10px;'>No task to perform!</p>";
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

	return {
		performLinkTask : function(){
			performLinkTask();
		}
	}
})();
