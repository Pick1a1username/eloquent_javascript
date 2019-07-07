function parseINI(string) {
    // Start with an object to hold the top-level fields
    let result = {};
    let section = result;
    string.split(/\r?\n/).forEach(line => {
        let match;
        
        if (match = line.match(/^(\w+)=(.*)$/)) {
            section[match[1]] = match[2];
        } else if (match = line.match(/^\[(.*)\]$/)) {
            // section points to the section's value in result.
            section = result[match[1]] = {};
        } else if (!/^\s*(;.*)?$/.test(line)) {
            throw new Error("Line '" + line + "' is not valid.");
        }

        console.log(result);
        console.log(section);
        console.log();
    });
    return result;
}

console.log(parseINI(`
firstname=Vasilis
lastname=Mario

; this is comment.
[address]
city=Tessaloniki
zipcode=123-4567`));