# Overview

Binderjs is am object-oriented property-binding API.

# Features

- Dynamic property dependency tracking
- EcmaScript-5-firendly list implementation
- Property binding with 'oneway' and 'twoway' behaviour

# Build System Requirements

- Ruby 1.9.2
- Rake
- Java for running jslint
- Bundler (only if you intend to run the Sinatra web app)


# Dependencies

**All dependencies are included with this project**

- [Utiljs](https://github.com/dschnare/utiljs) for common utilitiy functions.


# Support

Browsers will be added to the list as testing ensues:

- Chrome
- FireFox 8+
- Safari 5.1+
- IE 7/8/9/10
- Can be loaded as an [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) module
- Can be loaded as a [NodeJS](http://nodejs.org/docs/latest/api/modules.html)/[CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1) module

# Organization

The structure of this project follows my [template-javascript](https://github.com/dschnare/template-javascript) project. Rake is used as the build system to compile all JavaScript modules and to test all source files via [jslint](http://www.jslint.com/). To see all the Rake tasks run `rake -D`.

In the `web` directory you will find a simple [Sinatra](http://www.sinatrarb.com/) application that can be used for testing (although it isn't necessary since you can run the index.html page by opening it in your web browser).


# Installing

After installing the **Build System Requirements** you can install Sinatra and Foreman by running:

`bundle install`

To run the Sinatra application:

Unix/Linux: `foreman start`
Windows: `bundle exec ruby -Cweb app.rb -p 5000`

Then point your browser to [localhost:5000](http://localhost:5000/).


# Products

Inside the `web/public/inc/scripts` directory you will find the following files:

- util.min.js - Minified source of utiljs
- binder.js - Full source of the binderjs module
- binder.min.js - Minified source of the binderjs module
- binder.all.js - Full source of the binderjs module that has utiljs baked-in
- binder.all.min.js - Minified source of the binderjs module that has utiljs baked-in