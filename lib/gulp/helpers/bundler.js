"use strict";

module.exports = function(bundles, _typeDir, _srcDir, _publicDir) {

  var makeBundle = function(bundle) {

    var type      = _typeDir.replace('/', ''),
        srcDir    = _srcDir + _typeDir,
        srcFile   = bundle.name + '.' + (type === 'css' ? 'scss' : type),
        destDir   = _publicDir + _typeDir,
        destFile  = bundle.name + '.' + type;

    return {
      src           : srcDir + srcFile,
      destPublicDir : destDir,
      destFile      : destFile,
      global        : bundle.global,
      compress      : bundle.compress,
      saveToDist    : bundle.saveToDist
    };
  };

  var pack = [];
  for (var i = 0; i < bundles.length; i++) {
    pack.push(makeBundle(bundles[i]));
  }
  return pack;

};