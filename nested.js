// for when you have to reference imported function *within* the import
var internal = module.exports = {b}; 

function a (param){
  // does stuff
  return true;
}

function b (params){
  // does other stuff
  return false;
}

function c (params){
  return internal.b(params);
}

module.exports = {a, b, c};