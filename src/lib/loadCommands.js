import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsDir = path.join(__dirname, '../commands');
import fs from 'fs';
const commands = new Map();

const loadFile = async (filePath) => {
    try {
        if(filePath.endsWith('.js')) {
            let file = await import(`file://${filePath}`);
            file = file.default;
            const name = file.name.toLowerCase().replace(/\s/g, "");
            if (!commands.has(name)) {
                commands.set(name, file);
            } else {
                console.error(`duplication name ${name}.`);
            }
        }
    } catch (e) { 
        console.error(e);
    }
};

const exploreFolder = async (dir) => {
    const promises = fs.readdirSync(dir).map(async dirOrFile => {
        const dirOrFilePath = path.join(dir, dirOrFile);
        if (fs.statSync(dirOrFilePath).isDirectory()) {
            return exploreFolder(dirOrFilePath);
        } else {
            return loadFile(dirOrFilePath);
        }
    });
    
    // Tunggu sampai semua promises selesai
    await Promise.all(promises);
};

const loadCommands = async () => {
    await exploreFolder(commandsDir);
    console.log(`Loaded ${commands.size} commands.`);
};

export { loadCommands, commands };
