const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const parsedSauce = JSON.parse(req.body.sauce);
  const url = req.protocol + '://' + req.get('host');
  const sauce = new Sauce({
    name: parsedSauce.name,
    userId: parsedSauce.userId,
    manufacturer: parsedSauce.manufacturer,
    description: parsedSauce.description,
    mainPepper: parsedSauce.mainPepper,
    imageUrl: url + '/images/' + req.file.filename,
    price: parsedSauce.price,
    heat: parsedSauce.heat,
    likes: 0,
    dislikes: 0,
    userLiked: [],
    usersDisliked: []
  });

  sauce.save().then(
    () => {
      res.status(201).json({
        message: 'Post saved successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  let sauce = new Sauce({ _id: req.params._id });
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    req.body.sauce = JSON.parse(req.body.sauce);
    sauce = {
      userId: req.body.sauce.userId,
      name: req.body.sauce.name,
      manufacturer: req.body.sauce.manufacturer,
      description: req.body.sauce.description,
      imageUrl: url + '/images/' + req.file.filename,
      mainPepper: req.body.sauce.mainPepper,
      heat: req.body.sauce.heat
    };
  } else {
    sauce = {
      userId: req.body.userId,
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      description: req.body.description,
      mainPepper: req.body.mainPepper,
      heat: req.body.heat
    };
  }
  console.log(sauce)
  Sauce.updateOne({ _id: req.params.id }, sauce).then(
    () => {
      res.status(201).json({
        message: 'Sauce updated successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};


exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then(
    (sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink('images/' + filename, () => {
        Sauce.deleteOne({ _id: req.params.id }).then(
          () => {
            res.status(200).json({
              message: 'Deleted!'
            });
          }
        ).catch(
          (error) => {
            console.log(exports.deleteSauce)
            res.status(400).json({
            });
          }
        );
      });
    }
  );
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req, res, next) => {
  let userIdInfo = req.body.userId;

  let currentLikes = req.body.like;
  let sauceId = req.params.id;
  Sauce.findOne({ _id: req.params.id }).then(
    (sauce) => {
      console.log((sauce.usersLiked))
      if (currentLikes === 1 && !sauce.usersLiked.includes(userIdInfo)) {
        // FIXME RESET USERS LIKES AND DISLIKES
        resetUserVote(sauce, userIdInfo)
        console.log("user liking sauce now")
        sauce.likes++
        sauce.usersLiked.push(userIdInfo)
      }
      else if (currentLikes === 0 && (sauce.usersLiked.includes(userIdInfo) || sauce.usersDisliked.includes(userIdInfo))) {
        // FIXME RESET USERS LIKES AND DISLIKES
        resetUserVote(sauce, userIdInfo)
        console.log("removing users who like or dislike")

      }
      else if (currentLikes === -1 && !sauce.usersDisliked.includes(userIdInfo)) {
        // FIXME RESET USERS LIKES AND DISLIKES
        resetUserVote(sauce, userIdInfo)
        console.log("disliking sauce")
        sauce.dislikes++
        sauce.usersDisliked.push(userIdInfo)
      }
      Sauce.updateOne({ _id: sauceId }, sauce).then(
        () => {
          res.status(201).json({
            message: 'Sauce liked successfully!'
          });
        }
      ).catch(
        (error) => {
          res.status(400).json({
            error: error.message
          });
        }
      );
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error.message
      });
    }
  );
};

// TODO DECLARE FUNCTION THE RESETS USERS LIKES AND DISLIKES
function resetUserVote(sauce, userIdInfo) {
  //TODO CHECK TO SEE IF USER IS IN USERS LIKED ARRAY
  if (sauce.usersLiked.includes(userIdInfo)) {
    sauce.likes--
    console.log('user has already liked sauce')
    sauce.usersLiked = sauce.usersLiked.filter(function (userId) {
      return userId !== userIdInfo;
    });
  }
  

  // IF SO THEN REMOVE THE USER ID FROM THE USERS LIKED ARRAY AND DECREASE THE USERS LIKED NUMBER BY 1
  // TODO REPEAT FOR DISLIKES 
  if (sauce.usersDisliked.includes(userIdInfo)) {
    sauce.dislikes--
    console.log('user has already Disliked sauce')
    sauce.usersDisliked = sauce.usersDisliked.filter(function (userId) {
      return userId !== userIdInfo;
    });
  }
}