/*
NOTES:
- Project doesn't work on Firefox; values aren't being stored in localStorage correctly (tested and working on Chrome, Edge, and Opera).
- Need to add option for a tiebreaker, in the event of a draw (golden goal or extra time).
- Round robin functionality hasn't been added yet.
- Due to how the bracket is coded, elimination only works for number of teams in a doubling sequence (4,8,16,32,64) (could mitigate this with a dropdown).
- Order of teams in bracket can get mixed up if matches aren't played in order.
- Matchup containers need to be modified to better highlight winning teams.
- Timer needs to be fixed; when timer starts, doesn't start counting down for ~3 seconds.
- Settings page isn't completed.
- Match functionality should be contained into 1 function, with matchInfo values used as parameters
- Code needs to be refactored, line count needs to be reduced.
- Background image courtesy of Pixabay (https://www.pexels.com/photo/white-and-black-soccer-ball-on-side-of-green-grass-field-during-daytime-47343/) 
*/

document.addEventListener("DOMContentLoaded", function () {

// Storing match & tournament information
	let matchInfo = JSON.parse(localStorage.getItem("matchInfo")) || {};
	const createMatchButton = document.getElementById("create-match-button");
	if (createMatchButton) {

		// When "Create Match" is clicked, match info is sent to localStorage using setMatchInfo function, page is redirected to scoreboard.html
		createMatchButton.addEventListener("click", setMatchInfo);
	}

	function setMatchInfo() {
		const matchForm = document.getElementById("match-form");
		matchInfo = {
			name: document.getElementById("match-name").value || "Soccer Match",
			time: document.getElementById("match-time").value || 12,
			home: document.getElementById("home-team-name").value || "Home",
			homeid: null,
			away: document.getElementById("away-team-name").value || "Away",
			awayid: null,
			tourneyCheck: false
		};

		localStorage.setItem("matchInfo", JSON.stringify(matchInfo));
		console.log(matchInfo);
		matchForm.submit();
		event.preventDefault();
		window.location.href = "scoreboard.html"
	}

	const tourneyForm = document.getElementById("tournament-form");
	const createTournamentButton = document.getElementById("create-tournament-button");
	const tourneyStyle = document.getElementById("tournament-style")
	let tourneyTeams = [];

	if (createTournamentButton) {

		// Listen for tournament style to change; if set to round robin, hide 'Best of Series' input. If set to elimination, show 'Best of Series' input.
		tourneyStyle.addEventListener("change", function () {

			if (tourneyStyle.value === "R") {
				console.log("r")

				document.getElementById("best-of-series-div").style.display = "none";
			}
			else if (tourneyStyle.value === "E") {
				console.log("e")

				document.getElementById("best-of-series-div").style.display = "block";

			}
		});


		// When "Create Tournament" is clicked, tournament info is sent to localStorage using createTournament function
		createTournamentButton.addEventListener("click", createTournament)
	}

	// Create tournament function
	function createTournament() {
		event.preventDefault()
		let tourneyInfo = {
			name: document.getElementById("tournament-name").value || "Tournament",
			time: document.getElementById("match-time").value || 12,
			numberOfTeams: document.getElementById("number-of-teams").value,
			style: document.getElementById("tournament-style").value,
			bestOf: document.getElementById("best-of-series").value,
			teamNames: document.getElementById("team-names").value.split('\n'),
			tourneyCheck: true,
			winnerAlertCheck: false
		}
		// Replacing null team Values with Generic Names
		for (let i = 0; i < tourneyInfo.numberOfTeams; i++) {
			if (!tourneyInfo.teamNames[i]) {
				tourneyInfo.teamNames[i] = "Team " + (i + 1);
			}
		}

		// Generating Team Objects
		for (let team = 0; team < tourneyInfo.numberOfTeams; team++) {
			let teamObject = {
				id: team,
				name: tourneyInfo.teamNames[team],
				wins: 0,
				losses: 0
			};
			tourneyTeams.push(teamObject);
			console.log(tourneyTeams)
		}

		localStorage.setItem("tourneyTeams", JSON.stringify(tourneyTeams));
		//If tournament info is invalid, user receives an error message
		if (tourneyForm.checkValidity()) {
			localStorage.setItem("tourneyInfo", JSON.stringify(tourneyInfo));
			tourneyForm.submit();
			event.preventDefault();

			// If tournament is elimination, redirect to elimination.html. If tournament is round robin, redirect to roundrobin.html
			if (tourneyInfo.style === "E") {
				window.location.href = "elimination.html"
			}

			else if (tourneyInfo.style === "R") {
				window.location.href = "roundrobin.html"
			}

		} else {
			alert("Please fill in all required fields");
		}
	};
	// Creating a Tournament Bracket
	const bracketContainer = document.getElementById("bracket-container");
	const bracketTitle = document.getElementById("bracket-title");
	const bracketSubtitle = document.getElementById("bracket-subtitle");
	const tourneyWinnerWrapper = document.getElementById("tournament-winner-wrapper")
	const tourneyWinnerAlert = document.getElementById("tournament-winner-alert")
	const tourneyWinnerText = document.getElementById("tournament-winner-text")
	const tourneyWinnerClose = document.getElementById("tournament-winner-close")
	tourneyInfo = JSON.parse(localStorage.getItem("tourneyInfo"));
	var totalRounds = Math.ceil(Math.log2(tourneyInfo.numberOfTeams));
	const matchUpsPerRound = [];
	const teamsPerRound = [];
	let totalTeamsPerRound = [];
	let teamsPerRoundSum = 0;

	// Calculating matchUpsPerRound and teamsPerRound
	for (let round = 0; round <= totalRounds; round++) {

		let teamsInRound = Math.ceil(tourneyInfo.numberOfTeams / Math.pow(2, round));
		let matchUpsInRound = Math.floor(teamsInRound / 2);

		matchUpsPerRound.push(matchUpsInRound);
		teamsPerRound.push(teamsInRound);
	};

	// Calculating totalTeamsPerRound
	for (let i = 0; i < teamsPerRound.length; i++) {
		teamsPerRoundSum += teamsPerRound[i];
		totalTeamsPerRound.push(teamsPerRoundSum);
	}

	// Generating Bracket
	if (bracketContainer) {
		tourneyInfo = JSON.parse(localStorage.getItem("tourneyInfo"));
		tourneyTeams = JSON.parse(localStorage.getItem("tourneyTeams"));


		//If enough teams have been added to tourneyTeams, and winnerAlertCheck is false, declare a tournament winner in an alert
		if (tourneyTeams.length === totalTeamsPerRound.slice(-1)[0]) {
			if (tourneyInfo.winnerAlertCheck === false) {

				// Set winnerAlertCheck to true so that it doesn't appear again
				tourneyInfo.winnerAlertCheck = true;
				localStorage.setItem("tourneyInfo", JSON.stringify(tourneyInfo));

				// Setting tourney winner alert message
				tourneyWinnerWrapper.style.display = "inline-flex";
				tourneyWinnerAlert.style.display = "inline-flex";
				tourneyWinnerText.innerHTML = "<h1>" + tourneyTeams.slice(-1)[0].name + " Wins!</h1>";
				 
				// If close is clicked, close the alert
				tourneyWinnerClose.addEventListener("click", function () {
				tourneyWinnerWrapper.style.display = "none";
				});
			}
		}



		// Setting Bracket Page Elements
		document.title = tourneyInfo.name + " Bracket - MatchPal";
		bracketTitle.textContent = tourneyInfo.name + " Bracket";
		bracketSubtitle.textContent = tourneyInfo.time + " minute matches" + ", best of " + tourneyInfo.bestOf;

		// Generating Rounds
		for (let round = 0, matchUpTotal = 0; round <= totalRounds; round++) {
			var roundContainer = document.createElement('div');
			roundContainer.id = "round-container-" + round;
			roundContainer.className = "round-container";
			bracketContainer.appendChild(roundContainer);

			// Generating Match-Up Containers
			for (let matchUp = 1; matchUp <= matchUpsPerRound[round]; matchUp++, matchUpTotal++) {
				let homeIndex = tourneyTeams[2 * (matchUpTotal)];
				let awayIndex = tourneyTeams[2 * (matchUpTotal) + 1];

				var matchUpContainer = document.createElement('div');
				matchUpContainer.id = "matchup-container-" + matchUpTotal;
				matchUpContainer.className = "matchup-container"
				roundContainer.appendChild(matchUpContainer);

				if (homeIndex !== undefined) {
					// Setting matchup container home info
					const homeTeamBracketName = document.createElement('div');
					homeTeamBracketName.className = "home-team-bracket-name";
					homeTeamBracketName.textContent = homeIndex.name;
					matchUpContainer.appendChild(homeTeamBracketName);

					const homeTeamBracketWins = document.createElement('div');
					homeTeamBracketWins.className = "home-team-bracket-wins"
					homeTeamBracketWins.innerHTML = homeIndex.wins;
					matchUpContainer.appendChild(homeTeamBracketWins);

				}

				if (awayIndex !== undefined) {
					// Setting matchup container away info
					const awayTeamBracketName = document.createElement('div');
					awayTeamBracketName.className = "away-team-bracket-name";
					awayTeamBracketName.textContent = awayIndex.name;
					matchUpContainer.appendChild(awayTeamBracketName);

					const awayTeamBracketWins = document.createElement('div');
					awayTeamBracketWins.className = "away-team-bracket-wins"
					awayTeamBracketWins.innerHTML = awayIndex.wins;
					matchUpContainer.appendChild(awayTeamBracketWins);
				}

				// Generating a start match button
				// If homeIndex and awayIndex aren't undefined, AND neither team has enough wins to advance yet, AND the entire round has been populated with teams, generate a start match button
				if (homeIndex !== undefined && awayIndex !== undefined) {
					if (homeIndex.wins < Math.ceil(tourneyInfo.bestOf / 2) && awayIndex.wins < Math.ceil(tourneyInfo.bestOf / 2)) {
						if (tourneyTeams.length >= totalTeamsPerRound[round]) {
							const startMatchTourney = document.createElement('button');
							startMatchTourney.className = "start-match-tourney";
							startMatchTourney.textContent = "Start Match"
							startMatchTourney.addEventListener("click", function () {
								tourneyMatch(homeIndex, awayIndex)
							});
							matchUpContainer.appendChild(startMatchTourney);
						}
					}

				}



			}
		}
	};


	//Starting a Tournament Match
	function tourneyMatch(home, away) {
		console.log(home + " " + away)
		matchInfo.home = home.name;
		matchInfo.homeid = home.id;
		matchInfo.away = away.name;
		matchInfo.awayid = away.id;
		matchInfo.time = tourneyInfo.time;
		matchInfo.name = tourneyInfo.name;
		matchInfo.tourneyCheck = true;
		localStorage.setItem("matchInfo", JSON.stringify(matchInfo));
		console.log(matchInfo);
		window.location.href = "scoreboard.html"
	}

	// Generating standings
	const standingsContainer = document.getElementById("standings-container")
	const standingsTitle = document.getElementById("standings-title")
	const standingsSubtitle = document.getElementById("standings-subtitle")

	if (standingsContainer) {
		generateStandings();
	}

	function generateStandings() {
		tourneyTeams = JSON.parse(localStorage.getItem("tourneyTeams"));
		let tourneyTeamsCondensed = [];

		// Condensing tourneyTeams based on common attribute (name) into tourneyTeamsCondensed
		for (let i = 0; i < tourneyTeams.length; i++) {
			var team = tourneyTeams[i];
			if (tourneyTeamsCondensed.hasOwnProperty(team.name)) {
				tourneyTeamsCondensed[team.name].wins += parseInt(team.wins);
				tourneyTeamsCondensed[team.name].losses += parseInt(team.losses);
			} else {
				tourneyTeamsCondensed[team.name] = {
					name: team.name,
					wins: parseInt(team.wins),
					losses: parseInt(team.losses)
				};
			}
		}

		// Converting tourneyTeamsCondensed into an array, assigning it to standingsTeams
		var standingsTeams = Object.values(tourneyTeamsCondensed);

		// Sorting standingsTeams from most wins to least
		standingsTeams.sort(function (home, away) {
			if (home.wins !== away.wins) {
				return away.wins - home.wins;
			} else {
				return home.losses - away.losses;
			}
		});

		console.log(tourneyTeamsCondensed)
		console.log(standingsTeams)

		// Creating standings page elements
		document.title = tourneyInfo.name + " Standings - MatchPal";

		standingsTitle.textContent = tourneyInfo.name + " Standings";
		standingsSubtitle.textContent = tourneyInfo.time + " minute matches" + ", best of " + tourneyInfo.bestOf;

		// Creating Position column
		const standingsPositionColumn = document.createElement('div');
		standingsPositionColumn.className = "standings-position-column";

		// Adding Position column title
		const standingsPositionColumnTitle = document.createElement('div');
		standingsPositionColumnTitle.innerText = "#"
		standingsPositionColumnTitle.className = "standings-item";
		standingsPositionColumn.appendChild(standingsPositionColumnTitle);

		// Creating Name column
		const standingsNameColumn = document.createElement('div');
		standingsNameColumn.className = "standings-name-column";

		// Adding Name column title
		const standingsNameColumnTitle = document.createElement('div');
		standingsNameColumnTitle.innerText = "Name"
		standingsNameColumnTitle.className = "standings-item";
		standingsNameColumn.appendChild(standingsNameColumnTitle);

		// Creating Wins column
		const standingsWinsColumn = document.createElement('div');
		standingsWinsColumn.className = "standings-wins-column";

		// Adding Wins column title
		const standingsWinsColumnTitle = document.createElement('div');
		standingsWinsColumnTitle.innerText = "Wins"
		standingsWinsColumnTitle.className = "standings-item";
		standingsWinsColumn.appendChild(standingsWinsColumnTitle);

		// Creating Losses column
		const standingsLossesColumn = document.createElement('div');
		standingsLossesColumn.className = "standings-losses-column";

		// Adding Losses column title
		const standingsLossesColumnTitle = document.createElement('div');
		standingsLossesColumnTitle.innerText = "Losses"
		standingsLossesColumnTitle.className = "standings-item";
		standingsLossesColumn.appendChild(standingsLossesColumnTitle);

		//Appending columnns to standingsContainer
		standingsContainer.appendChild(standingsPositionColumn);
		standingsContainer.appendChild(standingsNameColumn);
		standingsContainer.appendChild(standingsWinsColumn);
		standingsContainer.appendChild(standingsLossesColumn);

		// Filling columns with data from standingsTeams
		for (let i = 0; i < tourneyInfo.numberOfTeams; i++) {

			const standingsTeamPosition = document.createElement('div');
			standingsTeamPosition.className = "standings-item";
			standingsTeamPosition.innerText = i + 1;

			const standingsTeamName = document.createElement('div');
			standingsTeamName.className = "standings-item";
			standingsTeamName.innerText = standingsTeams[i].name

			const standingsTeamWins = document.createElement('div');
			standingsTeamWins.className = "standings-item";
			standingsTeamWins.innerText = standingsTeams[i].wins

			const standingsTeamLosses = document.createElement('div');
			standingsTeamLosses.className = "standings-item";
			standingsTeamLosses.innerText = standingsTeams[i].losses

			standingsPositionColumn.appendChild(standingsTeamPosition)
			standingsNameColumn.appendChild(standingsTeamName);
			standingsWinsColumn.appendChild(standingsTeamWins);
			standingsLossesColumn.appendChild(standingsTeamLosses);
		}
	}

	// Starting Match; Initializing scoreboard elements (document info, buttons, etc.)
	const matchNameDisplayElement = document.getElementById("match-name-display");
	const homeVSawayDisplayElement = document.getElementById("homeVSaway-display");
	const homeTeamDisplayElement = document.getElementById("home-teamdisplay");
	const awayTeamDisplayElement = document.getElementById("away-teamdisplay");
	let homeObject = {
		id: 0,
		name: "",
		goals: "0"
	};
	let awayObject = {
		id: 0,
		name: "",
		goals: "0"
	};
	const returntoMenu = document.getElementById("return-to-menu");
	const returnToBracket = document.getElementById("return-to-bracket");

	if (homeTeamDisplayElement) {
		document.title = matchInfo.name + " - " + matchInfo.home + " vs. " + matchInfo.away + " - MatchPal";
		matchNameDisplayElement.textContent = matchInfo.name;
		homeVSawayDisplayElement.textContent = matchInfo.home + " vs. " + matchInfo.away;
		homeTeamDisplayElement.textContent = matchInfo.home;
		awayTeamDisplayElement.textContent = matchInfo.away;
		homeObject.name = matchInfo.home
		homeObject.id = matchInfo.homeid
		awayObject.name = matchInfo.away
		awayObject.id = matchInfo.awayid

		if (matchInfo.tourneyCheck === true) {
			returnToBracket.style.display = "inline-flex";
			returntoMenu.style.display = "none";
		} else {
			returnToBracket.style.display = "none";
			returntoMenu.style.display = "inline-flex";
		}
	}
	const timerElement = document.getElementById("scoreboard-timer");
	const timeRemaining = document.getElementById("timeRemaining");
	const timerStart = document.getElementById("scoreboard-timer-start");
	const timerPause = document.getElementById("scoreboard-timer-pause");
	const timerContinue = document.getElementById("scoreboard-timer-continue");
	const endMatch = document.getElementById("scoreboard-end");
	const coinFlip = document.getElementById("scoreboard-coinflip");
	const coinFlipAction = document.getElementById("scoreboard-coinflip-action");
	const coinFlipClose = document.getElementById("scoreboard-coinflip-close");
	const alert = document.getElementById("alert");
	const alertMessageText = document.getElementById("alert-message");
	const alertWrapper = document.getElementById("alert-wrapper");
	const coinflipSfx = new Audio("./sounds/coinflipSfx.mp3")
	let endMatchValue = false;
	const homeAddGoalButton = document.getElementById("home-addgoalbutton");
	const awayAddGoalButton = document.getElementById("away-addgoalbutton");
	const homeRemoveGoalButton = document.getElementById("home-removegoalbutton");
	const awayRemoveGoalButton = document.getElementById("away-removegoalbutton");
	const homeGoalElement = document.getElementById("home-goalcounter")
	const awayGoalElement = document.getElementById("away-goalcounter")

	if (timerElement) {
		//Timer Logic
		timerElement.innerHTML = matchInfo.time + ":00";
		const startingMinutes = matchInfo.time || 12;
		let time = startingMinutes * 60;
		let isPaused = false;
		let refreshIntervalId;

		function updateTimer() {
			if (!isPaused) {
				const minutes = Math.floor(time / 60);
				let seconds = time % 60;
				seconds = seconds < 10 ? "0" + seconds : seconds;
				timerElement.innerHTML = `${minutes}:${seconds}`;
				time--;
				if (time < 0 || endMatchValue === true) {
					clearInterval(refreshIntervalId);
					checkWinner();
				}
			}
		}
		timerStart.addEventListener("click", function () {
			if (!refreshIntervalId) {
				refreshIntervalId = setInterval(updateTimer, 1000);
				timerStart.style.display = "none";
				timerPause.style.display = "inline-flex";
				timeRemaining.style.display = "block";
				homeAddGoalButton.style.display = "block";
				awayAddGoalButton.style.display = "block";
				homeRemoveGoalButton.style.display = "block";
				awayRemoveGoalButton.style.display = "block";
				coinFlip.style.display = "none";
				endMatch.style.display = "inline-flex";
				returntoMenu.style.display = "none";
				timerElement.style.display = "block";
			}
			returnToBracket.style.display = "none";
		});
		timerPause.addEventListener("click", function () {
			timerPause.style.display = "none";
			timerContinue.style.display = "inline-flex";
			timerElement.style.backgroundColor = "#9a9a9a";
			isPaused = true;
		});
		timerContinue.addEventListener("click", function () {
			timerContinue.style.display = "none";
			timerPause.style.display = "inline-flex";
			isPaused = false;
			timerElement.style.backgroundColor = "#FFFFFF";
		});
		// Coin Flip Logic
		coinFlip.addEventListener("click", function () {
			alert.style.display = "flex";
			alertWrapper.style.display = "flex";
			coinFlipAction.style.display = "inline-flex";
			coinFlipClose.style.display = "inline-flex";
		});
		coinFlipAction.addEventListener("click", function () {
			const coinFlipMath = Math.round(Math.random()) + 1;
			if (coinFlipMath == 1) {
				var headsOrTails = "Heads";
			} else {
				var headsOrTails = "Tails";
			}
			coinflipSfx.play();
			alertMessageText.innerHTML = "<h2>Flipping...</h2>";
			setTimeout(function () {
				alertMessageText.innerHTML = "<h1>" + headsOrTails + "</h1>";
			}, 2300);
			coinFlipAction.style.display = "none";
		});
		coinFlipClose.addEventListener("click", function () {
			alertMessageText.innerHTML = "";
			alert.style.display = "none";
			alertWrapper.style.display = "none";
			coinFlipAction.style.display = "none";
			coinFlipClose.style.display = "none";
		});
		//End Match Logic
		endMatch.addEventListener("click", function () {
			endMatchValue = true;
		});
	}
	// Tracking Score
	if (homeAddGoalButton) {
		const homeAddGoalButton = document.getElementById("home-addgoalbutton");
		const awayAddGoalButton = document.getElementById("away-addgoalbutton");
		const homeRemoveGoalButton = document.getElementById("home-removegoalbutton");
		const awayRemoveGoalButton = document.getElementById("away-removegoalbutton");

		// If home add goal button is clicked, add a goal
		homeAddGoalButton.addEventListener("click", function () {
			homeObject.goals++;
			updateScore();
		});

		// If away add goal button is clicked, add a goal
		awayAddGoalButton.addEventListener("click", function () {
			awayObject.goals++;
			updateScore();
		});

		// If home remove goal button is clicked, remove a goal
		homeRemoveGoalButton.addEventListener("click", function () {
			if (homeObject.goals > 0) {
				homeObject.goals--;
				updateScore()
			}
		});

		// If away remove goal button is clicked, remove a goal
		awayRemoveGoalButton.addEventListener("click", function () {
			if (awayObject.goals > 0) {
				awayObject.goals--;
				updateScore()
			}
		});

		// Updating scoreboard goal-counter element
		function updateScore() {
			homeGoalElement.innerHTML = homeObject.goals;
			awayGoalElement.innerHTML = awayObject.goals;
		}

		// Checking and declaring winner in an alert
		const whistle = new Audio("./sounds/whistle.mp3")
		function checkWinner() {
			whistle.play();
			var tourneyTeams = JSON.parse(localStorage.getItem("tourneyTeams"));
			var returnQuery = "";
			var winnerQuery = "";

			// Determine the winning and losing teams
			var winningTeam;
			var losingTeam;
			if (homeObject.goals > awayObject.goals) {
				winningTeam = homeObject;
				losingTeam = awayObject;
				winnerQuery = "<div id='winner-content'><h1>" + winningTeam.name + " Wins</h1><br><h2>";
			} else if (awayObject.goals > homeObject.goals) {
				winningTeam = awayObject;
				losingTeam = homeObject;
				winnerQuery = "<div id='winner-content'><h1>" + winningTeam.name + " Wins</h1><br><h2>";
			} else {
				winnerQuery = "<div id='winner-content'><h1>Draw</h1><br><h2>";
			}

			// if tourneyCheck is true, run tournament match win logic and show 'Return to Bracket'
			if (matchInfo.tourneyCheck === true) {

				if (winningTeam && losingTeam !== undefined) {

					// Update wins and losses for the winning and losing teams
					for (let i = 0; i < tourneyTeams.length; i++) {

						// Increase tourneyTeams win total of winning team by one
						if (tourneyTeams[i].id === winningTeam.id) {
							tourneyTeams[i].wins++;

							// Check if the winning team has enough wins to advance
							if (tourneyTeams[i].wins >= Math.ceil(tourneyInfo.bestOf / 2)) {
								// If winning team has enough wins to advance, addd them to the end of the tourneyTeams array with values reset to 0
								let advancedTeam = {
									id: tourneyTeams.length,
									name: tourneyTeams[i].name,
									wins: 0,
									losses: 0
								};
								tourneyTeams.push(advancedTeam);
							}
						//Increase tourneyTeams losses total of losing team by one
						} else if (tourneyTeams[i].id === losingTeam.id) {
							tourneyTeams[i].losses++;
						}

						// Update tourneyTeams in localStorage
						localStorage.setItem("tourneyTeams", JSON.stringify(tourneyTeams));
					}
				}

				returnQuery = "<a href='elimination.html'><div id='return-to-bracket' class='menu-button'>Return to bracket</div></a></div>";
				// If else, just show 'Return to Menu' button
			} else {
				returnQuery = "<a href='index.html'><div id='return-to-menu' class='menu-button'>Return to menu</div></a></div>";
			}

			// Display winner information
			alertMessageText.innerHTML = winnerQuery +
				homeObject.name + ": " + homeObject.goals + "<br>" +
				awayObject.name + ": " + awayObject.goals + "<br></h2>" +
				returnQuery;


			// Display the alert
			alert.style.display = "flex";
			alertWrapper.style.display = "flex";
		}
	};
});