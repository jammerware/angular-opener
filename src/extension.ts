'use strict';
import * as vscode from 'vscode';
import { FilesService } from './services/service.files';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, angular-opener is now active!');

    const openComponentCommand = vscode.commands.registerCommand('angular-opener.openComponent', async () => {
        const filesService = new FilesService();
        const files = await filesService.getFiles();
        const options = files.map(f => {
            return {
                label: f.friendlyName,
                description: f.uri.fsPath,
            };
        });

        vscode
            .window
            .showQuickPick(options, { placeHolder: 'Choose a component, service, or directive...', })
            .then(selectedItem => {
                if (selectedItem) {
                    const uri = vscode.Uri.file(selectedItem.description);
                    vscode
                        .workspace
                        .openTextDocument(uri)
                        .then(yay => console.log('yay', yay), ohno => console.log('oh no', ohno));
                }
            });
    });

    context.subscriptions.push(openComponentCommand);
}

export function deactivate() {
}