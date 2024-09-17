#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const program = new Command();

program
  .version('1.0.1')
  .description('Convert React components and JSX to PlantUML with conditional rendering')
  .argument('<file>', 'JavaScript or JSX file to process')
  .action((file) => {
    const content = fs.readFileSync(file, 'utf-8');

    // Parse the code with Babel to handle JSX and ES6+ syntax
    const ast = babelParser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'classProperties'],
    });

    let puml = '@startuml\nallowmixing\n\n';
    const componentStack = [];
    const relationships = [];
    let currentComponent = null;

    // Traverse the AST to find components and elements
    traverse(ast, {
      enter(path) {
        if (
          (path.isFunctionDeclaration() || path.isArrowFunctionExpression()) &&
          !path.parentPath.isVariableDeclarator()
        ) {
          const functionName = path.node.id ? path.node.id.name : 'Anonymous';
          puml += `class ${functionName} {\n  <<Functional Component>>\n}\n`;
          currentComponent = functionName;
          componentStack.push(functionName);
        }

        if (path.isClassDeclaration() && path.node.superClass && path.node.superClass.name === 'Component') {
          const className = path.node.id.name;
          puml += `class ${className} {\n  <<Class Component>>\n}\n`;
          currentComponent = className;
          componentStack.push(className);
        }

        if (path.isJSXElement()) {
          const tagName = path.node.openingElement.name.name;
          puml += `component ${tagName}\n`;
          if (currentComponent) {
            relationships.push(`${currentComponent} --> ${tagName}`);
          }
        }

        if (path.isConditionalExpression() || path.isIfStatement()) {
          if (path.isConditionalExpression()) {
            const test = path.node.test.name || 'condition';
            relationships.push(`if (${test}) then`);
          } else if (path.isIfStatement()) {
            const test = path.node.test.name || 'condition';
            relationships.push(`if (${test}) then`);
          }
        }
      },
      exit(path) {
        if (path.isConditionalExpression() || path.isIfStatement()) {
          relationships.push(`endif`);
        }

        if (path.isFunctionDeclaration() || path.isArrowFunctionExpression() || path.isClassDeclaration()) {
          componentStack.pop();
          currentComponent = componentStack[componentStack.length - 1];
        }
      },
    });

    puml += relationships.join('\n') + '\n';
    puml += '@enduml';

    // Get the directory and filename of the input file
    const dir = path.dirname(file);
    const fileName = path.basename(file, path.extname(file));

    // Write the output to a .puml file in the same directory
    const outputFilePath = path.join(dir, `${fileName}.puml`);
    fs.writeFileSync(outputFilePath, puml, 'utf-8');

    console.log(`Generated PlantUML file: ${outputFilePath}`);
  });

program.parse(process.argv);
