/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * The Mission model
 *
 * @author      TSCCODER
 * @version     1.0
 */

const mongoose = require('../datasource').getMongoose();
const _ = require('lodash');
const timestamps = require('mongoose-timestamp');
const enums = require('../enum');
const Address = require('./Address').AddressSchema;
const helper = require('../common/helper');

const Mixed = mongoose.Schema.Types.Mixed;
const Schema = mongoose.Schema;
const GallerySchema = new Schema({
  thumbnailUrl: String,
  videoUrl: String,
  imageUrl: String,
});

if (!GallerySchema.options.toObject) {
  GallerySchema.options.toObject = {};
}


GallerySchema.options.toObject.transform = function (doc, ret, options) {
  const sanitized = _.omit(ret, '__v', '_id');
  return sanitized;
};

// Region to Fly Zone (RTFZ)
const ZoneSchema = new Schema({
  location: {type: Mixed, required: true, index: '2dsphere'},
  description: String,
  // styles for google map
  style: {type: Mixed, default: {}},
});

const MissionSchema = new mongoose.Schema({
  missionName: { type: String, required: false },
  plannedHomePosition: { type: mongoose.Schema.Types.Mixed, required: false },
  missionItems: { type: mongoose.Schema.Types.Mixed, required: false },
  status: {type: String, enum: _.values(enums.MissionStatus), required: true},
  drone: {type: Schema.Types.ObjectId, required: false, ref: 'Drone'},
  provider: {type: Schema.Types.ObjectId, required: false, ref: 'Provider'},
  package: {type: Schema.Types.ObjectId, required: false, ref: 'Package'},
  pilot: {type: Schema.Types.ObjectId, required: false, ref: 'User'},
  startingPoint: {type: Address, required: false},
  destinationPoint: {type: Address, required: false},

  startedAt: Date,
  completedAt: Date,
  scheduledAt: Date,
  // the current drone real-time values
  telemetry: {
    lat: Number,
    long: Number,
    speed: Number,
    distance: Number,
  },


  eta: Number,
  frontCameraUrl: String,
  backCameraUrl: String,
  gallery: [GallerySchema],


  rating: {type: Number, default: 0}, // by consumer

  specialRequirements: [String],
  notes: String,

  // from package
  weight: Number,
  whatToBeDelivered: String,


  // by provider when the mission is waiting or in-progress status
  estimation: {
    launchTime: Date,
    speed: Number,
    distance: Number,
    time: Number,
  },

  // by provider after the mission completed
  result: {
    distance: {type: Number, default: 0},
    time: {type: Number, default: 0},
    avgSpeed: Number,
    maxSpeed: {type: Number, default: 0},
    minSpeed: {type: Number, default: 0},
  },

  zones: {
    type: [ZoneSchema],
    default: [],
  },
});

MissionSchema.plugin(timestamps);

if (!MissionSchema.options.toObject) {
  MissionSchema.options.toObject = {};
}

/**
 * Transform the given document to be sent to client
 *
 * @param  {Object}   doc         the document to transform
 * @param  {Object}   ret         the already converted object
 * @param  {Object}   options     the transform options
 */
MissionSchema.options.toObject.transform = function (doc, ret, options) { // eslint-disable-line no-unused-vars
  const sanitized = _.omit(ret, '__v', '_id', 'createdAt', 'updatedAt', 'package', 'pilot', 'drone');
  sanitized.startingPoint = _.omit(sanitized.startingPoint, '_id');
  sanitized.destinationPoint = _.omit(sanitized.destinationPoint, '_id');
  sanitized.id = doc._id;
  return sanitized;
};


module.exports = {
  MissionSchema,
};
