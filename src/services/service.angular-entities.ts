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

        // open the template if it exists
        const templatePath = path.join(entityPath, `${entityNameWithoutExtension}.html`));
        await this.openFileInEditor(templatePath);

        // open the spec if it exists
        const specPath = path.join(entityPath, `${entityNameWithoutExtension}.spec.ts`);
        await this.openFileInEditor(specPath);

        // open various style docs if they exist
        // TODO: some kind of parsing/regexing the content of the component declaration?
        await this.openFileInEditor(path.join(entityPath, `${entityNameWithoutExtension}.scss`));
        await this.openFileInEditor(path.join(entityPath, `${entityNameWithoutExtension}.less`));
        await this.openFileInEditor(path.join(entityPath, `${entityNameWithoutExtension}.css`));
        await this.openFileInEditor(path.join(entityPath, `${entityNameWithoutExtension}.sass`));

        // open the principal entity (await this one to ensure it steals focus first)
        await this.openFileInEditor(entityUri, false);
    }

    async private openFileInEditor(uri: vscode.Uri | string, preserveFocus = true) {
        if (typeof uri === "string") {
            if (!fs.existsSync(uri)) {
                return;
            }

            uri = vscode.Uri.file(uri);
        }

        const doc = await vscode
            .workspace
            .openTextDocument(uri as vscode.Uri);
        await vscode.window.showTextDocument(doc, { preview: false, preserveFocus });
    }
}