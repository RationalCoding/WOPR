function readout(message, index) {
    if (index < message.length) {
        $("#readin-wrapper").hide();
        if (message[index] == "%") {
            $("#readout").append("<br>");
        } else if (message[index] == "$") {
            $("#readout").append("&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;");
        } else {
            $("#readout").append(message[index]);
        }

        setTimeout(function () {
            readout(message, index + 1);
        }, 50);

        if (readoutSound.paused && !killAudio) {
            readoutSound.play();
        }
    } else {
        $("#readin-wrapper").show();
	if (!killAudio){
        	$("#readin").focus();
	}
        readoutSound.pause();
    }
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

var killAudio = false;
if (getQueryVariable("killAudio")) {
    killAudio = true;
}

function clearReadout() {
    $("#readout").html("");
    $("#readin").val("");
}

function playVoice(filename, vol) {
    var voiceSound = new Audio('sounds/' + filename);
    voiceSound.volume = vol;
    if (!killAudio) {
        voiceSound.play();
    }
}


function state_greetings() {
    playVoice("greetings.wav", .2)
    readout("GREETINGS PROFESSOR FALKAN.", -1);
    waitForEnter(state_play_ask);
}

function state_play_ask() {
    var userIN = $("#readin").val();
    if (userIN.toUpperCase().indexOf("GLOBAL") != -1 && userIN.toUpperCase().indexOf("THERMONUCLEAR") != -1 && userIN.toUpperCase().indexOf("WAR") != -1) {
        playVoice("chess.wav", .3);
        clearReadout();
        readout("WOULDN'T YOU PREFER A NICE GAME OF CHESS?", -1);
        window.open('https://www.youtube.com/tv#/watch?v=gz3F-02FwZc&resume');
        waitForEnter(state_play_ask);
    } else {
        playVoice("play_game.wav", .2)
        clearReadout();
        readout("SHALL WE PLAY A GAME? Y/N", -1);
        waitForEnter(state_choose_game);
    }

}

function state_choose_game() {
    var userIN = $("#readin").val();
    if (userIN.toUpperCase() === "NO" || userIN.toUpperCase() === "N" || userIN.toUpperCase() === "NO.") {
        playVoice("fine.wav", .3);
        clearReadout();
        readout("FINE.%%%-----CONNECTION TERMINATED-----", -1);
        waitForEnter(function () {});
    } else if (userIN.toUpperCase().indexOf("GLOBAL") != -1 && userIN.toUpperCase().indexOf("THERMONUCLEAR") != -1 && userIN.toUpperCase().indexOf("WAR") != -1) {
        playVoice("chess.wav", .3);
        clearReadout();
        readout("WOULDN'T YOU PREFER A NICE GAME OF CHESS?", -1);
        window.open('https://www.youtube.com/tv#/watch?v=gz3F-02FwZc&resume');
    } else {
        state_ask_side();
    }
}

function state_ask_side() {
    playVoice("which_side.wav", .2);
    clearReadout();
    readout("WHICH SIDE DO YOU WANT? X/O", -1);
    waitForEnter(state_start_single);
}

//Plays a move to the board
function playMove(r, c) {
    if (board[r][c] == "&#9634;") {
        if (turn == 0) {
            board[r][c] = playerCharacter;
            turn = 1;
        } else if (turn == 1) {
            board[r][c] = oppCharacter;
            turn = 0;

        }
        updateBoard();
    }

    var winner = testGameOver();
    if (winner == "NONE") {
        if (turn == 0) {
            if (!keepWinMessage) {
                clearReadout();
                readout("IT IS YOUR TURN.", -1);
            } else {
                keepWinMessage = false;
            }
        }
        return;
    } else {
        if (oppCharacter == winner) {
            state_game_over(0);
        } else {
            if (winner == "TIE") {
                state_game_over(1);
            } else {
                state_game_over(2);
            }

        }
    }
}


//Updates the board elements
function updateBoard() {
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            $("#" + String(r) + String(c)).html(board[r][c]);
        }
    }
}

//Calls advance when user presses enter
function waitForEnter(advance) {
    window.onkeyup = function (e) {
        var key = e.keyCode ? e.keyCode : e.which;

        if (key == 13) {
            advance();
        }
    }
}



//Returns true if game is over
function testGameOver() {
    for (var i = 0; i < 3; i++) {
        if (board[i][0] != "&#9634;" && board[i][0] == board[i][1] && board[i][1] == board[i][2]) {
            return board[i][0];
        } else if (board[0][i] != "&#9634;" && board[0][i] == board[1][i] && board[1][i] == board[2][i]) {
            return board[0][i];
        }
    }

    if (board[1][1] != "&#9634;") {
        if (board[0][0] == board[1][1] && board[1][1] == board[2][2]) {
            return board[0][0];
        } else if (board[0][2] == board[1][1] && board[1][1] == board[2][0]) {
            return board[0][2];
        }
    }

    var foundEmpty = false;
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            if (board[r][c] == "&#9634;") {
                return "NONE";
            }
        }
    }

    return "TIE";
}



//----Single player----
function state_start_single() {
    var userIN = $("#readin").val();
    waitForEnter(function () {});
    if (userIN.toUpperCase() === "X") {
        turn = 0; //Player goes
        playVoice("excellent.wav", .3);
        playerCharacter = "X";
        oppCharacter = "O";
        $("#tictac").show();
        if (turn == 1) decideMove();
    } else if (userIN.toUpperCase() === "O") {
        turn = 1; //Computer goes
        playVoice("excellent.wav", .3);
        playerCharacter = "O";
        oppCharacter = "X";
        $("#tictac").show();
        if (turn == 1) decideMove();
    } else {
        state_ask_side();
    }
}

//Decides the optimal move
function decideMove() {
    var pos = [];

    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            if (board[r][c] == "&#9634;") {
                pos.push([r, c]);
            }
        }
    }

    var indexR = Math.floor(Math.random() * pos.length);
    playMove(pos[indexR][0], pos[indexR][1]);

}



//Game over state
var keepWinMessage = false;

function state_game_over(iWin) {
    clearReadout();
    keepWinMessage = true;
    if (iWin == 0) {
        playVoice("excellent.wav", 1);
        readout("I WIN. PLAYING AGAIN.", -1);
    } else if (iWin == 1) {
        playVoice("not_to_play.wav", 1);
        readout("TIE. PLAYING AGAIN.", -1);
    } else {
        playVoice("fine.wav", 1);
        readout("YOU WIN. PLAYING AGAIN.", -1);
    }

    board = [
        ["&#9634;", "&#9634;", "&#9634;"],
        ["&#9634;", "&#9634;", "&#9634;"],
        ["&#9634;", "&#9634;", "&#9634;"]
    ];
    updateBoard();
}


var readoutSound = new Audio('sounds/readout2.mp3');
readoutSound.loop = true;
readoutSound.volume = .1;

var board = [
    ["&#9634;", "&#9634;", "&#9634;"],
    ["&#9634;", "&#9634;", "&#9634;"],
    ["&#9634;", "&#9634;", "&#9634;"]
];
var playerCharacter = "X";
var oppCharacter = "O";
var turn = 0;
var numPlayers = 1;
var allowClick = false;

$(document).ready(function () {
    $("body").on('click', function(){
        $("#readin").focus();
    });
    if (!killAudio){
        $("#readin").focus();
    }
    

    //Add click listeners
    $("#tictac span").mouseup(function () {
        console.log(turn);
        if (turn == 0) {
            var coord = $(this).attr('id').split('');
            playMove(coord[0], coord[1]);
            decideMove();
        }
    });

    $("#tictac").hide();
    state_greetings();
});