// A script to find unused imports using ts-morph
const { Project } = require('ts-morph');

async function findUnusedImports() {
    console.log("Initializing ts-morph project...");
    const project = new Project({
        tsConfigFilePath: "tsconfig.json",
    });

    const sourceFiles = project.getSourceFiles("src/**/*.{ts,tsx}");
    console.log(`Analyzing ${sourceFiles.length} files...`);

    let unusedCount = 0;

    for (const sourceFile of sourceFiles) {
        const filePath = sourceFile.getFilePath();
        const importDeclarations = sourceFile.getImportDeclarations();

        let hasUnused = false;

        for (const importDecl of importDeclarations) {
            const defaultImport = importDecl.getDefaultImport();
            const namedImports = importDecl.getNamedImports();
            const namespaceImport = importDecl.getNamespaceImport();

            let unusedNamed = [];
            let isDefaultUnused = false;
            let isNamespaceUnused = false;

            // Check default import
            if (defaultImport) {
                const refs = defaultImport.findReferencesAsNodes();
                if (refs.length === 1) { // 1 ref means only the import statement itself
                    isDefaultUnused = true;
                }
            }

            // Check named imports
            for (const namedImport of namedImports) {
                const nameNode = namedImport.getNameNode();
                const refs = nameNode.findReferencesAsNodes();
                if (refs.length === 1) {
                    unusedNamed.push(nameNode.getText());
                }
            }

            // Check namespace import (* as X)
            if (namespaceImport) {
                const refs = namespaceImport.findReferencesAsNodes();
                if (refs.length === 1) {
                    isNamespaceUnused = true;
                }
            }

            if (isDefaultUnused || unusedNamed.length > 0 || isNamespaceUnused) {
                if (!hasUnused) {
                    console.log(`\n📄 ${filePath.split('/src/')[1]}`);
                    hasUnused = true;
                }

                let msg = "  - Unused from '" + importDecl.getModuleSpecifierValue() + "': ";
                const items = [];
                if (isDefaultUnused) items.push(`default (${defaultImport.getText()})`);
                if (isNamespaceUnused) items.push(`namespace (${namespaceImport.getText()})`);
                if (unusedNamed.length > 0) items.push(`{ ${unusedNamed.join(", ")} }`);

                console.log(msg + items.join(" | "));
                unusedCount++;
            }
        }
    }

    console.log(`\nAnalysis complete. Found ${unusedCount} unused import instances.`);
}

findUnusedImports().catch(console.error);
