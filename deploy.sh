DEST=git@github.com:puyo/myoon.git
npm run build
cd public
git init
git add .
git commit -m "GH pages deploy"
git push --force --quiet "${DEST}" master:gh-pages > /dev/null 2>&1
cd ..
