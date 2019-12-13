
Lit-element Webcomponent that communicate with evejs  https://scenaristeur.github.io/compagent-tuto/





# Based on Webpack Getting started

https://webpack.js.org/guides/getting-started/

```
mkdir compagent-tuto
cd compagent-tuto
npm init -y
npm install webpack webpack-cli --save-dev
touch index.html
mkdir src
cd src
touch index.js
cd ..
npm install --save lodash
```

https://github.com/scenaristeur/compagent-tuto/tree/6530d16fdbd77e34bf6c20000ac443cdbc7304dc

#Building
```
npm run build
```
--> evrything is bundled in /dist



# Building a compagent
```
npm install --save lit-element scenaristeur/evejs
```

# Add Lit-element
https://github.com/scenaristeur/compagent-tuto/tree/5634f6b4b188cb3e477b478d1ecafa60bac55322

# Add evejs communication
https://github.com/scenaristeur/compagent-tuto/tree/768e86946c82d04c109fe4dbc3a4754eb476f8b5


Now we can build our components

change my-element to app-element

![First elements](doc/images/compagent_first_elements.png)

Make an index.html & copy code of your /dist/index.html
then use filemanager to upload /dist/main-element.js
![Upload to POD](doc/images/upload_file_manager.png)

see it live on https://smag0.solid.community/public/compagent/tuto/00basic/

or https://scenaristeur.github.io/compagent-tuto/


# make a gh-pages branches
https://stackoverflow.com/questions/36782467/set-subdirectory-as-website-root-on-github-pages

git add dist && git commit -m "Initial dist subtree commit"

git subtree push --prefix dist origin gh-pages
