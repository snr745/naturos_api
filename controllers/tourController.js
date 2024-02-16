const Tour = require("./../models/TourModel");

const catchAsync = require("./../Utils/catchAsync");
const AppError = require("./../Utils/AppError");
const factory=require("./handleFactory");

exports.alias = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "price,ratingsAverage";
  req.query.fields = "name,price,ratingsAverage,summary";
  next();
};

exports.getTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour,{path:'reviews'});

exports.updateTour = factory.updateOne(Tour);

exports.creatTours = factory.createOne(Tour);

exports.deleTour = factory.deleteOne(Tour);

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const {distance,latlang,unit}=req.params;
  const [lat,lang]=latlang.split(',');

  const radius= unit ==="mi" ? distance/3963.2 :distance/6378.15214;
  console.log(distance,latlang,unit);
  const tours=await Tour.find( {
    startLocation: { $geoWithin: { $centerSphere: [ [lang, lat  ], radius] } }
  } )
  res.status(200).json({
    status: "success",
    data:tours
  });
})

exports.getTourdistances = catchAsync(async (req, res, next) => {
  const {distance,latlang,unit}=req.params;
  const [lat,lang]=latlang.split(',');

  const multiplier= unit ==="mi" ? 0.000621371 :0.001;
  console.log(distance,latlang,unit);
  const results=await Tour.aggregate( [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [ lang *1 , lat *1 ] },
        distanceField: "distance",
        distanceMultiplier:multiplier
     }
    },
    {
      $project:{
        distance:1,
        name:1,
      }
    }
      
  ])
 
  res.status(200).json({
    status: "success",
    data:results
  });
})

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
