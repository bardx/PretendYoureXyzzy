/**
 * AJAX callback handlers.
 * 
 * TODO make this individual files instead of all in one.
 * 
 * @author ajanata
 */

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.REGISTER] = function(data) {
  cah.nickname = data['nickname'];
  cah.log.status("You are connected as " + cah.nickname);
  $("#nickbox").hide();
  $("#canvass").show();

  cah.ajax.after_registered();
};

cah.ajax.ErrorHandlers[cah.$.AjaxOperation.REGISTER] = function(data) {
  $("#nickbox_error").text(cah.$.ErrorCode_msg[data.error_code]);
  $("#nickname").focus();
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.FIRST_LOAD] = function(data) {
  if (data.in_progress) {
    // TODO reload data. see what 'next' is and go from there.
    // for now just load the nickname
    cah.nickname = data['nickname'];
    cah.log.status("You have reconnected as " + cah.nickname);
    $("#nickbox").hide();
    $("#canvass").show();
    cah.ajax.after_registered();

    switch (data[cah.$.AjaxResponse.NEXT]) {
      case cah.$.ReconnectNextAction.GAME:
        cah.log.status("Reconnecting to game...");
        cah.Game.joinGame(data[cah.$.AjaxResponse.GAME_ID]);
        break;
      case cah.$.ReconnectNextAction.NONE:
        // pass
        break;
      default:
        cah.log.error("Unknown reconnect next action " + data[cah.$.AjaxResponse.NEXT]);
    }
  }
};

cah.ajax.ErrorHandlers[cah.$.AjaxOperation.FIRST_LOAD] = function(data) {
  // TODO dunno what to do here, if anything
};

/**
 * This should only be called after we have a valid registration with the server, as we start doing
 * long polling here.
 */
cah.ajax.after_registered = function() {
  cah.log.debug("done registering");
  $("#canvas").show();
  // TODO once there are channels, this needs to specify the global channel
  cah.Ajax.build(cah.$.AjaxOperation.NAMES).run();
  cah.GameList.instance.show();
  cah.GameList.instance.update();
  cah.longpoll.longPoll();
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.CHAT] = function(data) {
  // pass
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.LOG_OUT] = function(data) {
  window.location.reload();
};

cah.ajax.ErrorHandlers[cah.$.AjaxOperation.LOG_OUT] = cah.ajax.SuccessHandlers.logout;

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.NAMES] = function(data) {
  cah.log.status("Currently connected: " + data.names.join(", "));
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.GAME_LIST] = function(data) {
  cah.GameList.instance.processUpdate(data);
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.JOIN_GAME] = function(data, req) {
  cah.Game.joinGame(req[cah.$.AjaxRequest.GAME_ID]);
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.CREATE_GAME] = function(data) {
  cah.Game.joinGame(data[cah.$.AjaxResponse.GAME_ID]);
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.GET_GAME_INFO] = function(data, req) {
  var game = cah.currentGames[req[cah.$.AjaxRequest.GAME_ID]];
  if (game) {
    game.updateGameStatus(data);
  }
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.LEAVE_GAME] = function(data, req) {
  var game = cah.currentGames[req[cah.$.AjaxRequest.GAME_ID]];
  if (game) {
    game.dispose();
    delete cah.currentGames[req[cah.$.AjaxRequest.GAME_ID]];
  }
  cah.GameList.instance.update();
  cah.GameList.instance.show();
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.START_GAME] = function(data, req) {
  var game = cah.currentGames[data[cah.$.AjaxRequest.GAME_ID]];
  if (game) {
    game.startGameComplete();
  }
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.GET_CARDS] = function(data, req) {
  var gameId = req[cah.$.AjaxRequest.GAME_ID];
  var game = cah.currentGames[gameId];
  if (game) {
    game.dealtCards(data[cah.$.AjaxResponse.HAND]);
    if (data[cah.$.AjaxResponse.BLACK_CARD]) {
      game.setBlackCard(data[cah.$.AjaxResponse.BLACK_CARD]);
    }
    if (data[cah.$.AjaxResponse.WHITE_CARDS]) {
      game.setRoundWhiteCards(data[cah.$.AjaxResponse.WHITE_CARDS]);
    }
  } else {
    cah.log.error("Received hand for unknown game id " + gameId);
  }
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.PLAY_CARD] = function(data, req) {
  var gameId = req[cah.$.AjaxRequest.GAME_ID];
  var game = cah.currentGames[gameId];
  if (game) {
    game.playCardComplete();
  }
};

cah.ajax.SuccessHandlers[cah.$.AjaxOperation.JUDGE_SELECT] = function(data) {
  // pass?
};
