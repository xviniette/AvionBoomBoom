var app;
var ws;
var init;
var snapshot;

var canvas;
var ctx;

var loop = function () {
	setTimeout(() => {
		loop();
	}, 1000 / init.settings.physic.FPS);

	inputs = getInputs();
	ws.send(JSON.stringify({
		type: "inputs",
		inputs: inputs
	}));

	display();
}

window.onload = function () {
	canvas = document.querySelector("#game");
	ctx = canvas.getContext("2d");

	app = new Vue({
		el: "#app",
	});

	ws = new WebSocket('ws://127.0.0.1:54321');
	ws.onmessage = function (event) {
		var d = JSON.parse(event.data);

		switch (d.type) {
			case "init":
				init = d;
				$.get("http://localhost:3000/v1/maps/"+d.map, (data) => {
					init.map = data;
					var infos = JSON.parse(data.informations);
					for(var i in infos){
						init.map[i] = infos[i];
					}
					loop();
				});
				break;

			case "snapshot":
				snapshot = d;
				break;
		}
	};

	ws.onopen = function () {
		ws.send(JSON.stringify({
			type: "join",
			room: 1,
			user: 1,
			password: "password"
		}));
	}
}

var display = function () {
	if(snapshot == null){
		return;
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (var x in init.map.tiles) {
		for (var y in init.map.tiles[x]) {
			var tile = init.map.tiles[x][y];

			if (tile.type) {

				if (tile.type === "block") {
					ctx.fillStyle = "black";
				} else if (tile.type === "warp") {
					ctx.fillStyle = "yellow";
				} else if (tile.type === "goal") {
					ctx.fillStyle = "blue";
				}
				ctx.fillRect(x * init.map.tilesize, y * init.map.tilesize, init.map.tilesize, init.map.tilesize);
			}
		}
	}

	// ctx.fillStyle = "red";
	// ctx.beginPath();
	// ctx.arc(this.player.x, this.player.y, this.player.radius, 0, 2 * Math.PI);
	// this.ctx.fill();

	ctx.fillStyle = "red";
	for(var p of snapshot.players){
		ctx.beginPath();
		ctx.arc(p.x, p.y, init.settings.physic.player.radius, 0, 2 * Math.PI);
		ctx.fill();
	}

	ctx.fillStyle = "green";
	if (snapshot.ball != null) {
		ctx.beginPath();
		ctx.arc(snapshot.ball.x, snapshot.ball.y, init.settings.physic.ball.radius, 0, 2 * Math.PI);
		ctx.fill();
	}

	ctx.fillStyle = "orange";
	for(var bomb of snapshot.bombs){
		ctx.beginPath();
		ctx.arc(bomb.x, bomb.y, init.settings.physic.bomb.radius, 0, 2 * Math.PI);
		ctx.fill();
	}

}


var getInputs = function () {
	var inputs = {};
	if (KeyManager.isDown("left")) {
		inputs.l = true;
	}

	if (KeyManager.isDown("right")) {
		inputs.r = true;
	}

	if (KeyManager.isDown("up")) {
		inputs.j = true;
	}

	if (KeyManager.isDown("down")) {
		inputs.u = true;
	}

	if (KeyManager.isDown("spacebar") || KeyManager.isDown("enter")) {
		inputs.k = true;
	}
	return inputs;
}