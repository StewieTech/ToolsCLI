#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs-extra');
const path = require('path');

// Define the command for generating a component
program
    .command('generate component <componentName>')
    .alias('g c')
    .description('Generate a new React component')
    .action((componentName) => {
        generateComponent(componentName);
    });

// Function to generate a new React component
const generateComponent = (componentName) => {
    // Define the component directory path
    const componentDir = path.join(process.cwd(), componentName);

    // Define the component file paths
    const componentFile = path.join(componentDir, `${componentName}.jsx`);
    const cssFile = path.join(componentDir, `${componentName}.css`);
    const testFile = path.join(componentDir, `${componentName}.test.jsx`);

    // Create the component directory
    fs.ensureDirSync(componentDir);

    // Create the component JSX file
    const componentTemplate = `
import React from 'react';
import './${componentName}.css';

const ${componentName} = () => {
    return (
        <div className="${componentName}">
            <h1>${componentName} Component</h1>
        </div>
    );
};

export default ${componentName};
    `;

    fs.writeFileSync(componentFile, componentTemplate.trim());

    // Create the CSS file
    const cssTemplate = `
.${componentName} {
    /* Add your styles here */
}
    `;

    fs.writeFileSync(cssFile, cssTemplate.trim());

        // Create the test file
        const testTemplate = `
        import React from 'react';
        import { render } from '@testing-library/react';
        import ${componentName} from './${componentName}';
        
        test('renders ${componentName} component', () => {
            render(<${componentName} />);
        });
            `;
        
            fs.writeFileSync(testFile, testTemplate.trim());

    console.log(`Component ${componentName} has been created successfully!`);
};

// Parse the command-line arguments
program.parse(process.argv);
