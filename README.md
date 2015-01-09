# redebug
tiny wrapper that patches in support for dynamic configurability of visionmedia/debug.

easy as 1, 2 ,3.

1. install
    npm install redebug

2. require
    require('redebug')

3. debug
    var debug = require('debug')('redebug:test')
    debug('you can turn me on and off at runtime!')


redebug adds the ability to turn debug namespaces on and off without having to restart your app. It also task some reflection onto debug so you can see all of the namespaces attached to the global debug instance. i wrote it because (a) i got tired of having to kill and restart my app in order to turn on debugging for a particular library and (b) as my projects got bigger i had a harder time of keeping track of which namespaces i needed to debug certain issues. this little wrapper allowed me to build an admin page into my app that lets me view and toggle any of the debug namespaces in my app dynamically.

**Note: redebug replaces the cached 'debug' module in node. any instances of debug acquired before requiring redebug will not be dynamically configurable.
