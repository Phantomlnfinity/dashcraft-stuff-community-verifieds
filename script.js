
let tracks = [];
let IDarr = [];
let working = false;
const numbers = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]
const leagues = ["Bronze 1", "Bronze 2", "Bronze 3", "Silver 1", "Silver 2", "Silver 3", "Gold 1", "Gold 2", "Gold 3", "Diamond"]
let points = [];



function retrieveMaps() {
  if (working) {
    return;
  }
  working = true;
  points = [];
  IDarr = [];
  tracks = [];
  if (document.getElementById("checkbox").checked) {
    var url = "https://api.dashcraft.io/trackv2/global3?sort=new&verifiedOnly=true&page="
  } else {
    var url = "https://api.dashcraft.io/trackv2/global3?sort=new&verifiedOnly=false&page="
  }
  if (document.getElementById("25only").checked) {
    var pagesize = 25;
    var pages = 1
  } else {
    var pagesize = 50;
    var pages = 1000
  }
  var fetches = [];
  for (let i = 0; i < pages; i++) {
    fetches.push(
      fetch(url + i + "&pageSize=" + pagesize)
        .then((response) => response.json())
        .then((json) => {

          let json1 = json.tracks;
          let IDarr = [];
          for (let a = 0; a < json1.length; a++) {
            IDarr.push(json1[a]._id);
          }
          return IDarr;
        }));

  }

  Promise.all(fetches)
    .then((IDL) => {
      while (IDarr.length > 0) {
        IDarr.pop();
      }
      for (let a = 0; a < IDL.length; a++) {
        for (let b = 0; b < IDL[a].length; b++) {
          IDarr.push(IDL[a][b]);
        }
      }
      getInfo()
    })
}


function getInfo() {
  document.getElementById("data").hidden = false

  var fetches = []
  for (let i = 0; i < IDarr.length; i++) {
    fetches.push(fetch("https://api.dashcraft.io/trackv2/" + IDarr[i] + "?supportsLaps1=true", {
      headers: {
        'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWM0NmMzNGExYmEyMjQyNGYyZTAwMzIiLCJpbnRlbnQiOiJvQXV0aCIsImlhdCI6MTcwNzM3MTU3Mn0.0JVw6gJhs4R7bQGjr8cKGLE7CLAGvyuMiee7yvpsrWg'
      }
    })
      .then((response) => response.json())
      .then((json) => {
        return (json)
      })
    )
  }
  Promise.all(fetches)
    .then((IDL) => {
      console.log(IDL)
      while (tracks.length > 0) {
        tracks.pop();
      }
      for (let a = 0; a < IDL.length; a++) {
        if (IDL[a].leaderboard.find(({ user }) => user._id === "662334de69042c3463e0eefc") && document.getElementById("byeserphal").checked) {
          var serphalpos = (IDL[a].leaderboard.findIndex(({ user }) => user._id === "662334de69042c3463e0eefc"))
          IDL[a].leaderboard.splice(serphalpos, serphalpos + 1)
        }
        tracks.push(IDL[a]);
      }
      calculate()


    });
}

function calculate() {


  console.log(tracks)

  document.getElementById("players").innerHTML = "Players: " + Math.round(tracks.reduce((total, current) => total + current.leaderboardTotalCount, 0) / tracks.length);
  document.getElementById("likes").innerHTML = "Likes: " + Math.round(tracks.reduce((total, current) => total + current.likesCount, 0) / tracks.length);
  document.getElementById("dislikes").innerHTML = "Dislikes: " + Math.round(tracks.reduce((total, current) => total + current.dislikesCount, 0) / tracks.length);

  document.getElementById("leaderboard").innerHTML = "<h2>Leaderboard</h2>" + countPoints();

  working = false;




}

// player lookup
function playerLookup() {
  var players = []
  var playerlookup = document.getElementById("playerlookup")
  var link = document.getElementById("profilelink")
  var lbdata = document.getElementById("lbdata")
  var track = document.getElementById("tracks")
  link.innerHTML = ""
  lbdata.innerHTML = ""
  track.innerHTML = ""
  for (let i = 0; i < tracks.length; i++) {
    for (let j = 0; j < tracks[i].leaderboard.length; j++) {
      if ((tracks[i].leaderboard[j].user.username).includes(document.getElementById("player").value)) {
        if (!players.find(({ username }) => username === tracks[i].leaderboard[j].user.username)) {
          players.push(tracks[i].leaderboard[j].user)
        }
      }
    }
  }
  console.log(players)

  for (let i = 0; i < players.length; i++) {
    link.innerHTML += "<a href='https://dashcraft.io/?u=" + players[i]._id + "' target='_blank'>" + players[i].username + "</a><br>"
  }
  if (players.length > 1) {
    link.innerHTML += "More than one player found so advanced data is not displayed"
  } else if (players.length == 0) {
    link.innerHTML = "No players found"
  }
  if (players.length == 1) {
    track.innerHTML += "<h4>Tracks</h4>"
    getTracks(players[0])
    link.innerHTML += "Level " + (players[0].levelData.level + 1) + " (" + players[0].levelData.xpInLevel + "/" + players[0].levelData.totalXpInLevel + ")"
    link.innerHTML += "<br>" + leagues[players[0].leagueNr]
  }
  if (!document.getElementById("checkbox").checked) {
    lbdata.innerHTML += "<br><h4>Leaderboard Data</h4><br>Leaderboard info not shown on global leaderboard"
  } else if (players.length == 1) {
    lbdata.innerHTML += "<h4>Leaderboard Data</h4>"
    lbdata.innerHTML += getPositions(players[0])
  }
}



