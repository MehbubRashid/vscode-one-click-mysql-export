// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
var _ = require("lodash");
var fs = require("fs");
var path = require('path');


let myStatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate({ subscriptions }) {

	// register a command that is invoked when the status bar
	// item is selected
	const myCommandId = 'vscode-one-click-mysql-export.export';
	let NEXT_TERM_ID = 1;
	var terminal = '';
	subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		var msg = '';
		if(vscode.workspace.workspaceFolders !== undefined) {
			let openedFolderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
			let configDir = openedFolderPath + '/.vscode';
			let configFile = configDir + '/mysql-export.json';

			if ( !openedFolderPath ) {
				msg = 'You must open a folder';
				showErr(msg);
			}
			else {
				var defaults = {
					"mysqlDumpDir": "C:/wamp64/bin/mysql/mysql8.0.27/bin", //directory path where the mysqldump executable is located.
					"host": "localhost",
					"user": "root",
					"pass": "",
					"port": 3306,
					"db": "",
					"destination": "db.sql"
				};

				var configjson = fs.readFileSync(configFile).toString();
				var configObject;

				try {
					configObject = JSON.parse(configjson);
					var realconfig = _.defaults(configObject, defaults);
					var destination = path.join(openedFolderPath, realconfig.destination);
					var dumper = path.join(realconfig.mysqlDumpDir, 'mysqldump')
					var command = `${dumper} -h ${realconfig.host} -u ${realconfig.user} -p'${realconfig.pass}' ${realconfig.db} > ${destination}`;
					console.log(command);

					// create a terminal first if not exist already.
					if ( !terminal ) {

						terminal = vscode.window.createTerminal(`Export MySQL #${NEXT_TERM_ID}`);
					}
					terminal.sendText(command);
					terminal.show();
				} catch (err) {
					showErr(err);
				}
			}
		} 
		else {
			msg = "Working folder not found, open a folder an try again" ;
		
			showMsg(msg);
		}
	}));

	// create a new status bar item that we can now manage
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.text = `Export MySQL`;
	myStatusBarItem.command = myCommandId;
	subscriptions.push(myStatusBarItem);
	myStatusBarItem.show();
}


function showErr(msg) {
	vscode.window.showErrorMessage(msg);
}

function showMsg(msg) {
	vscode.window.showInformationMessage(msg);
}

// this method is called when your extension is deactivated
function deactivate() {}

function getNumberOfSelectedLines(editor) {
	let lines = 0;
	if (editor) {
		lines = editor.selections.reduce((prev, curr) => prev + (curr.end.line - curr.start.line), 0);
	}
	return lines;
}

module.exports = {
	activate,
	deactivate
}
