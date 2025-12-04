import { readFile, writeFile } from "fs/promises";


export async function readJSON(path) {
    const data = await readFile(path, "utf8");
    return JSON.parse(data);
}

export async function writeJSON(path, data) {
    return writeFile(path, JSON.stringify(data, null, 2));
}



