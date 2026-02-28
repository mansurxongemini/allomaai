const { Project, SyntaxKind } = require('ts-morph');

async function findUnusedVariables() {
    console.log("Initializing ts-morph project...");
    const project = new Project({
        tsConfigFilePath: "tsconfig.json",
    });

    const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");
    console.log(`Analyzing ${sourceFiles.length} files...`);

    let unusedCount = 0;

    for (const sourceFile of sourceFiles) {
        const filePath = sourceFile.getFilePath();
        let fileHasUnused = false;

        // Find all variable declarations
        const varDecls = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration);

        for (const varDecl of varDecls) {
            const nameNode = varDecl.getNameNode();
            // Simple check: if it's an Identifier
            if (nameNode.getKind() === SyntaxKind.Identifier) {
                const nameText = nameNode.getText();
                // Ignore underscores
                if (nameText.startsWith('_') || nameText.includes('Skeleton')) continue;

                const refs = nameNode.findReferencesAsNodes();

                // If refs == 1, it's only the declaration itself
                // (ts-morph sometimes includes the declaration in the refs list, sometimes not depending on context. 
                // We ensure it's not exported, because exported vars might be used in other files.)
                const isExported = varDecl.getFirstAncestorByKind(SyntaxKind.VariableStatement)?.isExported();

                if (refs.length === 1 && !isExported) {
                    if (!fileHasUnused) {
                        console.log(`\n📄 ${filePath.split('/src/')[1]}`);
                        fileHasUnused = true;
                    }
                    console.log(`  - Unused variable: ${nameText}`);
                    unusedCount++;
                }
            }
        }
    }

    console.log(`\nAnalysis complete. Found ${unusedCount} unused local variables.`);
}

findUnusedVariables().catch(console.error);
