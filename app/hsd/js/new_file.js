createjs.Sound.alternateExtensions = ["mp3"];
createjs.Sound.on("fileload", this.loadHandler, this);
createjs.Sound.registerSound("resource/1_1.mp3", "sound");

function loadHandler(event) {
	console.log(event);
	// This is fired for each sound that is registered.
	var instance = createjs.Sound.play(event.id); // play using id.  Could also use full sourcepath or event.src.
}