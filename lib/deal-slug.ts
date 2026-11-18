import {randomInt} from "node:crypto";
/** Cryptographically random, URL-safe six-character deal room code. */
export function newDealSlug(){
 const alphabet="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
 return Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join("");
}
