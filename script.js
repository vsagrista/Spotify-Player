
var Player = function(){
	this.playing = false;
}

var Song = function(song){
	this.song = song;
}

Song.prototype.fetchBandInfo = function (bandIdFromApi) {
	$.ajax({url: "https://api.spotify.com/v1/artists/"+bandIdFromApi+"",
  	success: 
  	this.renderBandInfoInModal.bind(this)
	});
}

Song.prototype.fetchSongInfo = function () {
	$.ajax({url: "https://api.spotify.com/v1/search?type=track&query="+this.song+"",
  	success: 
  	this.getSongsBandsAndCoverImages.bind(this)
	});
}

Song.prototype.getSongsBandsAndCoverImages = function (songs_object){
	localStorage.setItem('songs_object', JSON.stringify(songs_object));
	window.songListLocalStored = localStorage.getItem('songs_object');
	songListLocalStored = JSON.parse(songListLocalStored)
	this.renderSongSearchOnHtml(songs_object);
	this.upDatePlayerWithSearchedSong(songs_object,0);
}

Song.prototype.renderSongSearchOnHtml = function (songs_object){	
	songs_object = songs_object.tracks.items; 
	$('.table-striped tr:gt(0)').remove();
	for (var i=0; i<songs_object.length; i++){
		$(".table-striped").append($(
			"<tr> "+"<td><p>"+songs_object[i].artists[0].name+"</p><a id='"+i+"' class='band-info' href='javascript:;'>(Band Info)</a></td>"+
			"<td><p>"+songs_object[i].album.name+"</p></td>"+
			"<td><p>"+songs_object[i].name+"</p></td>"+
			"<td>"+"<a id='"+i+"' class='band-pic' href='javascript:;'><img src='"+songs_object[i].album.images[1].url+"'>"+"</a></td>"+"</tr>"));
	}
}

Song.prototype.renderBandInfoInModal = function (artist_info) {
	$("#band").text(artist_info.name);
	if (artist_info.genres.length === 0){
		$("#genres").text("No genres found for this band") }
	else {
		$("#genres").text(artist_info.genres.join(", "));
		}
	$("#popularity").text(artist_info.popularity);
	$("#followers").text(artist_info.followers.total);
	$(".js-modal").modal();
}

Song.prototype.upDatePlayerWithSearchedSong = function (songs_object, index){
	$(".title").text(songs_object.tracks.items[index].name);
	$(".author").text(songs_object.tracks.items[index].artists[0].name);
	$("#album-img").attr("src",songs_object.tracks.items[index].album.images[1].url);
	$("#audio-song").attr("src",songs_object.tracks.items[index].preview_url);	
}

Player.prototype.playOrPauseSong = function (){
	if (this.playing == true){
		$("#audio-song").trigger("pause");
		this.playing = false
	} else {
        $("#audio-song").trigger("play");
        this.playing = true;
      }
}

Player.prototype.showProgressBar = function() {
	var current = $('#audio-song').prop('currentTime');
  	$("progress").attr("value", current);
}

$(document).on("click", "#search-song-button", function (event){
	event.preventDefault();
	newSongSearch = new Song($("input[name=name]").val());
	newSongSearch.fetchSongInfo();
})

var user_plays_song = new Player()

$(document).on("click", ".btn-play", function(event){
event.preventDefault();
user_plays_song.playOrPauseSong()
})

$(document).on("click", ".band-pic", function(event){
	event.preventDefault()
	var bandIdTag = parseInt($(this).attr('id'))
	newSongSearch.upDatePlayerWithSearchedSong(songListLocalStored, bandIdTag)
})

$(document).on("click", ".band-info", function(event){
	event.preventDefault()
	var bandIdTag = parseInt($(this).attr('id'))
	var bandIdFromApi = songListLocalStored.tracks.items[bandIdTag].artists[0].id
	newSongSearch.fetchBandInfo(bandIdFromApi)
})

$("#audio-song").on("timeupdate",function(){
	user_plays_song.showProgressBar()
})