function getTracks(player) {
  var fetches = [];
  for (let i = 0; i < 10; i++) {
    fetches.push(
      fetch("https://api.dashcraft.io/trackv2/user/public/" + player._id + "?page=" + i + "&pageSize=50")
        .then((response) => response.json())
        .then((json) => {

          let json1 = json.tracks;
          let IDarr = [];
          for (let a = 0; a < json1.length; a++) {
            IDarr.push(json1[a]._id);
          }

          return IDarr;
        }));
  }
  console.log(fetches)
  Promise.all(fetches)
    .then((IDL2) => {
      while (IDarr.length > 0) {
        IDarr.pop();
      }
      for (let a = 0; a < IDL2.length; a++) {
        for (let b = 0; b < IDL2[a].length; b++) {
          IDarr.push(IDL2[a][b]);
        }
      }
      console.log(IDarr)
      var html = ""
      for (let i = 0; i < IDarr.length; i++) {
        html += "<a href='https://dashcraft.io/?t=" + IDarr[i] + "' target='_blank'>" + "https://dashcraft.io/?t=" + IDarr[i] + "</a><br>"
      }
      document.getElementById("tracks").innerHTML += html
    });

}


function getPositions(player) {
  var positions = [];
  var totals = { time: 0, position: 0, tracks: 0 }
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].leaderboard.find(({ user }) => user._id === player._id)) {
      positions.push({ position: (tracks[i].leaderboard.findIndex(({ user }) => user._id === player._id) + 1), mapper: tracks[i].user.username, link: "https://dashcraft.io/?t=" + tracks[i]._id, wr: tracks[i].leaderboard[0].time, time: tracks[i].leaderboard.find(({ user }) => user._id === player._id).time });
      totals.time += positions[positions.length - 1].time
      totals.position += positions[positions.length - 1].position
      totals.tracks += 1
    } else {
      positions.push({ position: 11, mapper: tracks[i].user.username, link: "https://dashcraft.io/?t=" + tracks[i]._id, wr: tracks[i].leaderboard[0].time, time: 100000 })
    }
  }
  console.log(positions)
  positions.sort((a, b) => (b.position + ((b.time - b.wr) / 10000)) - ((a.position) + (a.time - a.wr) / 10000));
  console.log(totals)
  totals.time = Math.round(totals.time * 10000) / 10000
  totals.position = Math.round(totals.position * 100) / 100
  if (positions.find(({ position }) => position === 11)) {
    totals.time += " (not top 10 on all tracks)"
  }
  var html = "Total time: " + totals.time + "<br>Average position: " + totals.position / totals.tracks + "<br>"
  for (let i = 0; i < positions.length; i++) {
    if (positions[i].position == 11) {
      html += "<br><a href='" + positions[i].link + "' target='_blank'>" + positions[i].mapper + "</a>'s track: Not top 10"
    } else {
      html += "<br><a href='" + positions[i].link + "' target='_blank'>" + positions[i].mapper + "</a>'s track: " + numbers[positions[i].position - 1] + " place ("
      if (positions[i].position == 1) {
        html += "Holds world record)"
      } else
        html += (Math.round((positions[i].time - positions[i].wr) * 10000) / 10000) + " seconds away from world record)"
    }
  }
  return html
}

function countPoints() {
  for (let i = 0; i < tracks.length; i++) {
    for (let j = 0; j < tracks[i].leaderboard.length; j++) {
      var decay = 1.051271  ;
      if (points.find(({ username }) => username === tracks[i].leaderboard[j].user.username) != undefined) {
        points.find(({ username }) => username === tracks[i].leaderboard[j].user.username).altpoints += (1 / (j + 1));
        points.find(({ username }) => username === tracks[i].leaderboard[j].user.username).points += Math.ceil((decay) ** (-j)*1000000/tracks.length);
      } else {
        points.push({ username: tracks[i].leaderboard[j].user.username, points: Math.ceil((decay) ** (-j)*1000000/tracks.length), altpoints: (1 / (j + 1)) });
      }
    }
  }

  points.sort((a, b) => b.altpoints - a.altpoints);
  console.log(points)
  var html = ""
  for (let i = 0; i < points.length; i++) {

    points[i].altpoints = Math.round(points[i].altpoints * 1000000 / tracks.length)
    html += points[i].username + ": " + points[i].altpoints + " points (" + points[i].points + " in game)<br>"
  }
  return html
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
