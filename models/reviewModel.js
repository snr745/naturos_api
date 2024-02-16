//review /rating/createdAt/ ref tour/ ref user

const mongoose=require('mongoose');
const Tour=require('./TourModel');

const reviewSchema= new mongoose.Schema({
    review:{
       type: String,
       required:[true,"Review cannot be empty"]
    },
    rating: {
        type: Number,
        min:1,
        maxi:5,
      },
    createdAt:{
        type:Date,
        default: Date.now()
      },
      tour:[{type:mongoose.Schema.ObjectId,
        ref :'Tour',
        required:[true,"tour cannot be empty"]}],
  user:[{type:mongoose.Schema.ObjectId,
            ref :'User',
            required:[true,"user cannot be empty"]}]

},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  });

reviewSchema.index({tour:1,user:1},{unique:true});

  reviewSchema.pre(/^find/,function(next){
    this.populate({
      path:"user",
      select:"name"
    });
    next();
  });

reviewSchema.statics.calculateAverageRatings=async function(tourId){
  console.log(tourId);
  const stats=await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group:{
        _id:'$tour',
        nRating:{$sum:1},
        avgRating:{$avg:'$rating'}
      }
    }
  ]);
  await Tour.findByIdAndUpdate(tourId,{
    ratingsAverage:stats[0].avgRating,
    ratingsQuantity:stats[0].nRating
  });
}

reviewSchema.post('save',function(){
  this.constructor.calculateAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/,async function(next){
  this.r=await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/,async function(){
  await this.r.constructor.calculateAverageRatings(this.r.tour);
});



const Review=mongoose.model('Review',reviewSchema);



module.exports=Review;