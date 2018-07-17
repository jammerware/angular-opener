'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, angular-opener is now active!');

    const openComponentCommand = vscode.commands.registerCommand('angular-opener.openComponent', () => {
        vscode.window.showInformationMessage("Let's open a component...");
    });

    context.subscriptions.push(openComponentCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
}