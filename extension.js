// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

let myStatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate({ subscriptions }) {

	// register a command that is invoked when the status bar
	// item is selected
	const myCommandId = 'sample.showSelectionCount';
	subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
		vscode.window.showInformationMessage(`Yeah, ${n} line(s) selected... Keep going!`);
	}));

	// create a new status bar item that we can now manage
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.text = `hahah`;
	myStatusBarItem.command = myCommandId;
	subscriptions.push(myStatusBarItem);
	myStatusBarItem.show();
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
