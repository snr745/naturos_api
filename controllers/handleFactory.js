const catchAsync = require("./../Utils/catchAsync");
const AppError = require("./../Utils/AppError");
const APIFeatures = require("../Utils/APIFeatures");

exports.deleteOne= Model=> catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }
  
      res.status(204).json({
        status: 'success',
        data: null
      });
  });

exports.createOne= Model => catchAsync(async (req, res, next) => {
  const doc = await Model.create(req.body);
    res.status(201).send({
      status: "Success",
      Data: {
        data: doc,
      },
    });
});

exports.updateOne= Model=> catchAsync(async (req, res, next) => {
  const tour = await Model.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true, runValidators: true }
  ).exec();
  res.status(200).json({
    status: "success",
    data: tour,
  });
});


exports.getOne=(Model,populateOption)=>catchAsync(async (req, res, next) => {

  let query=Model.findById(req.params.id);
  if(populateOption) query =query.populate(populateOption);
  const doc =await query;
  if (!doc) {
   return next(new AppError("No Document found with ID ", 404));
  }
  res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.getAll=Model=>catchAsync(async (req, res, next) => {

  // To achieve Nested Routes
  let filter={};
    if(req.params.tourId) filter={tour:req.params.tourId};
  const features = new APIFeatures(Model.find(filter), req.query)
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