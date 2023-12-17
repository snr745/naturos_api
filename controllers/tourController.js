const Tour = require("./../models/TourModel");
const APIFeatures = require("../Utils/APIFeatures");
const catchAsync = require("./../Utils/catchAsync");
const AppError = require("./../Utils/AppError");

exports.alias = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,ratingsAverage";
  req.query.fields = "name,price,ratingsAverage,summary";
  next();
};

exports.getTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;
  res.status(200).json({
    status: "success",
    results: tours.length,
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
   return next(new AppError("Tour id not found ", 404));
  }
  res.status(200).json({
    status: "success",
    tours: tour,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  ).exec();
  res.status(200).json({
    status: "success",
    tours: tour,
  });
});

exports.creatTours = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
    res.status(201).send({
      status: "New Tour Created",
      Data: {
        tour: newTour,
      },
    });
});

exports.deleTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      message: "tour deleted",
    });
});

exports.GetTourStats = catchAsync(async (req, res, next) => {
  const result = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  let year = req.params.year * 1;
  const result = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    { $addFields: { month: "$_id" } },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: result,
  });
});
