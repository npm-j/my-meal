const db = require('../db/db.js');

const Tag = module.exports;

// only to be used in db init function
// newTag is an object with: { tagName, restriction }
// tagName is a string, restriction is a boolean value
Tag.createTag = function (newTag) {
  return db.Tag.create(newTag);
};

Tag.findTagById = function (tagId) {
  return db.Tag.findById(tagId);
};

// event is a row in the table, tags is an array of tag ids
Tag.addTagsToEvent = function (event, tagIds) {
  return db.Tag.findAll({ where: { id: tagIds } })
    .then((tags) => {
      return event.setTags(tags)
        .then(() => event);
    });
};

Tag.removeTagFromEvent = function (tagId, eventId) {
  return;
};
