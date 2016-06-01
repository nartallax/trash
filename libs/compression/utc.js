// Unicode Text Compression, LZ-bazed
// see also http://unicode.org/notes/tn31/
aPackage('nart.compression.utc', () => {
	'use strict';
	
	var hash = (c1, c2) => ((c2 * 37 ^ ((c1 >> 7) * 5) ^ (c1)) * 33) & 16383
	
	var compress = text => {
		var dictionary = {},
			result = '';
			
		var outputLiteral = (input, match)
		
		
		var input = -1,
			literal = input,
			len = text.length;
		while(++input < len){
			var match_index = hash(text.charCodeAt(input), text.charCodeAt(input + 1))
			var match = dictionary[match_index];
			dictionary[match_index] = input;
			
			if(typeof(match) === 'number' && text.charCodeAt(match) === text.charCodeAt(input) && text.charCodeAt(match + 1) === text.charCodeAt(input + 1)){
				
				if(literal < input)
				
			}
			
		}
		/*
		
literal = input;
while (length-- > 0) {
  match_index = hash(*input, *(input + 1));
  match = dictionary[match_index];
  dictionary[match_index] = input;
  
  if (valid_pointer(match) && *match == *input && *(match + 1) == *(input + 1))   {
    if (literal < input)
      OutputLiteral(literal, input - literal);
      
    i = 2;
    while (*(match + i) == *(input + i))
      ++i;
      
    OutputMatch(input - match, i);
    
    input += i;
    literal = input;
    length -= (i - 1);
  }
  else
    ++input;
}

if (literal < input)
  OutputLiteral(literal, input - literal);
		
		*/
		
		
	}
	
	return compress;
	
});