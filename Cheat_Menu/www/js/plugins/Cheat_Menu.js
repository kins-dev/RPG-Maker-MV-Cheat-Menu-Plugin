

/////////////////////////////////////////////////
// Cheat Menu Plugin Class
/////////////////////////////////////////////////
// Check if already defined (allows game specific extensions to be loaded in any order)
var Imported = Imported || {}; // jshint ignore:line
Imported.CheatMenu = "2.0";
var CheatMenu = CheatMenu || {}; // jshint ignore:line

(function ($) {
	"use strict"; 
	$.initialized = false;
	$.cheat_menu_open = false;
	$.overlay_openable = false;
	$.position = 1;
	$.menu_update_timer = null;

	$.cheat_selected = 0;
	$.cheat_selected_actor = 1;
	$.amounts = [1, 10, 100, 1000, 10000, 100000, 1000000];
	$.amount_index = 0;
	$.stat_selection = 0;
	$.item_selection = 1;
	$.weapon_selection = 1;
	$.armor_selection = 1;
	$.move_amounts = [0.5, 1, 1.5, 2];
	$.move_amount_index = 1;

	$.variable_selection = 1;
	$.switch_selection = 1;

	$.saved_positions = [{ m: -1, x: -1, y: -1 }, { m: -1, x: -1, y: -1 }, { m: -1, x: -1, y: -1 }];

	$.teleport_location = { m: 1, x: 0, y: 0 };

	$.speed = null;
	$.speed_unlocked = true;
	$.speed_initialized = false;


	/////////////////////////////////////////////////
	// Initial values for reseting on new game/load
	/////////////////////////////////////////////////

	// Check if already defined (allows game specific extensions to be loaded in any order)
	$.initial_values = $.initial_values || {};


	// All values below are the initial values for a new saved game
	//	upon loading a saved game these values will be loaded from the
	//	save game if possible overwriting the below values
	//	Because of this all of these variables should be non recursive
	$.initial_values.position = 1;
	$.initial_values.cheat_selected = 0;
	$.initial_values.cheat_selected_actor = 1;
	$.initial_values.amount_index = 0;
	$.initial_values.stat_selection = 0;
	$.initial_values.item_selection = 1;
	$.initial_values.weapon_selection = 1;
	$.initial_values.armor_selection = 1;
	$.initial_values.move_amount_index = 1;
	$.initial_values.variable_selection = 1;
	$.initial_values.switch_selection = 1;
	$.initial_values.saved_positions = [{ m: -1, x: -1, y: -1 }, { m: -1, x: -1, y: -1 }, { m: -1, x: -1, y: -1 }];
	$.initial_values.teleport_location = { m: 1, x: 0, y: 0 };
	$.initial_values.speed = null;
	$.initial_values.speed_unlocked = true;

	/////////////////////////////////////////////////
	// Cheat Functions
	/////////////////////////////////////////////////

	// enable god mode for an actor
	$.god_mode = function (actor) {
		if (actor instanceof Game_Actor && !(actor.god_mode)) {
			actor.god_mode = true;

			actor.gainHP_backup = actor.gainHp;
			actor.gainHp = function (value) {
				value = this.mhp;
				this.gainHP_backup(value);
			};

			actor.setHp_backup = actor.setHp;
			actor.setHp = function (hp) {
				hp = this.mhp;
				this.setHp_backup(hp);
			};

			actor.gainMp_backup = actor.gainMp;
			actor.gainMp = function (value) {
				value = this.mmp;
				this.gainMp_backup(value);
			};

			actor.setMp_backup = actor.setMp;
			actor.setMp = function (mp) {
				mp = this.mmp;
				this.setMp_backup(mp);
			};

			actor.gainTp_backup = actor.gainTp;
			actor.gainTp = function (value) {
				value = this.maxTp();
				this.gainTp_backup(value);
			};

			actor.setTp_backup = actor.setTp;
			actor.setTp = function (tp) {
				tp = this.maxTp();
				this.setTp_backup(tp);
			};

			actor.paySkillCost_backup = actor.paySkillCost;
			actor.paySkillCost = function (skill) {
				// do nothing
			};

			actor.god_mode_interval = setInterval(function () {
				actor.gainHp(actor.mhp);
				actor.gainMp(actor.mmp);
				actor.gainTp(actor.maxTp());
			}, 100);
		}
	};


	// disable god mode for an actor
	$.god_mode_off = function (actor) {
		if (actor instanceof Game_Actor && actor.god_mode) {
			actor.god_mode = false;

			actor.gainHp = actor.gainHP_backup;
			actor.setHp = actor.setHp_backup;
			actor.gainMp = actor.gainMp_backup;
			actor.setMp = actor.setMp_backup;
			actor.gainTp = actor.gainTp_backup;
			actor.setTp = actor.setTp_backup;
			actor.paySkillCost = actor.paySkillCost_backup;

			clearInterval(actor.god_mode_interval);
		}
	};

	// set all party hp
	$.set_party_hp = function (hp, alive) {
		const members = $gameParty.allMembers();
		for (let i = 0; i < members.length; i++) {
			if ((alive && members[i]._hp !== 0) || !alive) {
				members[i].setHp(hp);
			}
		}
	};

	// set all party mp
	$.set_party_mp = function (mp, alive) {
		const members = $gameParty.allMembers();
		for (let i = 0; i < members.length; i++) {
			if ((alive && members[i]._hp !== 0) || !alive) {
				members[i].setMp(mp);
			}
		}
	};

	// set all party tp
	$.set_party_tp = function (tp, alive) {
		const members = $gameParty.allMembers();
		for (let i = 0; i < members.length; i++) {
			if ((alive && members[i]._hp !== 0) || !alive) {
				members[i].setTp(tp);
			}
		}
	};

	// party full recover hp
	$.recover_party_hp = function (alive) {
		const members = $gameParty.allMembers();
		for (let i = 0; i < members.length; i++) {
			if ((alive && members[i]._hp !== 0) || !alive) {
				members[i].setHp(members[i].mhp);
			}
		}
	};

	// party full recover mp
	$.recover_party_mp = function (alive) {
		const members = $gameParty.allMembers();
		for (let i = 0; i < members.length; i++) {
			if ((alive && members[i]._hp !== 0) || !alive) {
				members[i].setMp(members[i].mmp);
			}
		}
	};

	// party max tp
	$.recover_party_tp = function (alive) {
		const members = $gameParty.allMembers();
		for (let i = 0; i < members.length; i++) {
			if ((alive && members[i]._hp !== 0) || !alive) {
				members[i].setTp(members[i].maxTp());
			}
		}
	};

	// set all enemies hp
	$.set_enemy_hp = function (hp, alive) {
		const members = $gameTroop.members();
		for (let i = 0; i < members.length; i++) {
			if (members[i]) {
				if ((alive && members[i]._hp !== 0) || !alive) {
					members[i].setHp(hp);
				}
			}
		}
	};

	// increase exp
	$.give_exp = function (actor, amount) {
		if (actor instanceof Game_Actor) {
			actor.gainExp(amount);
		}
	};

	// increase stat bonus
	$.give_stat = function (actor, stat_index, amount) {
		if (actor instanceof Game_Actor) {
			if (actor._paramPlus[stat_index]) {
				actor.addParam(stat_index, amount);
			}
		}
	};

	// increase gold
	$.give_gold = function (amount) {
		$gameParty.gainGold(amount);
	};

	// increase item count for party of item, by id
	$.give_item = function (item_id, amount) {
		if ($dataItems[item_id]) {
			$gameParty.gainItem($dataItems[item_id], amount);
		}
	};

	// increase weapon count for party of item, by id
	$.give_weapon = function (weapon_id, amount) {
		if ($dataWeapons[weapon_id]) {
			$gameParty.gainItem($dataWeapons[weapon_id], amount);
		}
	};

	// increase armor count for party of item, by id
	$.give_armor = function (armor_id, amount) {
		if ($dataArmors[armor_id]) {
			$gameParty.gainItem($dataArmors[armor_id], amount);
		}
	};

	// initialize speed hook for locking
	$.initialize_speed_lock = function () {
		if (!$.speed_initialized) {
			$.speed = $gamePlayer._moveSpeed;
			Object.defineProperty($gamePlayer, "_moveSpeed", {
				get: function () { return $.speed; },
				set: function (newVal) { if ($.speed_unlocked) { $.speed = newVal; } }
			});
			$.speed_initialized = true;
		}
	};

	// change player movement speed
	$.change_player_speed = function (amount) {
		$.initialize_speed_lock();
		$.speed += amount;
	};

	// toggle locking of player speed
	$.toggle_lock_player_speed = function (amount) {
		$.initialize_speed_lock();
		$.speed_unlocked = !$.speed_unlocked;
	};


	// clear active states on an actor
	$.clear_actor_states = function (actor) {
		if (actor instanceof Game_Actor) {
			if (actor._states !== undefined && actor._states.length > 0) {
				actor.clearStates();
			}
		}
	};

	// clear active states on party
	$.clear_party_states = function () {
		const members = $gameParty.allMembers();
		for (let i = 0; i < members.length; i++) {
			$.clear_actor_states(members[i]);
		}
	};

	// change game variable value, by id
	$.set_variable = function (variable_id, value) {
		if ($dataSystem.variables[variable_id]) {
			const new_value = $gameVariables.value(variable_id) + value;
			$gameVariables.setValue(variable_id, new_value);
		}
	};

	// toggle game switch value, by id
	$.toggle_switch = function (switch_id) {
		if ($dataSystem.switches[switch_id]) {
			$gameSwitches.setValue(switch_id, !$gameSwitches.value(switch_id));
		}
	};

	// Change location by map id, and x, y position
	$.teleport = function (map_id, x_pos, y_pos) {
		$gamePlayer.reserveTransfer(map_id, x_pos, y_pos, $gamePlayer.direction(), 0);
		$gamePlayer.setPosition(x_pos, y_pos);
	};

	/////////////////////////////////////////////////
	// Cheat Menu overlay
	/////////////////////////////////////////////////

	// HTML elements and some CSS for positioning
	//	other css in in CSS file attached
	$.overlay_box = document.createElement('div');
	$.overlay_box.id = "cheat_menu";
	$.overlay_box.style.left = "5px";
	$.overlay_box.style.top = "5px";
	$.overlay_box.style.right = "";
	$.overlay_box.style.bottom = "";

	$.overlay = document.createElement('table');
	$.overlay.id = "cheat_menu_text";
	$.overlay.style.left = "5px";
	$.overlay.style.top = "5px";
	$.overlay.style.right = "";
	$.overlay.style.bottom = "";


	// Attach other css for styling
	$.style_css = document.createElement("link");
	$.style_css.type = "text/css";
	$.style_css.rel = "stylesheet";
	$.style_css.href = "js/plugins/Cheat_Menu.css";
	document.head.appendChild($.style_css);


	// keep menu in correct location
	$.position_menu = function (event) {
		//middle of screen
		if ($.position === 0) {
			$.overlay_box.style.left = "" + (window.innerWidth / 2) + "px";
			$.overlay_box.style.top = "" + (window.innerHeight / 2) + "px";
			$.overlay_box.style.right = "";
			$.overlay_box.style.bottom = "";

			$.overlay_box.style.marginLeft = "-110px";
			$.overlay_box.style.marginTop = "-50px";

			$.overlay.style.left = "" + (window.innerWidth / 2) + "px";
			$.overlay.style.top = "" + (window.innerHeight / 2) + "px";
			$.overlay.style.right = "";
			$.overlay.style.bottom = "";

			$.overlay.style.marginLeft = "-110px";
			$.overlay.style.marginTop = "-50px";
		}
		// top left corner
		else if ($.position === 1) {
			$.overlay_box.style.left = "5px";
			$.overlay_box.style.top = "5px";
			$.overlay_box.style.right = "";
			$.overlay_box.style.bottom = "";

			$.overlay_box.style.marginLeft = "";
			$.overlay_box.style.marginTop = "";

			$.overlay.style.left = "5px";
			$.overlay.style.top = "5px";
			$.overlay.style.right = "";
			$.overlay.style.bottom = "";

			$.overlay.style.marginLeft = "";
			$.overlay.style.marginTop = "";
		}
		// top right corner
		else if ($.position === 2) {
			$.overlay_box.style.left = "";
			$.overlay_box.style.top = "5px";
			$.overlay_box.style.right = "5px";
			$.overlay_box.style.bottom = "";

			$.overlay_box.style.marginLeft = "";
			$.overlay_box.style.marginTop = "";

			$.overlay.style.left = "";
			$.overlay.style.top = "5px";
			$.overlay.style.right = "-15px";
			$.overlay.style.bottom = "";

			$.overlay.style.marginLeft = "";
			$.overlay.style.marginTop = "";
		}
		// bottom right corner
		else if ($.position === 3) {
			$.overlay_box.style.left = "";
			$.overlay_box.style.top = "";
			$.overlay_box.style.right = "5px";
			$.overlay_box.style.bottom = "5px";

			$.overlay_box.style.marginLeft = "";
			$.overlay_box.style.marginTop = "";

			$.overlay.style.left = "";
			$.overlay.style.top = "";
			$.overlay.style.right = "-15px";
			$.overlay.style.bottom = "5px";

			$.overlay.style.marginLeft = "";
			$.overlay.style.marginTop = "";
		}
		// bottom left corner
		else if ($.position === 4) {
			$.overlay_box.style.left = "5px";
			$.overlay_box.style.top = "";
			$.overlay_box.style.right = "";
			$.overlay_box.style.bottom = "5px";

			$.overlay_box.style.marginLeft = "";
			$.overlay_box.style.marginTop = "";

			$.overlay.style.left = "5px";
			$.overlay.style.top = "";
			$.overlay.style.right = "";
			$.overlay.style.bottom = "5px";

			$.overlay.style.marginLeft = "";
			$.overlay.style.marginTop = "";
		}

		// adjust background box size to match contents
		let height = 20;
		for (let i = 0; i < $.overlay.children.length; i++) {
			height += $.overlay.children[i].scrollHeight;
		}
		$.overlay_box.style.height = "" + height + "px";
	};

	/////////////////////////////////////////////////
	// Menu item types
	/////////////////////////////////////////////////

	// insert row with buttons to scroll left and right for some context
	//	appears as:
	//	<-[key1] text [key2]->
	//	scrolling is handled by scroll_left_handler and scroll_right_handler functions
	//	text: string 
	//	key1,key2: key mapping
	//	scroll_handler: single function that handles the left and right scroll arguments should be (direction, event)
	$.append_scroll_selector = function (text, key1, key2, scroll_handler) {
		const scroll_selector = $.overlay.insertRow();
		scroll_selector.className = "scroll_selector_row";

		const scroll_left_button = scroll_selector.insertCell();
		scroll_left_button.className = "scroll_selector_buttons cheat_menu_cell";


		const scroll_text = scroll_selector.insertCell();
		scroll_text.className = "cheat_menu_cell";

		const scroll_right_button = scroll_selector.insertCell();
		scroll_right_button.className = "scroll_selector_buttons cheat_menu_cell";

		scroll_left_button.innerHTML = "←[" + key1 + "]";
		scroll_text.innerHTML = text;
		scroll_right_button.innerHTML = "[" + key2 + "]→";

		scroll_left_button.addEventListener('mousedown', scroll_handler.bind(null, "left"));
		scroll_right_button.addEventListener('mousedown', scroll_handler.bind(null, "right"));

		$.key_listeners[key1] = scroll_handler.bind(null, "left");
		$.key_listeners[key2] = scroll_handler.bind(null, "right");
	};

	// Insert a title row
	//	A row in the menu that is just text
	//	title: string
	$.append_title = function (title) {
		const title_row = $.overlay.insertRow();
		let temp = title_row.insertCell();
		temp.className = "cheat_menu_cell_title";
		const title_text = title_row.insertCell();
		title_text.className = "cheat_menu_cell_title";
		temp = title_row.insertCell();
		temp.className = "cheat_menu_cell_title";
		title_text.innerHTML = title;
	};

	// Insert a description row
	//	A row in the menu that is just text (smaller than title)
	//	text: string
	$.append_description = function (text) {
		const title_row = $.overlay.insertRow();
		let temp = title_row.insertCell();
		temp.className = "cheat_menu_cell";
		const title_text = title_row.insertCell();
		title_text.className = "cheat_menu_cell";
		temp = title_row.insertCell();
		temp.className = "cheat_menu_cell";
		title_text.innerHTML = text;
	};

	// Append a cheat with some handler to activate
	//	Appears as:
	//	cheat text	status text[key]
	//	cheat_text: string
	//	status_text: string 
	//	key: key mapping
	//	click_handler: function
	$.append_cheat = function (cheat_text, status_text, key, click_handler) {
		const cheat_row = $.overlay.insertRow();

		const cheat_title = cheat_row.insertCell();
		cheat_title.className = "cheat_menu_cell";
		const temp = cheat_row.insertCell();
		temp.className = "cheat_menu_cell";
		const cheat = cheat_row.insertCell();
		cheat.className = "cheat_menu_buttons cheat_menu_cell";

		cheat_title.innerHTML = cheat_text;
		cheat.innerHTML = status_text + "[" + key + "]";

		cheat.addEventListener('mousedown', click_handler);
		$.key_listeners[key] = click_handler;
	};

	/////////////////////////////////////////////////////////////
	// Various functions to settup each page of the cheat menu
	/////////////////////////////////////////////////////////////


	// Left and right scrollers for handling switching between menus
	$.scroll_cheat = function (direction, event) {
		if (direction === "left") {
			$.cheat_selected--;
			if ($.cheat_selected < 0) {
				$.cheat_selected = $.menus.length - 1;
			}
		}
		else {
			$.cheat_selected++;
			if ($.cheat_selected > $.menus.length - 1) {
				$.cheat_selected = 0;
			}
		}

		SoundManager.playSystemSound(0);
		$.update_menu();
	};

	// Menu title with scroll options to go between menu, should be first
	//	append on each menu
	$.append_cheat_title = function (cheat_name) {
		$.append_title("Cheat");
		$.append_scroll_selector(cheat_name, 2, 3, $.scroll_cheat);
	};

	// Left and right scrollers for handling switching selected actors
	$.scroll_actor = function (direction, event) {
		if (direction === "left") {
			$.cheat_selected_actor--;
			if ($.cheat_selected_actor < 0) {
				$.cheat_selected_actor = $gameActors._data.length - 1;
			}
		}
		else {
			$.cheat_selected_actor++;
			if ($.cheat_selected_actor >= $gameActors._data.length) {
				$.cheat_selected_actor = 0;
			}
		}

		SoundManager.playSystemSound(0);
		$.update_menu();
	};

	// Append actor selection to the menu
	$.append_actor_selection = function (key1, key2) {
		$.append_title("Actor");

		let actor_name = "";

		if ($gameActors._data[$.cheat_selected_actor] && $gameActors._data[$.cheat_selected_actor]._name) {
			actor_name = "<font color='#0088ff'>" + $gameActors._data[$.cheat_selected_actor]._name + "</font>";
		}
		else {
			actor_name = "<font color='#ff0000'>NULL</font>";
		}

		$.append_scroll_selector(actor_name, key1, key2, $.scroll_actor);
	};

	// Handler for the god_mode cheat
	$.god_mode_toggle = function (event) {
		if ($gameActors._data[$.cheat_selected_actor]) {
			if (!($gameActors._data[$.cheat_selected_actor].god_mode)) {
				$.god_mode($gameActors._data[$.cheat_selected_actor]);
				SoundManager.playSystemSound(1);
			}
			else {
				$.god_mode_off($gameActors._data[$.cheat_selected_actor]);
				SoundManager.playSystemSound(2);
			}
			$.update_menu();
		}
	};

	// Append the god_mode cheat to the menu
	$.append_godmode_status = function () {
		let status_text = "";
		if ($gameActors._data[$.cheat_selected_actor] && $gameActors._data[$.cheat_selected_actor].god_mode) {
			status_text = "<font color='#00ff00'>on</font>";
		}
		else {
			status_text = "<font color='#ff0000'>off</font>";
		}

		$.append_cheat("Status:", status_text, 6, $.god_mode_toggle);
	};

	// handler for the enemy hp to 0 cheat alive only
	$.enemy_hp_cheat_1 = function () {
		$.set_enemy_hp(0, true);
		SoundManager.playSystemSound(1);
	};

	// handler for the enemy hp to 1 cheat alive only
	$.enemy_hp_cheat_2 = function () {
		$.set_enemy_hp(1, true);
		SoundManager.playSystemSound(1);
	};

	// handler for the enemy hp to 0 cheat all
	$.enemy_hp_cheat_3 = function () {
		$.set_enemy_hp(0, false);
		SoundManager.playSystemSound(1);
	};

	// handler for the enemy hp to 1 cheat all
	$.enemy_hp_cheat_4 = function () {
		$.set_enemy_hp(1, false);
		SoundManager.playSystemSound(1);
	};

	// Append the enemy hp cheats to the menu
	$.append_enemy_cheats = function (key1, key2, key3, key4) {
		$.append_title("Alive");
		$.append_cheat("Enemy HP to 0", "Activate", key1, $.enemy_hp_cheat_1);
		$.append_cheat("Enemy HP to 1", "Activate", key2, $.enemy_hp_cheat_2);
		$.append_title("All");
		$.append_cheat("Enemy HP to 0", "Activate", key3, $.enemy_hp_cheat_3);
		$.append_cheat("Enemy HP to 1", "Activate", key4, $.enemy_hp_cheat_4);
	};

	// handler for the party hp cheat to 0 alive only
	$.party_hp_cheat_1 = function () {
		$.set_party_hp(0, true);
		SoundManager.playSystemSound(1);
	};

	// handler for the party hp cheat to 1 alive only
	$.party_hp_cheat_2 = function () {
		$.set_party_hp(1, true);
		SoundManager.playSystemSound(1);
	};

	// handler for the party hp cheat to full alive only
	$.party_hp_cheat_3 = function () {
		$.recover_party_hp(true);
		SoundManager.playSystemSound(1);
	};

	// handler for the party hp cheat to 0 all
	$.party_hp_cheat_4 = function () {
		$.set_party_hp(1, false);
		SoundManager.playSystemSound(1);
	};

	// handler for the party hp cheat to 1 all
	$.party_hp_cheat_5 = function () {
		$.set_party_hp(0, false);
		SoundManager.playSystemSound(1);
	};

	// handler for the party hp cheat full all
	$.party_hp_cheat_6 = function () {
		$.recover_party_hp(false);
		SoundManager.playSystemSound(1);
	};


	// append the party hp cheats
	$.append_hp_cheats = function (key1, key2, key3, key4, key5, key6) {
		$.append_title("Alive");
		$.append_cheat("Party HP to 0", "Activate", key1, $.party_hp_cheat_1);
		$.append_cheat("Party HP to 1", "Activate", key2, $.party_hp_cheat_2);
		$.append_cheat("Party Full HP", "Activate", key3, $.party_hp_cheat_3);
		$.append_title("All");
		$.append_cheat("Party HP to 0", "Activate", key4, $.party_hp_cheat_4);
		$.append_cheat("Party HP to 1", "Activate", key5, $.party_hp_cheat_5);
		$.append_cheat("Party Full HP", "Activate", key6, $.party_hp_cheat_6);
	};

	// handler for the party mp cheat to 0 alive only
	$.party_mp_cheat_1 = function () {
		$.set_party_mp(0, true);
		SoundManager.playSystemSound(1);
	};

	// handler for the party mp cheat to 1 alive only
	$.party_mp_cheat_2 = function () {
		$.set_party_mp(1, true);
		SoundManager.playSystemSound(1);
	};

	// handler for the party mp cheat to full alive only
	$.party_mp_cheat_3 = function () {
		$.recover_party_mp(true);
		SoundManager.playSystemSound(1);
	};

	// handler for the party mp cheat to 0 all
	$.party_mp_cheat_4 = function () {
		$.set_party_mp(1, false);
		SoundManager.playSystemSound(1);
	};

	// handler for the party mp cheat to 1 all
	$.party_mp_cheat_5 = function () {
		$.set_party_mp(0, false);
		SoundManager.playSystemSound(1);
	};

	// handler for the party mp cheat full all
	$.party_mp_cheat_6 = function () {
		$.recover_party_mp(false);
		SoundManager.playSystemSound(1);
	};


	// append the party mp cheats
	$.append_mp_cheats = function (key1, key2, key3, key4, key5, key6) {
		$.append_title("Alive");
		$.append_cheat("Party MP to 0", "Activate", key1, $.party_mp_cheat_1);
		$.append_cheat("Party MP to 1", "Activate", key2, $.party_mp_cheat_2);
		$.append_cheat("Party Full MP", "Activate", key3, $.party_mp_cheat_3);
		$.append_title("All");
		$.append_cheat("Party MP to 0", "Activate", key4, $.party_mp_cheat_4);
		$.append_cheat("Party MP to 1", "Activate", key5, $.party_mp_cheat_5);
		$.append_cheat("Party Full MP", "Activate", key6, $.party_mp_cheat_6);
	};

	// handler for the party tp cheat to 0 alive only
	$.party_tp_cheat_1 = function () {
		$.set_party_tp(0, true);
		SoundManager.playSystemSound(1);
	};

	// handler for the party tp cheat to 1 alive only
	$.party_tp_cheat_2 = function () {
		$.set_party_tp(1, true);
		SoundManager.playSystemSound(1);
	};

	// handler for the party tp cheat to full alive only
	$.party_tp_cheat_3 = function () {
		$.recover_party_tp(true);
		SoundManager.playSystemSound(1);
	};

	// handler for the party tp cheat to 0 all
	$.party_tp_cheat_4 = function () {
		$.set_party_tp(1, false);
		SoundManager.playSystemSound(1);
	};

	// handler for the party tp cheat to 1 all
	$.party_tp_cheat_5 = function () {
		$.set_party_tp(0, false);
		SoundManager.playSystemSound(1);
	};

	// handler for the party tp cheat full all
	$.party_tp_cheat_6 = function () {
		$.recover_party_tp(false);
		SoundManager.playSystemSound(1);
	};


	// append the party tp cheats
	$.append_tp_cheats = function (key1, key2, key3, key4, key5, key6) {
		$.append_title("Alive");
		$.append_cheat("Party TP to 0", "Activate", key1, $.party_tp_cheat_1);
		$.append_cheat("Party TP to 1", "Activate", key2, $.party_tp_cheat_2);
		$.append_cheat("Party Full TP", "Activate", key3, $.party_tp_cheat_3);
		$.append_title("All");
		$.append_cheat("Party TP to 0", "Activate", key4, $.party_tp_cheat_4);
		$.append_cheat("Party TP to 1", "Activate", key5, $.party_tp_cheat_5);
		$.append_cheat("Party Full TP", "Activate", key6, $.party_tp_cheat_6);
	};

	// handler for the toggle no clip cheat
	$.toggle_no_clip_status = function (event) {
		$gamePlayer._through = !($gamePlayer._through);
		$.update_menu();
		if ($gamePlayer._through) {
			SoundManager.playSystemSound(1);
		}
		else {
			SoundManager.playSystemSound(2);
		}
	};

	// append the no clip cheat
	$.append_no_clip_status = function (key1) {
		let status_text;
		if ($gamePlayer._through) {
			status_text = "<font color='#00ff00'>on</font>";
		}
		else {
			status_text = "<font color='#ff0000'>off</font>";
		}

		$.append_cheat("Status:", status_text, key1, $.toggle_no_clip_status);
	};

	// Left and right scrollers for handling switching amount to modify numerical cheats
	$.scroll_amount = function (direction, event) {
		if (direction === "left") {
			$.amount_index--;
			if ($.amount_index < 0) {
				$.amount_index = 0;
			}
			SoundManager.playSystemSound(2);
		}
		else {
			$.amount_index++;
			if ($.amount_index >= $.amounts.length) {
				$.amount_index = $.amounts.length - 1;
			}
			SoundManager.playSystemSound(1);
		}

		$.update_menu();
	};

	// append the amount selection to the menu
	$.append_amount_selection = function (key1, key2) {
		$.append_title("Amount");

		const current_amount = "<font color='#0088ff'>" + $.amounts[$.amount_index] + "</font>";
		$.append_scroll_selector(current_amount, key1, key2, $.scroll_amount);
	};

	// Left and right scrollers for handling switching amount to modify for the movement cheat
	$.scroll_move_amount = function (direction, event) {
		if (direction === "left") {
			$.move_amount_index--;
			if ($.move_amount_index < 0) {
				$.move_amount_index = 0;
			}
			SoundManager.playSystemSound(2);
		}
		else {
			$.move_amount_index++;
			if ($.move_amount_index >= $.move_amounts.length) {
				$.move_amount_index = $.move_amounts.length - 1;
			}
			SoundManager.playSystemSound(1);
		}

		$.update_menu();
	};

	// append the movement speed amount to the menu
	$.append_move_amount_selection = function (key1, key2) {
		$.append_title("Amount");

		const current_amount = "<font color='#0088ff'>" + $.move_amounts[$.move_amount_index] + "</font>";
		$.append_scroll_selector(current_amount, key1, key2, $.scroll_move_amount);
	};

	// handlers for the exp cheat
	$.apply_current_exp = function (direction, event) {
		let amount = $.amounts[$.amount_index];
		if (direction === "left") {
			amount = -amount;
			SoundManager.playSystemSound(2);
		}
		else {
			SoundManager.playSystemSound(1);
		}
		$.give_exp($gameActors._data[$.cheat_selected_actor], amount);
		$.update_menu();
	};

	// append the exp cheat to the menu
	$.append_exp_cheat = function (key1, key2) {
		let current_exp = "NULL";
		if ($gameActors._data[$.cheat_selected_actor]) {
			current_exp = $gameActors._data[$.cheat_selected_actor].currentExp();
		}
		$.append_title("EXP");
		$.append_scroll_selector(current_exp, key1, key2, $.apply_current_exp);
	};

	// Left and right scrollers for handling switching between stats for the selected character
	$.scroll_stat = function (direction, event) {
		if ($gameActors._data[$.cheat_selected_actor] && $gameActors._data[$.cheat_selected_actor]._paramPlus) {
			if (direction === "left") {
				$.stat_selection--;
				if ($.stat_selection < 0) {
					$.stat_selection = $gameActors._data[$.cheat_selected_actor]._paramPlus.length - 1;
				}
			}
			else {
				$.stat_selection++;
				if ($.stat_selection >= $gameActors._data[$.cheat_selected_actor]._paramPlus.length) {
					$.stat_selection = 0;
				}
			}
		}
		else {
			$.stat_selection = 0;
		}
		SoundManager.playSystemSound(0);
		$.update_menu();
	};

	// handlers for the stat cheat
	$.apply_current_stat = function (direction, event) {
		let amount = $.amounts[$.amount_index];
		if (direction === "left") {
			amount = -amount;
			SoundManager.playSystemSound(2);
		}
		else {
			SoundManager.playSystemSound(1);
		}
		$.give_stat($gameActors._data[$.cheat_selected_actor], $.stat_selection, amount);
		$.update_menu();
	};


	// append the stat selection to the menu
	$.append_stat_selection = function (key1, key2, key3, key4) {
		$.append_title("Stat");

		let stat_string = "";

		if ($gameActors._data[$.cheat_selected_actor] && $gameActors._data[$.cheat_selected_actor]._paramPlus) {
			if ($.stat_selection >= $gameActors._data[$.cheat_selected_actor]._paramPlus.length) {
				$.stat_selection = 0;
			}
			stat_string += $dataSystem.terms.params[$.stat_selection];
		}

		$.append_scroll_selector(stat_string, key1, key2, $.scroll_stat);
		let current_value = "NULL";
		if ($gameActors._data[$.cheat_selected_actor] && $gameActors._data[$.cheat_selected_actor]._paramPlus) {
			current_value = $gameActors._data[$.cheat_selected_actor]._paramPlus[$.stat_selection];
		}
		$.append_scroll_selector(current_value, key3, key4, $.apply_current_stat);
	};

	// handlers for the gold cheat
	$.apply_current_gold = function (direction, event) {
		let amount = $.amounts[$.amount_index];
		if (direction === "left") {
			amount = -amount;
			SoundManager.playSystemSound(2);
		}
		else {
			SoundManager.playSystemSound(1);
		}
		$.give_gold(amount);
		$.update_menu();
	};

	// append the gold cheat to the menu
	$.append_gold_status = function (key1, key2) {
		$.append_title("Gold");
		$.append_scroll_selector($gameParty._gold, key1, key2, $.apply_current_gold);
	};

	// handler for the movement speed cheat
	$.apply_speed_change = function (direction, event) {
		let amount = $.move_amounts[$.move_amount_index];
		if (direction === "left") {
			amount = -amount;
			SoundManager.playSystemSound(2);
		}
		else {
			SoundManager.playSystemSound(1);
		}
		$.change_player_speed(amount);
		$.update_menu();
	};

	$.apply_speed_lock_toggle = function () {
		$.toggle_lock_player_speed();
		if ($.speed_unlocked) {
			SoundManager.playSystemSound(2);
		}
		else {
			SoundManager.playSystemSound(1);
		}
		$.update_menu();
	};

	// append the movement speed to the menu
	$.append_speed_status = function (key1, key2, key3) {
		$.append_title("Current Speed");
		$.append_scroll_selector($gamePlayer._moveSpeed, key1, key2, $.apply_speed_change);
		let status_text = "";
		if (!$.speed_unlocked) {
			status_text = "<font color='#00ff00'>false</font>";
		}
		else {
			status_text = "<font color='#ff0000'>true</font>";
		}
		$.append_cheat("Speed Unlocked", status_text, key3, $.apply_speed_lock_toggle);
	};

	// Left and right scrollers for handling switching between items selected
	$.scroll_item = function (direction, event) {
		if (direction === "left") {
			$.item_selection--;
			if ($.item_selection < 0) {
				$.item_selection = $dataItems.length - 1;
			}
		}
		else {
			$.item_selection++;
			if ($.item_selection >= $dataItems.length) {
				$.item_selection = 0;
			}
		}
		SoundManager.playSystemSound(0);
		$.update_menu();
	};

	// handlers for the item cheat
	$.apply_current_item = function (direction, event) {
		let amount = $.amounts[$.amount_index];
		if (direction === "left") {
			amount = -amount;
			SoundManager.playSystemSound(2);
		}
		else {
			SoundManager.playSystemSound(1);
		}
		$.give_item($.item_selection, amount);
		$.update_menu();
	};

	// append the item cheat to the menu
	$.append_item_selection = function (key1, key2, key3, key4) {
		$.append_title("Item");
		let current_item = "";
		if ($dataItems[$.item_selection] && $dataItems[$.item_selection].name && $dataItems[$.item_selection].name.length > 0) {
			current_item = $dataItems[$.item_selection].name;
		}
		else {
			current_item = "NULL";
		}

		$.append_scroll_selector(current_item, key1, key2, $.scroll_item);
		let current_item_amount = 0;
		if ($gameParty._items[$.item_selection]) {
			current_item_amount = $gameParty._items[$.item_selection];
		}
		$.append_scroll_selector(current_item_amount, key3, key4, $.apply_current_item);
	};

	// Left and right scrollers for handling switching between weapon selected
	$.scroll_weapon = function (direction, event) {
		if (direction === "left") {
			$.weapon_selection--;
			if ($.weapon_selection < 0) {
				$.weapon_selection = $dataWeapons.length - 1;
			}
		}
		else {
			$.weapon_selection++;
			if ($.weapon_selection >= $dataWeapons.length) {
				$.weapon_selection = 0;
			}
		}
		SoundManager.playSystemSound(0);

		$.update_menu();
	};

	// handlers for the weapon cheat
	$.apply_current_weapon = function (direction, event) {
		let amount = $.amounts[$.amount_index];
		if (direction === "left") {
			amount = -amount;
			SoundManager.playSystemSound(2);
		}
		else {
			SoundManager.playSystemSound(1);
		}
		$.give_weapon($.weapon_selection, amount);
		$.update_menu();
	};

	// append the weapon cheat to the menu
	$.append_weapon_selection = function (key1, key2, key3, key4) {
		$.append_title("Weapon");
		let current_weapon = "";
		if ($dataWeapons[$.weapon_selection] && $dataWeapons[$.weapon_selection].name && $dataWeapons[$.weapon_selection].name.length > 0) {
			current_weapon = $dataWeapons[$.weapon_selection].name;
		}
		else {
			current_weapon = "NULL";
		}

		$.append_scroll_selector(current_weapon, key1, key2, $.scroll_weapon);
		let current_weapon_amount = 0;
		if ($gameParty._weapons[$.weapon_selection]) {
			current_weapon_amount = $gameParty._weapons[$.weapon_selection];
		}
		$.append_scroll_selector(current_weapon_amount, key3, key4, $.apply_current_weapon);
	};

	// Left and right scrollers for handling switching between armor selected
	$.scroll_armor = function (direction, event) {
		if (direction === "left") {
			$.armor_selection--;
			if ($.armor_selection < 0) {
				$.armor_selection = $dataArmors.length - 1;
			}
		}
		else {
			$.armor_selection++;
			if ($.armor_selection >= $dataArmors.length) {
				$.armor_selection = 0;
			}
		}
		SoundManager.playSystemSound(0);

		$.update_menu();
	};

	// handler for the armor cheat
	$.apply_current_armor = function (direction, event) {
		let amount = $.amounts[$.amount_index];
		if (direction === "left") {
			amount = -amount;
			SoundManager.playSystemSound(2);
		}
		else {
			SoundManager.playSystemSound(1);
		}
		$.give_armor($.armor_selection, amount);
		$.update_menu();
	};

	// append the armor cheat to the menu
	$.append_armor_selection = function (key1, key2, key3, key4) {
		$.append_title("Armor");
		let current_armor = "";
		if ($dataArmors[$.armor_selection] && $dataArmors[$.armor_selection].name && $dataArmors[$.armor_selection].name.length > 0) {
			current_armor = $dataArmors[$.armor_selection].name;
		}
		else {
			current_armor = "NULL";
		}

		$.append_scroll_selector(current_armor, key1, key2, $.scroll_armor);
		let current_armor_amount = 0;
		if ($gameParty._armors[$.armor_selection]) {
			current_armor_amount = $gameParty._armors[$.armor_selection];
		}
		$.append_scroll_selector(current_armor_amount, key3, key4, $.apply_current_armor);
	};

	// handler for the clear actor state cheat
	$.clear_current_actor_states = function () {
		$.clear_actor_states($gameActors._data[$.cheat_selected_actor]);
		SoundManager.playSystemSound(1);
		$.update_menu();
	};

	// handler for the party state clear cheat
	$.party_clear_states_cheat = function () {
		$.clear_party_states();
		SoundManager.playSystemSound(1);
	};

	// append the party hp cheats
	$.append_party_state = function (key1) {
		$.append_cheat("Clear Party States", "Activate", key1, $.party_clear_states_cheat);
	};

	// append the clear actor state cheat to the menu
	$.append_current_state = function (key1) {
		$.append_title("Current State");
		let number_states = 0;

		if ($gameActors._data[$.cheat_selected_actor] && $gameActors._data[$.cheat_selected_actor]._states && $gameActors._data[$.cheat_selected_actor]._states.length >= 0) {
			number_states = $gameActors._data[$.cheat_selected_actor]._states.length;
		}
		else {
			number_states = null;
		}

		$.append_cheat("Number Effects:", number_states, key1, $.clear_current_actor_states);
	};

	// Left and right scrollers for handling switching between selected variable
	$.scroll_variable = function (direction, event) {
		if (direction === "left") {
			$.variable_selection--;
			if ($.variable_selection < 0) {
				$.variable_selection = $dataSystem.variables.length - 1;
			}
		}
		else {
			$.variable_selection++;
			if ($.variable_selection >= $dataSystem.variables.length) {
				$.variable_selection = 0;
			}
		}
		SoundManager.playSystemSound(0);
		$.update_menu();
	};

	// handlers for the setting the current variable
	$.apply_current_variable = function (direction, event) {
		let amount = $.amounts[$.amount_index];
		if (direction === "left") {
			amount = -amount;
			SoundManager.playSystemSound(2);
		}
		else {
			SoundManager.playSystemSound(1);
		}
		$.set_variable($.variable_selection, amount);
		$.update_menu();
	};

	// append the variable cheat to the menu
	$.append_variable_selection = function (key1, key2, key3, key4) {
		$.append_title("Variable");
		let current_variable = "";
		if ($dataSystem.variables[$.variable_selection] && $dataSystem.variables[$.variable_selection].length > 0) {
			current_variable = $dataSystem.variables[$.variable_selection];
		}
		else {
			current_variable = "NULL";
		}

		$.append_scroll_selector(current_variable, key1, key2, $.scroll_variable);
		let current_variable_value = 'NULL';
		if ($gameVariables.value($.variable_selection)) {
			current_variable_value = $gameVariables.value($.variable_selection);
		}
		$.append_scroll_selector(current_variable_value, key3, key4, $.apply_current_variable);
	};

	// Left and right scrollers for handling switching between selected switch
	$.scroll_switch = function (direction, event) {
		if (direction === "left") {
			$.switch_selection--;
			if ($.switch_selection < 0) {
				$.switch_selection = $dataSystem.switches.length - 1;
			}
		}
		else {
			$.switch_selection++;
			if ($.switch_selection >= $dataSystem.switches.length) {
				$.switch_selection = 0;
			}
		}
		SoundManager.playSystemSound(0);
		$.update_menu();
	};

	// handler for the toggling the current switch
	$.toggle_current_switch = function (event) {
		$.toggle_switch($.switch_selection);
		if ($gameSwitches.value($.switch_selection)) {
			SoundManager.playSystemSound(1);
		}
		else {
			SoundManager.playSystemSound(2);
		}
		$.update_menu();
	};

	// append the switch cheat to the menu
	$.append_switch_selection = function (key1, key2, key3) {
		$.append_title("Switch");
		let current_switch = "";
		if ($dataSystem.switches[$.switch_selection] && $dataSystem.switches[$.switch_selection].length > 0) {
			current_switch = $dataSystem.switches[$.switch_selection];
		}
		else {
			current_switch = "NULL";
		}

		$.append_scroll_selector(current_switch, key1, key2, $.scroll_switch);
		let current_switch_value = 'NULL';
		if ($gameSwitches.value($.switch_selection)) {
			current_switch_value = $gameSwitches.value($.switch_selection);
		}
		$.append_cheat("Status:", current_switch_value, key3, $.toggle_current_switch);
	};

	// handler for saving positions
	$.save_position = function (pos_num, event) {
		$.saved_positions[pos_num].m = $gameMap.mapId();
		$.saved_positions[pos_num].x = $gamePlayer.x;
		$.saved_positions[pos_num].y = $gamePlayer.y;

		SoundManager.playSystemSound(1);
		$.update_menu();
	};

	// handler for loading/recalling positions
	$.recall_position = function (pos_num, event) {
		if ($.saved_positions[pos_num].m !== -1) {
			$.teleport($.saved_positions[pos_num].m, $.saved_positions[pos_num].x, $.saved_positions[pos_num].y);
			SoundManager.playSystemSound(1);
		}
		else {
			SoundManager.playSystemSound(2);
		}
		$.update_menu();
	};

	// append the save/recall cheat to the menu
	$.append_save_recall = function (key1, key2, key3, key4, key5, key6) {

		$.append_title("Current Position: ");

		if ($dataMapInfos[$gameMap.mapId()] && $dataMapInfos[$gameMap.mapId()].name) {
			let current_map = "" + $gameMap.mapId() + ": " + $dataMapInfos[$gameMap.mapId()].name;
			$.append_description(current_map);

			let map_pos = "(" + $gamePlayer.x + ", " + $gamePlayer.y + ")";
			$.append_description(map_pos);
		}
		else {
			$.append_description("NULL");
		}

		let cur_key = 1;
		for (let i = 0; i < $.saved_positions.length; i++) {
			$.append_title("Position " + (i + 1));

			let map_text="";
			let pos_text="";
			if ($.saved_positions[i].m !== -1) {
				map_text = "" + $.saved_positions[i].m + ": ";
				if ($dataMapInfos[$.saved_positions[i].m].name) {
					map_text += $dataMapInfos[$.saved_positions[i].m].name;
				}
				else {
					map_text += "NULL";
				}
				pos_text = "(" + $.saved_positions[i].x + ", " + $.saved_positions[i].y + ")";
			}
			else {
				map_text = "NULL";
				pos_text = "NULL";
			}

			$.append_cheat("Save:", map_text, eval("key" + cur_key), $.save_position.bind(null, i));
			cur_key++;

			$.append_cheat("Recall:", pos_text, eval("key" + cur_key), $.recall_position.bind(null, i));
			cur_key++;
		}
	};

	// Left and right scrollers for handling switching between target teleport map
	$.scroll_map_teleport_selection = function (direction, event) {
		if (direction === "left") {
			$.teleport_location.m--;
			if ($.teleport_location.m < 1) {
				$.teleport_location.m = $dataMapInfos.length - 1;
			}
		}
		else {
			$.teleport_location.m++;
			if ($.teleport_location.m >= $dataMapInfos.length) {
				$.teleport_location.m = 1;
			}
		}

		SoundManager.playSystemSound(0);
		$.update_menu();
	};

	// Left and right scrollers for handling switching between target teleport x coordinate
	$.scroll_x_teleport_selection = function (direction, event) {
		if (direction === "left") {
			$.teleport_location.x--;
			if ($.teleport_location.x < 0) {
				$.teleport_location.x = 255;
			}
		}
		else {
			$.teleport_location.x++;
			if ($.teleport_location.x > 255) {
				$.teleport_location.x = 0;
			}
		}

		SoundManager.playSystemSound(0);
		$.update_menu();
	};

	// Left and right scrollers for handling switching between target teleport y coordinate
	$.scroll_y_teleport_selection = function (direction, event) {
		if (direction === "left") {
			$.teleport_location.y--;
			if ($.teleport_location.y < 0) {
				$.teleport_location.y = 255;
			}
		}
		else {
			$.teleport_location.y++;
			if ($.teleport_location.y > 255) {
				$.teleport_location.y = 0;
			}
		}

		SoundManager.playSystemSound(0);
		$.update_menu();
	};

	// handler for teleporting to targed map and location
	$.teleport_current_location = function (event) {
		$.teleport($.teleport_location.m, $.teleport_location.x, $.teleport_location.y);
		SoundManager.playSystemSound(1);
		$.update_menu();
	};

	// append the teleport cheat to the menu
	$.append_teleport = function (key1, key2, key3, key4, key5, key6, key7) {
		let current_map = "" + $.teleport_location.m + ": ";

		if ($dataMapInfos[$.teleport_location.m] && $dataMapInfos[$.teleport_location.m].name) {
			current_map += $dataMapInfos[$.teleport_location.m].name;
		}
		else {
			current_map += "NULL";
		}

		$.append_scroll_selector(current_map, key1, key2, $.scroll_map_teleport_selection);

		$.append_scroll_selector("X: " + $.teleport_location.x, key3, key4, $.scroll_x_teleport_selection);

		$.append_scroll_selector("Y: " + $.teleport_location.y, key5, key6, $.scroll_y_teleport_selection);

		$.append_cheat("Teleport", "Activate", key7, $.teleport_current_location);
	};


	//////////////////////////////////////////////////////////////////////////////////
	// Final Functions for building each Menu and function list for updating the menu
	//////////////////////////////////////////////////////////////////////////////////
	// Check if already defined (allows game specific extensions to be loaded in any order)
	$.menus = $.menus || [];

	// One menu added for each cheat/page of the Cheat_Menu
	//	appended in reverse order at the front so they will
	//	appear first no matter the plugin load order for any
	//	extension plugins

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Teleport");
		$.append_teleport(4, 5, 6, 7, 8, 9, 0);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Save and Recall");
		$.append_save_recall(4, 5, 6, 7, 8, 9);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Switches");
		$.append_switch_selection(4, 5, 6);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Variables");
		$.append_amount_selection(4, 5);
		$.append_variable_selection(6, 7, 8, 9);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Clear States");
		$.append_party_state(4);
		$.append_actor_selection(5, 6);
		$.append_current_state(7);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Speed");
		$.append_move_amount_selection(4, 5);
		$.append_speed_status(6, 7, 8);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Armors");
		$.append_amount_selection(4, 5);
		$.append_armor_selection(6, 7, 8, 9);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Weapons");
		$.append_amount_selection(4, 5);
		$.append_weapon_selection(6, 7, 8, 9);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Items");
		$.append_amount_selection(4, 5);
		$.append_item_selection(6, 7, 8, 9);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Gold");
		$.append_amount_selection(4, 5);
		$.append_gold_status(6, 7);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Stats");
		$.append_actor_selection(4, 5);
		$.append_amount_selection(6, 7);
		$.append_stat_selection(8, 9, 0, '-');
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Give Exp");
		$.append_actor_selection(4, 5);
		$.append_amount_selection(6, 7);
		$.append_exp_cheat(8, 9);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Party TP");

		$.append_tp_cheats(4, 5, 6, 7, 8, 9);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Party MP");

		$.append_mp_cheats(4, 5, 6, 7, 8, 9);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Party HP");

		$.append_hp_cheats(4, 5, 6, 7, 8, 9);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("Enemy HP");

		$.append_enemy_cheats(4, 5, 6, 7);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("No Clip");

		$.append_no_clip_status(4);
	});

	$.menus.splice(0, 0, function () {
		$.append_cheat_title("God Mode");
		$.append_actor_selection(4, 5);

		$.append_godmode_status();
	});


	// update whats being displayed in menu
	$.update_menu = function () {
		// clear menu
		$.overlay.innerHTML = "";
		// clear key listeners
		$.key_listeners = {};

		$.menus[$.cheat_selected]();

		$.position_menu();
	};

	// listener to reposition menu
	window.addEventListener("resize", $.position_menu);


	// prevent clicking from passing through
	$.overlay.addEventListener("mousedown", function (event) {
		event.stopPropagation();
	});



	/////////////////////////////////////////////////
	// Cheat Menu Key Listener
	/////////////////////////////////////////////////

	// Key codes
	$.keyCodes = $.keyCodes || {};

	$.keyCodes.KEYCODE_0 = { keyCode: 48, key_listener: 0 };
	$.keyCodes.KEYCODE_1 = { keyCode: 49, key_listener: 1 };
	$.keyCodes.KEYCODE_2 = { keyCode: 50, key_listener: 2 };
	$.keyCodes.KEYCODE_3 = { keyCode: 51, key_listener: 3 };
	$.keyCodes.KEYCODE_4 = { keyCode: 52, key_listener: 4 };
	$.keyCodes.KEYCODE_5 = { keyCode: 53, key_listener: 5 };
	$.keyCodes.KEYCODE_6 = { keyCode: 54, key_listener: 6 };
	$.keyCodes.KEYCODE_7 = { keyCode: 55, key_listener: 7 };
	$.keyCodes.KEYCODE_8 = { keyCode: 56, key_listener: 8 };
	$.keyCodes.KEYCODE_9 = { keyCode: 57, key_listener: 9 };
	$.keyCodes.KEYCODE_MINUS = { keyCode: 189, key_listener: '-' };
	$.keyCodes.KEYCODE_EQUAL = { keyCode: 18, key_listener: '=' };

	$.keyCodes.KEYCODE_TILDE = { keyCode: 192, key_listener: '`' };

	$.key_listeners = {};

	window.addEventListener("keydown", function (event) {
		if (!event.ctrlKey && !event.altKey && (event.keyCode === 119) && $gameTemp && !$gameTemp.isPlaytest()) {
			// open debug menu
			event.stopPropagation();
			event.preventDefault();
			require('nw.gui').Window.get().showDevTools();
		}
		else if (!event.altKey && !event.ctrlKey && !event.shiftKey && (event.keyCode === 120) && $gameTemp && !$gameTemp.isPlaytest()) {
			// trick the game into thinking its a playtest so it will open the switch/variable debug menu
			$gameTemp._isPlaytest = true;
			setTimeout(function () {
				// back to not being playtest
				$gameTemp._isPlaytest = false;
			}, 100);
		}
		else if ($.overlay_openable && !event.altKey && !event.ctrlKey && !event.shiftKey) {
			// open and close menu
			if (event.keyCode === $.keyCodes.KEYCODE_1.keyCode) {
				if (!$.initialized) {
					for (let i = 0; i < $gameActors._data.length; i++) {
						if ($gameActors._data[i]) {
							$gameActors._data[i].god_mode = false;
							if ($gameActors._data[i].god_mode_interval) {
								clearInterval($gameActors._data[i].god_mode_interval);
							}
						}
					}

					// reset to initial values
					for (let name in $.initial_values) {
						$[name] = $.initial_values[name];
					}
					// load saved values if they exist
					if ($gameSystem.Cheat_Menu) {
						for (let name in $gameSystem.Cheat_Menu) {
							$[name] = $gameSystem.Cheat_Menu[name];
						}
					}

					// if speed is locked then initialize it so effect is active
					if ($.speed_unlocked === false) {
						$.initialize_speed_lock();
					}

					// only do this once per load or new game
					$.initialized = true;
				}

				// open menu
				if (!$.cheat_menu_open) {
					$.cheat_menu_open = true;
					document.body.appendChild($.overlay_box);
					document.body.appendChild($.overlay);
					$.update_menu();
					SoundManager.playSystemSound(1);
				}
				// close menu
				else {
					$.cheat_menu_open = false;
					$.overlay_box.remove();
					$.overlay.remove();
					SoundManager.playSystemSound(2);
				}
			}

			// navigate and activate cheats
			else if ($.cheat_menu_open) {
				// move menu position
				if (event.keyCode === $.keyCodes.KEYCODE_TILDE.keyCode) {
					$.position++;
					if ($.position > 4) {
						$.position = 0;
					}
					$.update_menu();
				}

				else {
					for (let keyCode in $.keyCodes) {
						if ($.key_listeners[$.keyCodes[keyCode].key_listener] && event.keyCode === $.keyCodes[keyCode].keyCode) {
							$.key_listeners[$.keyCodes[keyCode].key_listener](event);
						}
					}
				}
			}
		}
	});



	/////////////////////////////////////////////////
	// Load Hook
	/////////////////////////////////////////////////

	// close the menu and set for initialization on first open
	//	timer to provide periodic updates if the menu is open
	$.initialize = function () {
		$.overlay_openable = true;
		$.initialized = false;
		$.cheat_menu_open = false;
		$.speed_initialized = false;
		$.overlay_box.remove();
		$.overlay.remove();


		// periodic update
		clearInterval($.menu_update_timer);
		$.menu_update_timer = setInterval(function () {
			if ($.cheat_menu_open) {
				$.update_menu();
			}
		}, 1000);
	};

	// add hook for loading a game
	DataManager.default_loadGame = DataManager.loadGame;
	DataManager.loadGame = function (savefileId) {
		$.initialize();

		return DataManager.default_loadGame(savefileId);
	};

	// add hook for new game
	DataManager.default_setupNewGame = DataManager.setupNewGame;
	DataManager.setupNewGame = function () {
		$.initialize();

		DataManager.default_setupNewGame();
	};

	// add hook for saving values (just added into $gameSystem to be saved)
	DataManager.default_saveGame = DataManager.saveGame;
	DataManager.saveGame = function (savefileId) {
		// save values that are in initial values
		$gameSystem.Cheat_Menu = {};
		for (let name in $.initial_values) {
			$gameSystem.Cheat_Menu[name] = $[name];
		}

		return DataManager.default_saveGame(savefileId);
	};
})(CheatMenu);
