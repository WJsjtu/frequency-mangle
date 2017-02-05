# frequency-mangle
A property/string mangle tools for javascript.

###Install
`npm install --save-dev frequency-mangle`

###How it works?
`frequency-mangle` analyze the code by using `esprima`.
`frequency-mangle` will get all the stats of properties or strings.

This is very useful when using Babel in development.

Babel will transform React jsx tags into `React.createElement`. If there are lots of tags, there will be hundreds of `createElement` in the bundle even if it is minfied.

Such problems also occurs when `Babel` transform ES6 Classes. Each ES6 Class will be transform according to template of Babel which contains a lot of strings like "this hasn't been initialised - super() hasn't been called", "Super expression must either be null or a function, not ", "__esModule" and etc.

Some properties or words are of high frequency in certain Apps. For example, we will write `this.setState`, `this.state`, `this.props` many times. `React.ProtoTypes` will also be used frequently. ES6 class methods will be transformed into properties of Object by Babel, so some string can also be seen frequently in bundles, such as `componentDidMount`, `componentWillUnmount` and etc.
  
`frequency-mangle` gather all the stats of such information and provide a chance to use variables to replace such words.

Simply it can be:
```
(function(){
    var a = "setState", b = "default", ...
    this[a]({...})..
    export[b] ...
})();
```

**Caution**: `frequency-mangle` may take a long time to mangle. Make sure you won't use it frequently on large bundles.
**Note**: `frequency-mangle` will create IIFE to wrap origin code. So do not use it on ES6 with `import` or other codes which may cause side-effect.