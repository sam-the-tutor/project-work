
const express = require('express');
const router = express.Router();
const _ = require('lodash')
var ps = require('current-processes');
 






router.get('/', (req, res, next) => {
    try{

	ps.get(function(err, processes) {
 
    var sorted = _.sortBy(processes, 'cpu');
    var top8  = sorted.reverse().splice(0, 50);

    //console.log(top8);
    res.render('status',{top8:top8});
});
    }
catch(error){
    console.log("errorr",error)
}
 

});

module.exports = router