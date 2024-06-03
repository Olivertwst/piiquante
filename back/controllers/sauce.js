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
	Sauce.findOne({_id: req.params.id}).then((sauce) => {
		if (req.body.like === 1){
			sauce.usersLiked.push(req.body.userId);
			likeSauce = ({
				likes: ++sauce.likes,
				usersLiked: sauce.usersLiked,
			});
		} else if(req.body.like === -1) {
			likeSauce = ({
				$push: { usersDisliked: req.body.userId },
				$inc: { dislikes: +1 },
			});
		} else if (req.body.like === -0 && sauce.usersLiked.includes(req.body.userId)){
			likeSauce = ({
				$pull: { usersLiked: req.body.userId },
				$inc: { likes: -1 },
			});
		} else if (req.body.like === -0 && sauce.usersDisliked.includes(req.body.userId)){
			likeSauce = ({
				$pull: { usersDisliked: req.body.userId },
				$inc: { dislikes: -1 },
			});
		} else {
			console.log('Likes are being hacked!  Sweet');
			res.status(201).json({
				message: 'opps'
			});
		}
		Sauce.updateOne({_id: req.params.id}, likeSauce).then(()=> {
		
			res.status(201).json({
				message: 'Sauce updated'
			});
		}).catch((error) => {
			res.status(400).json({
				error: error
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