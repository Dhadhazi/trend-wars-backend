const googleTrends = require("google-trends-api");

module.exports = async (startDate, endDate, category, place, keywords) => {
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
        category,
        geo,
      });
      const data = JSON.parse(pairData);
      return [
        {
          word: word1,
          score: data.default.averages[0],
          winner: data.default.averages[0] >= data.default.averages[1],
          total_chosen: 0,
        },
        {
          word: word2,
          score: data.default.averages[1],
          winner: data.default.averages[0] < data.default.averages[1],
          total_chosen: 0,
        },
      ];
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
      if (pair[0].score !== undefined && pair[1].score !== undefined)
        pairs.push(pair);
    }
  }

  return pairs;
};
