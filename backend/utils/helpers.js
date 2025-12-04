import { randomBytes } from "crypto";

export function parseForm(body) {
    const form = {};

    //if no input then return empty
    if (!body) return form;

    const pairs = body.split("&")

    for (const pair of pairs) {
        const [key, value] = pair.split("=");
        form[key] = decodeURIComponent(value || "");
    }

    return form;
}

export function generateSessionId() {
    return "session_" + randomBytes(16).toString("hex");
}

export function generateId(database) {
    if (database.length === 0) {
        return "p1";
    }

    const allIds = database.map(item => {
        const number = parseInt(item.id.substring(1)    );
        return number;
    })

    const maxId = Math.max(...allIds);
    return "p" + (maxId + 1);
}

export function uploadImg(file) {
    if (!file) {
        return null;
    }

    console.log("Data yang diterima:", file);
    console.log("Tipe file:", typeof file);

    const matches = file.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    const tipeFile = matches[1];
    const dataFile = matches[2];

    if(!matches || matches.length !== 3){
        throw new Error("Invalid file format");
    }

    const buffer = Buffer.from(dataFile, "base64");
    const fileName = "img_" + Date.now() + "." + tipeFile;
    const uploadPath = path.join(process.cwd(), "frontend", "uploads", fileName);
    fs.writeFileSync(uploadPath, buffer);
    console.log("File uploaded successfully:", fileName);
    return "/uploads/" + fileName;
}
