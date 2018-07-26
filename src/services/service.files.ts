import * as vscode from 'vscode';
import * as path from 'path';

export class AngularEntity {
    public friendlyName: string;
    public uri: vscode.Uri;
}

export class FilesService {
    getFiles(): Thenable<AngularEntity[]> {
        return new Promise((resolve, reject) => {
            Promise.all([
                vscode.workspace.findFiles('**/*.component.ts', '**/node_modules/*'),
                vscode.workspace.findFiles('**/*.directive.ts', '**/node_modules/*'),
                vscode.workspace.findFiles('**/*.service.ts', '**/node_modules/*'),
            ]).then(results => {
                // aggregate all results
                let allResults: vscode.Uri[] = [];
                for (let resultType of results) {
                    allResults = allResults.concat(resultType);
                }

                // map results to the return type
                const mappedResults: AngularEntity[] = allResults.map(result => {
                    return {
                        friendlyName: path.basename(result.fsPath),
                        uri: result,
                    };
                });

                // send it home
                resolve(mappedResults);
            }).catch(err => {
                vscode.window.showErrorMessage(err);
            });
        });
    }
}