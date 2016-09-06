def levensteinDistance(s1: String, s2: String) = {
	val dist = Array.tabulate(s2.length + 1, s1.length + 1) {
		(j,i) => if (j == 0) i else if (i == 0) j else 0
	}

	for(j <-1 to s2.length; i <-1 to s1.length){
		dist(j)(i) = if(s2(j - 1) == s1(i - 1)){
			dist(j - 1)(i- 1)
		} else {
			Math.min(Math.min(dist(j - 1)(i) + 1, dist(j)(i -1) + 1), dist(j - 1)(i - 1) + 1)
		}
	}

	dist(s2.length)(s1.length)
}