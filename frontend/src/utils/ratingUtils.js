export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
};

export const getRatingDistribution = (reviews, maxRating = 5) => {
  const distribution = Array.from({ length: maxRating }, (_, i) => ({
    rating: maxRating - i,
    count: 0,
    percentage: 0
  }));

  if (!reviews || reviews.length === 0) return distribution;

  reviews.forEach(review => {
    const ratingIndex = maxRating - Math.floor(review.rating);
    if (ratingIndex >= 0 && ratingIndex < distribution.length) {
      distribution[ratingIndex].count++;
    }
  });

  distribution.forEach(item => {
    item.percentage = (item.count / reviews.length) * 100;
  });

  return distribution;
};

export const formatRatingCount = (count) => {
  if (count === 0) return 'No reviews';
  if (count === 1) return '1 review';
  return `${count} reviews`;
};
