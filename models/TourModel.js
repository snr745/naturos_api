const mongoose=require('mongoose');
const slugify=require('slugify');


const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "A tour must have name"],
      minlength:[10,"Tour name must have minimum length of 10"],
      maxlength:[40,"Tour name must not exceed  length of 40"],
      unique: true,
      trim:true
    },
    slug:String,
    ratingsAverage: { type: Number, default: 4.5 },
    ratingsQuantity: { type: Number },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    summary:{
      type:String,
      trim:true
    },
    description:{
      type:String,
      trim:true,
      required: [true, "A tour must have description"],
    },
    imageCover:{
      type:String,
      required: [true, "A tour must have cover image"],
    },
    images:[String],
    createdAt:{
      type:Date,
      default: Date.now()
    },
    duration:{
      type:Number
    },
    maxGroupSize:{
      type:Number
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    startDates:[Date],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
   
  },
  {
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  });

  tourSchema.virtual('durationInWeeks').get(function(){
    return this.duration/7;
  });

  //document middleware
  tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true});
    next();
  })

  //Query Middleware
  tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}});
    next();
  })

  //Query Middleware
  tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift(
      {$match:{secretTour:{$ne:true}}}
    )
    console.log(this.pipeline());
    next();
  })

  
const Tour=mongoose.model('Tour',tourSchema);

module.exports=Tour;