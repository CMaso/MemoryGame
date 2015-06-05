//1. general idea of game - fixed, never-changing group of images? or randomly selected from a superset every game, such as with a deck of cards? How many cards per game? How to handle scoring?
  //1a. Early on, I decide I'd like to modify the game so that more points are scored when the player makes uninterrupted matches. 
//2. Construct basic layout. What do I want the cards' "fronts" and "backs" to look like? First order of biz is get them to the point where clicking on them toggles their back/front.
   //2a. Keeping in mind, what is the general mechanism I want to use for the controller? Cards are a good idea, because they can be easily identified as "As, 5h," etc.
   //2b. Playing cards can also be easily represented without the need for a lot of image files. I will get 4 png files for each card suit, and display the card number as text.
   //I decide I want to bind the cards to their respective card values, dynamically. That way, I can change the card's state any number of ways without ever losing track of which card it is.
   //The name attribute is good for this -- ID attribute should always be unique to an element, but duplicate names are okay. 
 //3. I start building out the code, testing it and finding processed that can be encapsulated into functions so as to make the app more clean and modular.
 //4. Cards are toggling. Next order of biz is to continue building out the main controller, doSelectCard(), which handles every button click.
   //4a. I draw out a flow chart by hand first, to get a good visual of how the logic will flow. There are any number of situations that could be the case when the button is clicked. Make sure they're all covered before start coding.
 //5. While coding doSelectCard(), output variables to console frequently, so as to catch any bugs early. Saves time in the long run and keeps one's mind in the Zen zone...
 //6. Basic functionality is there. Correct matches and incorrect matches are being handled as expected. Now do finishing touches. Game start/end/reset, score display, best score, change var names for consistency. 
  //6a. Also, look for anywhere code could be made more modular. Play the game a few times through, look for bugs.

	//global vars
	var arrDeck = buildDeck();
	var arrThisGameCards = [];
	var arrSolvedCards = [];
	var score = 0;//The game works this way: for every correct match in a row, you score incrementally more points per match. If you get a pair wrong, the point value for a match goes back to 1.
	var currentPointValue = 1;
	var hideCardDelay = 1500; //time in ms to delay
	var bestScore = 0;

	init();

	//functions
	function init() {//reset all global vars except bestScore 
		//reset global vars
		arrDeck = buildDeck();
		arrThisGameCards = [];
		arrSolvedCards = [];
		score = 0;
		currentPointValue = 1;
		hideCardDelay = 1500;

		$("#newBest").html("");
		$("#newBest").css("display", "none");
		$("#playAgain").css("display", "none");
		$("#resetBtn").html("Start Over");
		$("#currentScore").html(score);
		$("#pointsPerMatch").html(currentPointValue);
		hideAllCards();
		drawCards();
		assignPairs();
		console.log(arrThisGameCards);
	}

	function buildDeck() {
		var arrCardNums = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];//use "T" for ten to keep everything 2 chars long
		var arrSuits = ["h", "s", "d", "c"];
		var suit;
		var num;
		var arrLocalDeck = [];
	
		for (suit in arrSuits) {
			for (num in arrCardNums) {
				arrLocalDeck.push(arrCardNums[num] + arrSuits[suit]);
			}
		}
		return arrLocalDeck;
	}

	function assignPairs() {//randomly assign the current game's 10 drawn cards to the twenty buttons
		var arrCopyofDrawn = arrThisGameCards;
		var arrCardPairs = arrCopyofDrawn.concat(arrCopyofDrawn);
		var randomIndex;

		//iterate over cards/buttons
		$("#cardsDiv").children("button").each(function() {
			//randomly assign the cards to the buttons. Make the button's name equal to its assigned card. Elements can have same name, but not same id
			randomIndex = Math.floor(Math.random() * arrCardPairs.length);//get random number between 0 and 19 (for first iteration)
			$(this).attr("name", arrCardPairs[randomIndex]);
			arrCardPairs.splice(randomIndex,1);
		});
	}

	function showCard(btn)  {
		//assign the appropriate suit as the button's background image
		//assign the card number as the button's value
		if ($(btn).is(".s, .h, .d, .c")) {
			$(btn).removeClass(btn.name.charAt(1));
			$(btn).html("&nbsp;");
		}
		else {
			$(btn).addClass(btn.name.charAt(1));
			$(btn).html(btn.name.charAt(0));
		}
	}

	function doSelectCard(objCard) {
		var arrOtherCardsVisible = $("#cardsDiv").children("button.s, button.h, button.d, button.c").not(objCard);

		if (!$(objCard).is(".s, .h, .d, .c")) {//clicked card's face is not visible. (No need to do anything if it is visible)
			showCard(objCard);//make the card visible

			if (arrOtherCardsVisible.length > 0) {//are there any other visible cards?
				//if so, are any of those visible cards unsolved?
				var unsolvedCard = "";
				$(arrOtherCardsVisible).each(function() {//loop through and save the card object if an unsolved card is found
					if ($.inArray(this.name, arrSolvedCards) == -1) {
						unsolvedCard = this;
						return false;
					}
				});
				if (typeof unsolvedCard == "object") {//Does this visible, unsolved card match the one that was clicked?
					if (unsolvedCard.name == objCard.name) {//match!
						//add their name to arrSolvedCards
						//add points to cumulative score
						//increment point value
						//if this is the last match in the set, set high score and ask player if they want to play again 
						goodMatch(objCard);
						checkIfLastMatch();
					}
					else {//incorrect match
						//return currentPointValue to 1
						//hide both cards
						window.setTimeout(function(){badMatch(objCard, unsolvedCard);},1500);
					}
				}
			}
		}
	}

	function drawCards(){//select 10 distinct cards from the deck, save in an array
		var card;
		var randNum;
		var topRange = 52;//get random number between 0 and 51 for 1st iteration

		for (var i=0; i<10; i++) {
			randNum = Math.floor(Math.random() * topRange);
			card = arrDeck[randNum];
			arrThisGameCards.push(card);//add to drawn cards
			arrDeck.splice(randNum,1);//remove from the master deck
			topRange --;
		}
	}

	function goodMatch(objCard) {
		arrSolvedCards.push(objCard.name);
		score = (score + currentPointValue);
		currentPointValue++;
		$("#pointsPerMatch").html(currentPointValue);
		$("#currentScore").html(score);
	}

	function badMatch(objCard, unsolvedCard) {
		currentPointValue = 1;
		hideCard(objCard);
		hideCard(unsolvedCard);
		$("#pointsPerMatch").html(currentPointValue);
	}

	function checkIfLastMatch() {
		if($("#cardsDiv").children("button.s, button.h, button.d, button.c").length == $("#cardsDiv").children("button").length) {//all cards visible
			setBestScore();
			$("#playAgain").css("display", "inline");
			$("#resetBtn").html("Sure!");
		}
	}

	function hideCard(objCard) {
		$(objCard).removeClass(objCard.name.charAt(1));
		$(objCard).html("&nbsp;");
	}

	function hideAllCards() {
		$("#cardsDiv").children("button").each(function() {
			hideCard(this);
		});
	}

	function setBestScore() {
		if (score > bestScore) {
			var oldBest = bestScore;
			bestScore = score;
			$("#bestScore").html(bestScore);
			$("#newBest").html("Congrats! You have a new best score, " + bestScore + ", up " + (bestScore - oldBest) + " points from your recent best!");
			$("#newBest").css("display", "block");
		}
	}