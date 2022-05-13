// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
var _ = require("lodash");
var fs = require("fs");
var path = require('path');
var mysqldump = require('mysqldump');


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
					// Which exporter to use. values can be (mysqldump or mysqldump-npm) 
					// mysqldump is the default exporter that comes with mysql.
					// mysqldump-npm will use a node.js package for exporting sql.
					"exporter": "mysqldump",

					// Whether or not you want to use your custom command
					// Note: applicable when using mysqldump as exporter
					"useCustomCommand": false,

					// Example: C:\wamp64\bin\mysql\mysql5.7.36\bin\mysqldump -h 127.0.0.1 -u root -p --default-character-set utf8mb4 mess > c:\wamp64\www\etoiles\etoiles.sql
					"customCommand": "",

					// Not necessary if customCommand is provided
					"host": "localhost", 
					"user": "root",
					"pass": "",
					"port": 3306,
					"db": "",

					// Destination file (not necessary if customCommand is provided)
					"destination": "db.sql" 
				};

				var configjson = fs.readFileSync(configFile).toString();
				var configObject;

				try {
					configObject = JSON.parse(configjson);
					var realconfig = _.defaults(configObject, defaults);
					var destination = path.join(openedFolderPath, realconfig.destination);
					if ( realconfig.exporter === 'mysqldump' ) {
						if ( !('mysqlDumpDir' in realconfig) ) {
							showErr('You must specify the mysqlDumpDir where your mysqldump executable is located. For example: C:/wamp64/bin/mysql/mysql8.0.27/bin');
						}
						else {
							var usingCustomCommand = false;
							var dumper = path.join(realconfig.mysqlDumpDir, 'mysqldump')
							var command = `${dumper} -h ${realconfig.host} --port ${realconfig.port} -u ${realconfig.user} -p --default-character-set utf8mb4 ${realconfig.db} > ${destination}`;
							if ( realconfig.useCustomCommand && 'customCommand' in realconfig && realconfig.customCommand ) {
								usingCustomCommand = true;
								command = realconfig.customCommand;
							}


							// create a terminal first if not exist already.

							// find if already exist or not
							var found = false;
							var our_terminal_name = `Export MySQL`;
							for(var i = 0; i < vscode.window.terminals.length; i++) {
								var ter = vscode.window.terminals[i];
								var ter_name = ter.name;
								if ( ter_name === our_terminal_name ) {
									found = true;
									break;
								}
							}

							if ( !found ) {

								terminal = vscode.window.createTerminal(our_terminal_name);
							}
							terminal.sendText(command);
							terminal.sendText(realconfig.pass);

							if ( usingCustomCommand ) {

								terminal.show();
							}
							// vscode.commands.executeCommand('workbench.action.terminal.clear');
						}
						
					}
					else if ( realconfig.exporter === 'mysqldump-npm' ) {
						mysqldump({
							connection: {
								host: realconfig.host,
								user: realconfig.user,
								password: realconfig.pass,
								database: realconfig.db,
								charset: "UTF8MB4_UNICODE_520_CI",
								port: realconfig.port
							},
							dumpToFile: destination,
							dump: {
								data: {
									format: false
								}
							}
						});
					}
				} catch (err) {
					console.log(err);
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
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
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

module.exports = {
	activate,
	deactivate
}
