// Sample really expensive function

// http://www.coderenaissance.com/2011/06/finding-prime-factors-in-javascript.html
export function primeFactorization(num){
  var root = Math.sqrt(num),
  result = arguments[1] || [],  //get unnamed paremeter from recursive calls
  x = 2;

  if(num % x){//if not divisible by 2
   x = 3;//assign first odd
   while((num % x) && ((x = x + 2) < root)){}//iterate odds
  }
  //if no factor found then num is prime
  x = (x <= root) ? x : num;
  result.push(x);//push latest prime factor

  //if num isn't prime factor make recursive call
  return (x === num) ? result : primeFactorization(num/x, result) ;
}
