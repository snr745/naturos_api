const review = require("./../models/reviewModel");
const catchAsync = require("./../Utils/catchAsync");
const AppError = require("./../utils/appError");
const factory=require("./handleFactory");

exports.setParams=catchAsync(async (req, res, next) => {
  if(!req.body.tour) req.body.tour=req.params.tourId;
  if(!req.body.user) req.body.user=req.user.id;
  next();
});

exports.creatReview = factory.createOne(review);

  exports.getAllReviews =factory.getAll(review);

  exports.getReview =factory.getOne(review);
  exports.deleteReview =factory.deleteOne(review);

  exports.updateReview=factory.updateOne(review);

