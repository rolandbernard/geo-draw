
const ghpages = require('gh-pages');

ghpages.publish('dist', { src: ['**/*', '.nojekyll'] }, function(err) {
    if(err) {
        console.log(err);
    }
});
