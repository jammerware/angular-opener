import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class AngularEntity {
    public friendlyName: string = null;
    public uri: vscode.Uri = null;
}

export class AngularEntitiesService {
    getEntities(): Thenable<AngularEntity[]> {
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

    async openEntity(entityUri: vscode.Uri) {
        const entityPath = path.dirname(entityUri.fsPath);
        const entityName = path.basename(entityUri.fsPath);
        // based on how the "getEntities" method works, I'm assuming here that
        // the entity name ends in `.ts` (or possibly `.js` eventually)
        const entityNameWithoutExtension = entityName.substring(0, entityName.length - 3);

        // open the principal entity
        this.openFileInEditor(entityUri);

        // open the template if it exists
        const templatePath = path.join(entityPath, entityName.replace('.ts', '.html'));
        if (fs.existsSync(templatePath)) {
            const templateUri = vscode.Uri.file(templatePath);
            this.openFileInEditor(templateUri);
        }

        // open the spec if it exists
        const specPath = path.join(entityPath, entityName.replace('.ts', '.spec.ts'));
        if (fs.existsSync(specPath)) {
            const specUri = vscode.Uri.file(specPath);
            this.openFileInEditor(specUri);
        }
    }

    async private openFileInEditor(uri) {
        const doc = await vscode
            .workspace
            .openTextDocument(uri);
        await vscode.window.showTextDocument(doc, { preview: false });
    }
}