
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
  var url = "https://sheets.googleapis.com/v4/spreadsheets/10ERD7U-o5IPoQIEWxu4fK6GqPFpo8Dc9v1VT21GtFTY/values/'Verified Tracks'!B2:B?key=AIzaSyDVPlMY4lBW6g6BGW7A73egVczKWORq-FY"
  var fetches = [];
    fetches.push(
      fetch(url)
        .then((response) => response.json())
        .then((json) => {

          console.log(json);
          var IDarr = []
          for (var i = 0; i < json.values.length; i++) {
            IDarr.push((json.values[i][0]).slice(json.values[i][0].length - 24, json.values[i][0].length));
          }
          return IDarr;
        }));

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

  document.getElementById("players").innerHTML = "Players: " + Math.round(tracks.reduce((total, current) => total + current.leaderboardTotalCount, 0) / tracks.length);
  document.getElementById("likes").innerHTML = "Likes: " + Math.round(tracks.reduce((total, current) => total + current.likesCount, 0) / tracks.length);
  document.getElementById("dislikes").innerHTML = "Dislikes: " + Math.round(tracks.reduce((total, current) => total + current.dislikesCount, 0) / tracks.length);

  document.getElementById("leaderboard").innerHTML = "<h2>Point Leaderboard</h2>"
  document.getElementById("wrcount").innerHTML = "<h2>WR Leaderboard</h2>"

  countPoints()

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
    if ((tracks[i].user.username).includes(document.getElementById("player").value)) {
      if (!players.find(({ username }) => username === tracks[i].user.username)) {
        players.push(tracks[i].user)
      }
    }
  }
  console.log(players)
  if (players.find(({ username }) => username === document.getElementById("player").value)) {
    console.log("hijhi")
    var playerpos = players.findIndex(({ username }) => username === document.getElementById("player").value)
    players.splice(playerpos+1, 10)
  }

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
    console.log(players[0].levelData)
    link.innerHTML += "Level " + (players[0].levelData.level + 1) + " (" + players[0].levelData.xpInLevel + "/" + players[0].levelData.totalXpInLevel + ") (" + players[0].levelData.totalXp + " total)"
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
      var decay = 1.051271;
      if (points.find(({ username }) => username === tracks[i].leaderboard[j].user.username) != undefined) {
        points.find(({ username }) => username === tracks[i].leaderboard[j].user.username).altpoints += (1 / (j + 1));
        points.find(({ username }) => username === tracks[i].leaderboard[j].user.username).points += Math.ceil((decay) ** (-j) * 1000000 / tracks.length);
        if (j == 0) {
          points.find(({ username }) => username === tracks[i].leaderboard[j].user.username).wrs += 1;
        }
      } else {
        points.push({ username: tracks[i].leaderboard[j].user.username, points: Math.ceil((decay) ** (-j) * 1000000 / tracks.length), altpoints: (1 / (j + 1)), wrs: 0 });
        if (j == 0) {
          points[points.length - 1].wrs = 1;
        }
      }
    }
  }

  points.sort((a, b) => b.altpoints - a.altpoints);
  console.log(points)
  var html = ""
  for (let i = 0; i < points.length; i++) {
    points[i].altpoints = Math.round(points[i].altpoints * 1000000 / tracks.length)
    html += (i+1) + ". " + points[i].username + ": " + points[i].altpoints + " points (" + points[i].points + " in game)<br>"
  }
  document.getElementById("leaderboard").innerHTML += html

  points.sort((a, b) => b.wrs - a.wrs);
  console.log(points)
  html = ""
  for (let i = 0; i < points.length; i++) {
    if (!points[i].wrs == 0) {
      html += (i+1) + ". " + points[i].username + ": " + points[i].wrs + "<br>"
    }
  }
  document.getElementById("wrcount").innerHTML += html
}

function trackLookup() {
  var fetches = []
  var link = document.getElementById("tracklink").value
  var id = link.slice(link.length - 24, link.length)

  fetches.push(fetch("https://api.dashcraft.io/trackv2/" + id)
    .then((response) => response.json())
    .then((json) => {
      return json                        
    })
  )
  fetches.push(fetch("https://cdn.dashcraft.io/v2/prod/track/" + id + ".json?v=3")
    .then((response) => response.json())
    .then((json) => {
      return json
    })
  )

  Promise.all(fetches)
    .then((IDL) => {
      console.log(IDL)
      getGhosts(IDL)
    })
}

function getGhosts(trackdata) {
  var fetches = []
  for (let i = 0; i < trackdata[0].leaderboard.length; i++) {
    fetches.push(fetch("https://cdn.dashcraft.io/v2/prod/ghost/" + trackdata[0].leaderboard[i]._id + ".json?v=3")
      .then((response) => response.json())
      .then((json) => {

        return json
      })
    )
  }
  Promise.all(fetches)
    .then((IDL) => {
      for (let i = 0; i < trackdata[0].leaderboard.length; i++) {
        trackdata[0].leaderboard[i].ghost = IDL[i]
      }
      console.log(trackdata)
      var cps = []
      var start = ""
      for (let i = 0; i < trackdata[1].trackPieces.length; i++) {
        if (trackdata[1].trackPieces[i].a.includes(1)) {
          cps.push(trackdata[1].trackPieces[i])
        }
        if (trackdata[1].trackPieces[i].id == 1) {
          start = trackdata[1].trackPieces[i]
        }
      }
      console.log(cps)


      for (let i = 0; i < trackdata[0].leaderboard.length; i++) {
        for (let j = 0; j < trackdata[0].leaderboard[i].ghost.snapshots.length - 1; j++) {
          for (let k = 0; k < cps.length; k++) {

            if (checkCP(trackdata[0].leaderboard[i].ghost.snapshots[j], cps[k], trackdata[0].leaderboard[i].ghost.snapshots[j + 1])) {
              console.log(k, i, j)
            }
          }
        }
      }
    })
}

function checkCP(ghost, cp, ghost2) {
  if (cp.r == 90 || cp.r == 270) {
    var p2 = ghost.p[2]
    ghost.p[2] = ghost.p[0]
    ghost.p[0] = p2

    p2 = ghost2.p[2]
    ghost2.p[2] = ghost2.p[0]
    ghost2.p[0] = p2
  }
  if (cp.id == 3) {
    if (
      ((cp.p[2] < ghost.p[2] && cp.p[2] >= ghost2.p[2]) || (cp.p[2] >= ghost.p[2] && cp.p[2] < ghost2.p[2]))
      && (cp.p[0] < ghost.p[0] + 15 && cp.p[0] > ghost.p[0] - 15)
      && (cp.p[1] < ghost.p[1] && cp.p[1] > ghost.p[1] - 15)) {
      console.log(ghost, cp)
      return true
    }
  }
  return false
}
