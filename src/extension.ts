'use strict';
import * as vscode from 'vscode';
import { AngularEntitiesService } from './services/service.angular-entities';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, angular-opener is now active!');

    const openComponentCommand = vscode.commands.registerCommand('angular-opener.openComponent', async () => {
        const entitiesService = new AngularEntitiesService();
        const entities = await entitiesService.getEntities();
        const quickPickOptions = entities.map(e => {
            return {
                label: e.friendlyName,
                description: e.uri.fsPath,
            };
        });

        vscode
            .window
            .showQuickPick(quickPickOptions, { placeHolder: 'Choose a component, service, or directive...', })
            .then(async (selectedItem) => {
                if (selectedItem) {
                    const uri = vscode.Uri.file(selectedItem.description);
                    await entitiesService.openEntity(uri);
                }
            });
    });

    context.subscriptions.push(openComponentCommand);
}

export function deactivate() {
}