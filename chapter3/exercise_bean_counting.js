function countBs(word) {
  return countChar(word, "B");
}

function countChar(word, target) {
  let count = 0;
  for (let pos = 0; pos <= word.length; pos++) {
    if (word[pos] == target) count += 1;
  }
  return count;
}

console.log("The number of \"B\" in \"Bob\": " + countBs("Bob"));
