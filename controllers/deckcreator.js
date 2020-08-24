const googleTrends = require("google-trends-api");

async function deckreator(name, startDate, endDate, place, keywords) {
  const startTime = new Date(startDate);
  const endTime = new Date(endDate);
  let geo = "";
  if (place.length === 1) {
    geo = place[0];
  } else if (place.length > 1) {
    geo = place;
  }

  async function getPair(word1, word2) {
    try {
      const pairData = await googleTrends.interestOverTime({
        keyword: [word1, word2],
        startTime,
        endTime,
        geo,
      });
      const data = JSON.parse(pairData);
      return {
        word1,
        word2,
        score1: data.default.averages[0],
        score2: data.default.averages[1],
      };
    } catch (e) {
      console.log(e);
    }
  }

  const delay = () => new Promise((resolve) => setTimeout(resolve, 1000));

  let pairs = [];

  for (let i = 0; i < keywords.length - 1; i++) {
    for (let j = i + 1; j < keywords.length; j++) {
      await delay();
      const pair = await getPair(keywords[i], keywords[j]);
      pairs.push(pair);
    }
  }

  const deck = {
    name,
    start_date: startDate,
    end_date: endDate,
    geo,
    pairs,
  };

  return deck;
}
