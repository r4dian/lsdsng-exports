import {makeHTML, makeMIDI, unpack} from "./lsdsng";

const CheckedOpt = {
    HTML: "HTML",
    JSON: "JSON",
    MIDI: "MIDI",
}

const getCheckedOpt = () => {
    const html = document.getElementById('html');
    const json = document.getElementById('json');
    if (html.checked) {
        return CheckedOpt.HTML;
    } else if (json.checked) {
        return CheckedOpt.JSON;
    } else {
        return CheckedOpt.MIDI;
    }
}

/**
 * Download a file.
 *
 * @param {string|object} data The data.
 * @param {string} filename Filename.
 * @param {string} [mime] MIME type.
 */
const getDownload = (data, filename, mime = "octet/stream") => {
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    const file = document.getElementById('file');
    const submit = document.getElementById('submit');
    submit.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const option = getCheckedOpt();
        const buf = new Uint8Array(await file.files[0].arrayBuffer())
        const song = unpack(buf);
        switch (option) {
            case CheckedOpt.HTML:
                const html = makeHTML(song)
                getDownload(html, "output.html")
                break;
            case CheckedOpt.JSON:
                getDownload(JSON.stringify(song), "output.json")
                break;
            case CheckedOpt.MIDI:
                const midi = makeMIDI(song);
                getDownload(midi, "output.midi")
                break;
        }
    })
})