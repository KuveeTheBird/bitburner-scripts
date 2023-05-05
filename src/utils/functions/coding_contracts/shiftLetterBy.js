export function shiftLetterBy(letter, shiftBy) {
    const codeOfA = 65;
    const codeOfZ = 90;
    const numOfLetters = 26;

    let newCharAscii = letter.charCodeAt(0) + shiftBy;

    while (newCharAscii > codeOfZ) {
        newCharAscii -= numOfLetters;
    } while (newCharAscii < codeOfA) {
        newCharAscii += numOfLetters;
    }

    return String.fromCharCode(newCharAscii);
}