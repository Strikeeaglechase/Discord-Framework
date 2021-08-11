function parseQuotes(str: string): string[] {
	let args: string[] = [];

	function defaultParse(nextSpace: number) {
		if (nextSpace > -1) {
			args.push(str.substring(0, nextSpace));
			str = str.substring(nextSpace + 1);
		} else {
			args.push(str);
			str = "";
		}
	}
	while (str.length > 0) {
		const nextSpace = str.indexOf(" ");
		const nextQuote = str.indexOf('"');
		if (nextSpace == -1 && nextQuote == -1) {
			//No more spaces or quotes, thus we are done
			args.push(str);
			break;
		}
		if ((nextSpace < nextQuote || nextQuote == -1) && nextSpace > -1) {
			//Next argument is a space
			defaultParse(nextSpace);
		} else if ((nextQuote < nextSpace || nextSpace == -1) && nextQuote > -1) {
			//Next argument is a quoted one, find closing quote and substring
			//Make sure its the first letter, otherwise its a bad quote
			if (str[0] == '"') {
				str = str.substring(1);
				const endingQuote = str.indexOf('"');
				if (endingQuote != -1) {
					args.push(str.substring(0, endingQuote));
					str = str.substring(endingQuote + 2);
				} else {
					//Another bad quote (no ending quote)
					defaultParse(nextSpace);
				}
			} else {
				//At a bad quote, need to remove it.
				defaultParse(nextSpace);
			}
		}
	}
	return args;
}
export default parseQuotes;
